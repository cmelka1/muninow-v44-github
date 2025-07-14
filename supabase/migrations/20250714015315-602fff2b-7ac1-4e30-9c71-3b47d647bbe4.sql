-- Create bill_notifications table
CREATE TABLE public.bill_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_id UUID NOT NULL,
  user_id UUID,
  municipal_user_id UUID NOT NULL,
  merchant_id UUID,
  customer_id UUID NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('manual', 'issued', 'overdue', 'delinquent')),
  delivery_method TEXT NOT NULL CHECK (delivery_method IN ('email', 'sms', 'both', 'in_person_visit')),
  message_subject TEXT,
  message_body TEXT,
  visit_notes TEXT,
  municipal_employee_name TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivery_status TEXT NOT NULL DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'failed', 'completed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bill_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Municipal users can view notifications for their customer bills"
ON public.bill_notifications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.account_type = 'municipal' 
    AND profiles.customer_id = bill_notifications.customer_id
  )
);

CREATE POLICY "Municipal users can insert notifications for their customer bills"
ON public.bill_notifications
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.account_type = 'municipal' 
    AND profiles.customer_id = bill_notifications.customer_id
  )
);

CREATE POLICY "Users can view their own bill notifications"
ON public.bill_notifications
FOR SELECT
USING (user_id = auth.uid());

-- Add foreign key constraints
ALTER TABLE public.bill_notifications 
ADD CONSTRAINT fk_bill_notifications_bill_id 
FOREIGN KEY (bill_id) REFERENCES public.master_bills(bill_id) ON DELETE CASCADE;

ALTER TABLE public.bill_notifications 
ADD CONSTRAINT fk_bill_notifications_municipal_user_id 
FOREIGN KEY (municipal_user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.bill_notifications 
ADD CONSTRAINT fk_bill_notifications_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.bill_notifications 
ADD CONSTRAINT fk_bill_notifications_customer_id 
FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX idx_bill_notifications_bill_id ON public.bill_notifications(bill_id);
CREATE INDEX idx_bill_notifications_user_id ON public.bill_notifications(user_id);
CREATE INDEX idx_bill_notifications_customer_id ON public.bill_notifications(customer_id);
CREATE INDEX idx_bill_notifications_created_at ON public.bill_notifications(created_at DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_bill_notifications_updated_at
  BEFORE UPDATE ON public.bill_notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger function for automatic notifications on bill status changes
CREATE OR REPLACE FUNCTION public.trigger_bill_status_notifications()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only trigger for specific status changes
  IF OLD.bill_status IS DISTINCT FROM NEW.bill_status THEN
    -- Check if this is a relevant status change
    IF NEW.bill_status IN ('overdue', 'delinquent') OR 
       (OLD.bill_status IS NULL AND NEW.bill_status = 'unpaid') THEN
      
      -- Insert notification record for automatic processing
      INSERT INTO public.bill_notifications (
        bill_id,
        user_id,
        municipal_user_id,
        merchant_id,
        customer_id,
        notification_type,
        delivery_method,
        delivery_status,
        created_at
      )
      SELECT 
        NEW.bill_id,
        NEW.user_id,
        -- Get a municipal admin for this customer as the sender
        (SELECT id FROM public.profiles 
         WHERE customer_id = NEW.customer_id 
         AND account_type = 'municipal' 
         LIMIT 1),
        NEW.merchant_id,
        NEW.customer_id,
        CASE 
          WHEN NEW.bill_status = 'overdue' THEN 'overdue'
          WHEN NEW.bill_status = 'delinquent' THEN 'delinquent'
          ELSE 'issued'
        END,
        'both', -- Default to both email and SMS
        'pending',
        now()
      WHERE NEW.user_id IS NOT NULL;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for bill status changes
CREATE TRIGGER bill_status_notification_trigger
  AFTER UPDATE ON public.master_bills
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_bill_status_notifications();