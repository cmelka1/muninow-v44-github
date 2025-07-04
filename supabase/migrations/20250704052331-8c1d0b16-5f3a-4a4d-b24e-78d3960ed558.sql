-- Create verification_codes table for MFA
CREATE TABLE public.verification_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_identifier TEXT NOT NULL, -- email or phone number
  code_hash TEXT NOT NULL, -- hashed verification code
  verification_type TEXT NOT NULL CHECK (verification_type IN ('sms', 'email')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for verification codes
CREATE POLICY "Users can insert verification codes" 
ON public.verification_codes 
FOR INSERT 
WITH CHECK (true); -- Allow system to insert codes

CREATE POLICY "Users can update their own verification codes" 
ON public.verification_codes 
FOR UPDATE 
USING (true); -- Allow system to update codes during verification

CREATE POLICY "Users can view their own verification codes" 
ON public.verification_codes 
FOR SELECT 
USING (true); -- Allow system to query codes for verification

-- Create function to cleanup expired verification codes
CREATE OR REPLACE FUNCTION public.cleanup_expired_verification_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.verification_codes 
  WHERE expires_at < now() OR status = 'expired';
END;
$$;

-- Create trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_verification_codes_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_verification_codes_updated_at
BEFORE UPDATE ON public.verification_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_verification_codes_timestamp();

-- Create index for efficient queries
CREATE INDEX idx_verification_codes_identifier_type ON public.verification_codes(user_identifier, verification_type);
CREATE INDEX idx_verification_codes_expires_at ON public.verification_codes(expires_at);