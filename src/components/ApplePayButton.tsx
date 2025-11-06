import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

// Declare apple-pay-button custom element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'apple-pay-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        buttonstyle?: string;
        type?: string;
        locale?: string;
      };
    }
  }
}

interface ApplePayButtonProps {
  onPayment: () => Promise<any>;
  totalAmount: number;
  merchantId: string;
  isDisabled?: boolean;
  onAvailabilityChange?: (isAvailable: boolean) => void;
}

const ApplePayButton: React.FC<ApplePayButtonProps> = ({
  onPayment,
  totalAmount,
  merchantId,
  isDisabled = false,
  onAvailabilityChange
}) => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const btnRef = useRef<HTMLElement | null>(null);

  const safeHandleClick = useCallback(async () => {
    console.log('🍎 [ApplePayButton] ========================================');
    console.log('🍎 [ApplePayButton] Button clicked');
    console.log('🍎 [ApplePayButton] ========================================');
    console.log('🍎 [ApplePayButton] Merchant ID:', merchantId);
    console.log('🍎 [ApplePayButton] Amount:', totalAmount);
    console.log('🍎 [ApplePayButton] Is Disabled:', isDisabled);
    console.log('🍎 [ApplePayButton] Is Processing:', isProcessing);
    
    if (isDisabled) {
      console.log('🍎 [ApplePayButton] ⚠️ Button is disabled - ignoring click');
      return;
    }
    if (isProcessing) {
      console.log('🍎 [ApplePayButton] ⚠️ Payment already processing - ignoring click');
      return;
    }
    try {
      setIsProcessing(true);
      console.log('🍎 [ApplePayButton] ▶️ Starting payment flow...');
      const paymentStart = Date.now();
      
      await onPayment();
      
      const paymentDuration = Date.now() - paymentStart;
      console.log('🍎 [ApplePayButton] ✅ Payment completed');
      console.log('🍎 [ApplePayButton] Duration:', `${paymentDuration}ms`);
    } catch (error) {
      console.error('🍎 [ApplePayButton] ❌ Payment error:', error);
      console.error('🍎 [ApplePayButton] Error details:', JSON.stringify(error, null, 2));
    } finally {
      setIsProcessing(false);
      console.log('🍎 [ApplePayButton] Payment flow ended');
    }
  }, [isDisabled, isProcessing, merchantId, totalAmount, onPayment]);

  useEffect(() => {
    const el = btnRef.current;
    if (!el) return;
    
    const clickHandler = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      void safeHandleClick();
    };
    
    el.addEventListener('click', clickHandler);
    
    return () => {
      el.removeEventListener('click', clickHandler);
    };
  }, [safeHandleClick]);

  useEffect(() => {
    // Check if Apple Pay is available
    const checkAvailability = async () => {
      console.log('🍎 [ApplePayButton] Starting availability check...');
      console.log('🍎 [ApplePayButton] Merchant ID:', merchantId);
      console.log('🍎 [ApplePayButton] Total Amount:', totalAmount);
      
      setIsLoading(true);
      
      if (typeof window === 'undefined') {
        console.log('🍎 [ApplePayButton] ❌ Window is undefined (SSR)');
        setIsLoading(false);
        setIsAvailable(false);
        onAvailabilityChange?.(false);
        return;
      }

      // Check if ApplePaySession exists and browser supports it
      if (!window.ApplePaySession) {
        console.log('🍎 [ApplePayButton] ❌ ApplePaySession not available');
        console.log('🍎 [ApplePayButton] User Agent:', navigator.userAgent);
        console.log('🍎 [ApplePayButton] Platform:', navigator.platform);
        setIsLoading(false);
        setIsAvailable(false);
        onAvailabilityChange?.(false);
        return;
      }

      console.log('🍎 [ApplePayButton] ✅ ApplePaySession exists');
      const supportsV3 = (window.ApplePaySession as any).supportsVersion ? (window.ApplePaySession as any).supportsVersion(3) : true;
      console.log('🍎 [ApplePayButton] ApplePaySession version:', supportsV3 ? '3+' : 'Unknown');

      // Check if the device can make Apple Pay payments
      const canMakePayments = window.ApplePaySession.canMakePayments();
      console.log('🍎 [ApplePayButton] canMakePayments:', canMakePayments);
      
      if (!canMakePayments) {
        console.log('🍎 [ApplePayButton] ❌ Device cannot make payments');
        console.log('🍎 [ApplePayButton] This usually means:');
        console.log('🍎 [ApplePayButton]   - No Apple Pay cards configured');
        console.log('🍎 [ApplePayButton]   - Device doesn\'t support Apple Pay');
        console.log('🍎 [ApplePayButton]   - Not on Safari/iOS');
        setIsLoading(false);
        setIsAvailable(false);
        onAvailabilityChange?.(false);
        return;
      }

      console.log('🍎 [ApplePayButton] ✅ Apple Pay is available and ready');
      setIsLoading(false);
      setIsAvailable(true);
      onAvailabilityChange?.(true);
    };

    checkAvailability();
  }, [onAvailabilityChange, merchantId, totalAmount]);

  // Show loading state while checking availability
  if (isLoading) {
    return (
      <div className="w-full h-[44px] flex items-center justify-center bg-muted rounded border border-border">
        <Loader2 className="h-4 w-4 animate-spin mr-2 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Checking Apple Pay availability...</span>
      </div>
    );
  }

  // Don't render if Apple Pay is not available
  if (!isAvailable) {
    return null;
  }

  return (
    <div
      className="relative w-full"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !isDisabled && !isProcessing) {
          e.preventDefault();
          void safeHandleClick();
        }
      }}
      aria-disabled={isDisabled || isProcessing}
      aria-label="Pay with Apple Pay"
    >
      <apple-pay-button
        ref={btnRef as any}
        buttonstyle="black"
        type="plain"
        locale="en"
        style={{
          width: '100%',
          height: '44px',
          borderRadius: '4px',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          opacity: isDisabled ? 0.5 : 1,
          pointerEvents: isDisabled ? 'none' : 'auto',
          display: 'inline-block'
        }}
      />
      
      {isProcessing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded">
          <Loader2 className="h-5 w-5 animate-spin text-white" />
        </div>
      )}
      
      {isDisabled && !isProcessing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded pointer-events-none">
          <span className="text-xs text-white">Loading payment information...</span>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
          apple-pay-button {
            --apple-pay-button-width: 100%;
            --apple-pay-button-height: 44px;
            --apple-pay-button-border-radius: 4px;
            --apple-pay-button-padding: 0px;
            --apple-pay-button-box-sizing: border-box;
          }
        `
      }} />
    </div>
  );
};

export default ApplePayButton;
