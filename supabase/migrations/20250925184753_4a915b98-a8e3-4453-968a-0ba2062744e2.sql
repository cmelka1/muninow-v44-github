-- Fix the create_tax_submission_before_payment function to include total_amount_cents
CREATE OR REPLACE FUNCTION public.create_tax_submission_before_payment(
  p_user_id uuid,
  p_customer_id uuid,
  p_merchant_id uuid,
  p_tax_type text,
  p_tax_period_start date,
  p_tax_period_end date,
  p_tax_year integer,
  p_amount_cents bigint,
  p_calculation_notes text,
  p_total_amount_due_cents bigint,
  p_staging_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tax_submission_id uuid;
  existing_draft_id uuid;
  result jsonb;
BEGIN
  -- First cleanup old abandoned drafts (older than 2 hours)
  DELETE FROM public.tax_submissions
  WHERE submission_status = 'draft'
    AND payment_status = 'pending'
    AND created_at < now() - INTERVAL '2 hours';

  -- Check for existing draft for same user, tax type, and period
  SELECT id INTO existing_draft_id
  FROM public.tax_submissions
  WHERE user_id = p_user_id
    AND tax_type = p_tax_type
    AND tax_period_start = p_tax_period_start
    AND tax_period_end = p_tax_period_end
    AND submission_status = 'draft'
    AND payment_status = 'pending'
  LIMIT 1;

  -- If existing draft found, delete it to create fresh one
  IF existing_draft_id IS NOT NULL THEN
    DELETE FROM public.tax_submissions WHERE id = existing_draft_id;
  END IF;

  -- Create new tax submission
  INSERT INTO public.tax_submissions (
    user_id,
    customer_id,
    merchant_id,
    tax_type,
    tax_period_start,
    tax_period_end,
    tax_year,
    amount_cents,
    calculation_notes,
    total_amount_due_cents,
    total_amount_cents,
    submission_status,
    payment_status,
    submission_date
  ) VALUES (
    p_user_id,
    p_customer_id,
    p_merchant_id,
    p_tax_type,
    p_tax_period_start,
    p_tax_period_end,
    p_tax_year,
    p_amount_cents,
    p_calculation_notes,
    p_total_amount_due_cents,
    p_total_amount_due_cents, -- Set total_amount_cents to same as total_amount_due_cents for draft
    'draft',
    'pending',
    now()
  ) RETURNING id INTO v_tax_submission_id;

  -- Link any staged documents to this submission
  IF p_staging_id IS NOT NULL THEN
    UPDATE public.tax_submission_documents
    SET tax_submission_id = v_tax_submission_id,
        status = 'confirmed'
    WHERE staging_id = p_staging_id
      AND status = 'staged';
  END IF;

  -- Return success with ID
  result := jsonb_build_object(
    'success', true,
    'tax_submission_id', v_tax_submission_id
  );

  RETURN result;

EXCEPTION
  WHEN OTHERS THEN
    -- Return error details
    result := jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'error_code', SQLSTATE
    );
    RETURN result;
END;
$$;

-- Create standalone cleanup function for scheduled use if needed
CREATE OR REPLACE FUNCTION public.cleanup_abandoned_tax_drafts(p_hours_threshold integer DEFAULT 2)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count integer;
BEGIN
  -- Delete abandoned draft tax submissions and return count
  WITH deleted_submissions AS (
    DELETE FROM public.tax_submissions
    WHERE submission_status = 'draft'
      AND payment_status = 'pending'
      AND created_at < now() - (p_hours_threshold || ' hours')::INTERVAL
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted_submissions;

  RETURN deleted_count;
END;
$$;