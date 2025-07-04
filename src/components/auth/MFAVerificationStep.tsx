import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, MessageSquare, Shield, Check, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type VerificationType = 'email' | 'sms';

interface MFAVerificationStepProps {
  formData: any;
  onBack: () => void;
  onVerificationComplete: () => void;
  isCreatingAccount: boolean;
}

export const MFAVerificationStep: React.FC<MFAVerificationStepProps> = ({
  formData,
  onBack,
  onVerificationComplete,
  isCreatingAccount
}) => {
  const [step, setStep] = useState<'selection' | 'verification'>('selection');
  const [verificationType, setVerificationType] = useState<VerificationType>('email');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verificationSent, setVerificationSent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(formData?.mobileNumber || '');
  const [emailAddress, setEmailAddress] = useState(formData?.email || '');
  const [isEditingContact, setIsEditingContact] = useState(false);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const sendVerificationCode = async () => {
    setIsSending(true);
    try {
      const identifier = verificationType === 'email' ? emailAddress : phoneNumber;
      
      const { data } = await supabase.functions.invoke('send-verification', {
        body: {
          identifier,
          type: verificationType,
          action: 'send'
        }
      });

      if (data?.success) {
        toast({
          title: "Verification code sent",
          description: `Please check your ${verificationType === 'email' ? 'email' : 'text messages'} for the verification code.`
        });
        setVerificationSent(true);
        setStep('verification');
        setResendCooldown(60);
      } else {
        throw new Error(data?.error || 'Failed to send verification code');
      }
    } catch (error: any) {
      console.error('Error sending verification code:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send verification code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const verifyCode = async () => {
    const code = verificationCode.join('');
    if (code.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter the complete 6-digit code.",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    try {
      const identifier = verificationType === 'email' ? emailAddress : phoneNumber;
      
      const { data } = await supabase.functions.invoke('send-verification', {
        body: {
          identifier,
          type: verificationType,
          action: 'verify',
          code
        }
      });

      if (data?.success) {
        toast({
          title: "Verification successful",
          description: "Your identity has been verified successfully."
        });
        onVerificationComplete();
      } else {
        throw new Error(data?.error || 'Verification failed');
      }
    } catch (error: any) {
      console.error('Error verifying code:', error);
      toast({
        title: "Verification failed",
        description: error.message || "Invalid verification code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent pasting long strings
    
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }

    // Auto-verify when all 6 digits are entered
    if (newCode.every(digit => digit !== '') && newCode.join('').length === 6) {
      setTimeout(() => verifyCode(), 100);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const formatPhoneDisplay = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const maskEmail = (email: string) => {
    const [local, domain] = email.split('@');
    const maskedLocal = local.length > 2 
      ? `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}`
      : local;
    return `${maskedLocal}@${domain}`;
  };

  const maskPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ***-${cleaned.slice(6)}`;
    }
    return phone;
  };

  if (step === 'selection') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Multi-Factor Authentication
          </h3>
          <p className="text-muted-foreground">
            Choose how you'd like to receive your verification code for enhanced security
          </p>
        </div>

        <div className="space-y-4">
          <Label className="text-base font-medium">Verification Method</Label>
          <div className="space-y-3">
            <div 
              className={`flex items-center justify-between space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer ${
                verificationType === 'email' ? 'border-primary bg-primary/5' : 'border-border'
              }`}
              onClick={() => setVerificationType('email')}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  verificationType === 'email' ? 'border-primary' : 'border-muted-foreground'
                }`}>
                  {verificationType === 'email' && (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-primary" />
                    <Label className="font-medium cursor-pointer">
                      Email Verification
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Send code to {emailAddress}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingContact(true);
                }}
                className="text-xs"
              >
                Change
              </Button>
            </div>

            <div 
              className={`flex items-center justify-between space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer ${
                verificationType === 'sms' ? 'border-primary bg-primary/5' : 'border-border'
              }`}
              onClick={() => setVerificationType('sms')}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  verificationType === 'sms' ? 'border-primary' : 'border-muted-foreground'
                }`}>
                  {verificationType === 'sms' && (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <Label className="font-medium cursor-pointer">
                      SMS Verification
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Send code to {formatPhoneDisplay(phoneNumber)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingContact(true);
                }}
                className="text-xs"
              >
                Change
              </Button>
            </div>
          </div>

          {/* Contact editing section */}
          {isEditingContact && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">
                  Edit {verificationType === 'email' ? 'Email Address' : 'Phone Number'}
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingContact(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
              </div>

              {verificationType === 'email' ? (
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email Address</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="Enter email address"
                    className="h-11"
                  />
                  <p className="text-sm text-muted-foreground">
                    Make sure you have access to this email address
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone Number</Label>
                  <Input
                    id="edit-phone"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="h-11"
                  />
                  <p className="text-sm text-muted-foreground">
                    Standard messaging rates may apply
                  </p>
                </div>
              )}

              <Button
                onClick={() => setIsEditingContact(false)}
                className="w-full"
                disabled={verificationType === 'email' ? !emailAddress : !phoneNumber}
              >
                Save {verificationType === 'email' ? 'Email' : 'Phone Number'}
              </Button>
            </div>
          )}

          {/* Show phone input for SMS when not editing */}
          {verificationType === 'sms' && !isEditingContact && (
            <div className="space-y-2">
              <Label htmlFor="phone">Confirm Phone Number</Label>
              <Input
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="(555) 123-4567"
                className="h-11"
              />
              <p className="text-sm text-muted-foreground">
                Standard messaging rates may apply
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1"
            disabled={isSending}
          >
            Back
          </Button>
          
          <Button
            onClick={sendVerificationCode}
            className="flex-1"
            disabled={isSending || (verificationType === 'sms' && !phoneNumber)}
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Sending...
              </>
            ) : (
              `Send ${verificationType === 'email' ? 'Email' : 'SMS'} Code`
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          {verificationType === 'email' ? (
            <Mail className="h-8 w-8 text-primary" />
          ) : (
            <MessageSquare className="h-8 w-8 text-primary" />
          )}
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Enter Verification Code
        </h3>
        <p className="text-muted-foreground">
          We've sent a 6-digit code to{' '}
          {verificationType === 'email' 
            ? maskEmail(emailAddress)
            : maskPhone(phoneNumber)
          }
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-center space-x-2">
          {verificationCode.map((digit, index) => (
            <Input
              key={index}
              id={`code-${index}`}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleCodeChange(index, e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-12 text-center text-lg font-mono"
              autoComplete="off"
            />
          ))}
        </div>

        <div className="text-center">
          <Button
            variant="link"
            onClick={sendVerificationCode}
            disabled={resendCooldown > 0 || isSending}
            className="text-sm"
          >
            {resendCooldown > 0 ? (
              `Resend code in ${resendCooldown}s`
            ) : isSending ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                Sending...
              </>
            ) : (
              'Resend code'
            )}
          </Button>
        </div>

        <div className="bg-muted/20 p-4 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Didn't receive the code?</p>
              <ul className="space-y-1 text-xs">
                <li>• Check your spam/junk folder</li>
                <li>• Ensure your {verificationType === 'email' ? 'email' : 'phone'} is correct</li>
                <li>• Wait a few minutes for delivery</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => setStep('selection')}
          className="flex-1"
          disabled={isVerifying || isCreatingAccount}
        >
          Change Method
        </Button>
        
        <Button
          onClick={verifyCode}
          className="flex-1"
          disabled={isVerifying || isCreatingAccount || verificationCode.some(digit => !digit)}
        >
          {isVerifying ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Verifying...
            </>
          ) : isCreatingAccount ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Creating Account...
            </>
          ) : (
            'Verify & Continue'
          )}
        </Button>
      </div>
    </div>
  );
};