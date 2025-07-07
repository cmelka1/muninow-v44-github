-- Create unified organization management system

-- Create organization invitations table
CREATE TABLE public.organization_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_admin_id UUID NOT NULL,
  invitation_email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  organization_type TEXT NOT NULL CHECK (organization_type IN ('resident', 'business', 'municipal')),
  invitation_token TEXT,
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  activated_at TIMESTAMP WITH TIME ZONE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked', 'expired')),
  old_tokens TEXT[] DEFAULT '{}',
  
  UNIQUE(organization_admin_id, invitation_email, organization_type)
);

-- Create organization memberships table
CREATE TABLE public.organization_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_admin_id UUID NOT NULL,
  member_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  organization_type TEXT NOT NULL CHECK (organization_type IN ('resident', 'business', 'municipal')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  
  UNIQUE(organization_admin_id, member_id, organization_type)
);

-- Enable RLS
ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_memberships ENABLE ROW LEVEL SECURITY;

-- RLS policies for organization_invitations
CREATE POLICY "Organization admins can manage invitations"
ON public.organization_invitations
FOR ALL
USING (auth.uid() = organization_admin_id);

CREATE POLICY "Invited users can view their invitations"
ON public.organization_invitations
FOR SELECT
USING (
  invitation_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- RLS policies for organization_memberships
CREATE POLICY "Organization admins can manage memberships"
ON public.organization_memberships
FOR ALL
USING (auth.uid() = organization_admin_id);

CREATE POLICY "Members can view their organization"
ON public.organization_memberships
FOR SELECT
USING (auth.uid() = member_id);

-- Create organization management functions
CREATE OR REPLACE FUNCTION public.is_in_same_organization(user_a UUID, user_b UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user_a is admin and user_b is member
  IF EXISTS (
    SELECT 1 FROM public.organization_memberships 
    WHERE organization_admin_id = user_a 
    AND member_id = user_b
    AND status = 'active'
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user_b is admin and user_a is member
  IF EXISTS (
    SELECT 1 FROM public.organization_memberships 
    WHERE organization_admin_id = user_b 
    AND member_id = user_a
    AND status = 'active'
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Check if both users are members of the same organization admin
  IF EXISTS (
    SELECT 1 FROM public.organization_memberships a
    JOIN public.organization_memberships b ON a.organization_admin_id = b.organization_admin_id
    WHERE a.member_id = user_a
    AND b.member_id = user_b
    AND a.status = 'active'
    AND b.status = 'active'
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Users are the same
  IF user_a = user_b THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_organization_members(user_id UUID)
RETURNS TABLE(
  id UUID,
  member_id UUID,
  role TEXT,
  organization_type TEXT,
  joined_at TIMESTAMP WITH TIME ZONE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    om.id,
    om.member_id,
    om.role,
    om.organization_type,
    om.joined_at,
    p.first_name,
    p.last_name,
    p.email,
    p.phone
  FROM public.organization_memberships om
  JOIN public.profiles p ON p.id = om.member_id
  WHERE om.organization_admin_id = user_id
    AND om.status = 'active'
  ORDER BY om.joined_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_organization_invitation(
  p_invitation_email TEXT,
  p_role TEXT,
  p_organization_type TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invitation_id UUID;
  admin_profile public.profiles%ROWTYPE;
BEGIN
  -- Get admin profile to verify account type matches
  SELECT * INTO admin_profile
  FROM public.profiles
  WHERE id = auth.uid();
  
  -- Verify admin account type matches organization type
  IF admin_profile.account_type != p_organization_type THEN
    RAISE EXCEPTION 'Admin account type must match organization type';
  END IF;
  
  -- Create invitation
  INSERT INTO public.organization_invitations (
    organization_admin_id,
    invitation_email,
    role,
    organization_type,
    invitation_token,
    expires_at
  )
  VALUES (
    auth.uid(),
    p_invitation_email,
    p_role,
    p_organization_type,
    gen_random_uuid()::TEXT,
    now() + INTERVAL '7 days'
  )
  RETURNING id INTO invitation_id;
  
  RETURN invitation_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.accept_organization_invitation(
  p_invitation_token TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invitation_record public.organization_invitations%ROWTYPE;
  user_email TEXT;
BEGIN
  -- Get user email
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = auth.uid();
  
  -- Get invitation
  SELECT * INTO invitation_record
  FROM public.organization_invitations
  WHERE invitation_token = p_invitation_token
    AND invitation_email = user_email
    AND status = 'pending'
    AND expires_at > now();
  
  IF invitation_record.id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Create membership
  INSERT INTO public.organization_memberships (
    organization_admin_id,
    member_id,
    role,
    organization_type
  )
  VALUES (
    invitation_record.organization_admin_id,
    auth.uid(),
    invitation_record.role,
    invitation_record.organization_type
  )
  ON CONFLICT (organization_admin_id, member_id, organization_type) DO NOTHING;
  
  -- Mark invitation as accepted
  UPDATE public.organization_invitations
  SET status = 'accepted', activated_at = now()
  WHERE id = invitation_record.id;
  
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_available_payment_methods(user_id UUID)
RETURNS SETOF payment_methods
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_account_type TEXT;
BEGIN
  -- Get user's account type
  SELECT account_type INTO user_account_type
  FROM public.profiles
  WHERE id = user_id;
  
  -- For resident accounts, share payment methods within organization
  IF user_account_type = 'resident' THEN
    RETURN QUERY
    SELECT pm.*
    FROM public.payment_methods pm
    WHERE pm.enabled = true
      AND pm.account_type = 'resident'
      AND (pm.user_id = user_id OR public.is_in_same_organization(user_id, pm.user_id))
    ORDER BY pm.is_default DESC, pm.created_at DESC;
  ELSE
    -- For business/municipal accounts, only return user's own payment methods
    RETURN QUERY
    SELECT pm.*
    FROM public.payment_methods pm
    WHERE pm.user_id = user_id
      AND pm.enabled = true
    ORDER BY pm.is_default DESC, pm.created_at DESC;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_available_vehicles(user_id UUID)
RETURNS SETOF vehicles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_account_type TEXT;
BEGIN
  -- Get user's account type
  SELECT account_type INTO user_account_type
  FROM public.profiles
  WHERE id = user_id;
  
  -- For resident accounts, share vehicles within organization
  IF user_account_type = 'resident' THEN
    RETURN QUERY
    SELECT v.*
    FROM public.vehicles v
    WHERE v.user_id = user_id OR public.is_in_same_organization(user_id, v.user_id)
    ORDER BY v.created_at DESC;
  ELSE
    -- For business/municipal accounts, only return user's own vehicles
    RETURN QUERY
    SELECT v.*
    FROM public.vehicles v
    WHERE v.user_id = user_id
    ORDER BY v.created_at DESC;
  END IF;
END;
$$;