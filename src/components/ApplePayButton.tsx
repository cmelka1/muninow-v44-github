import React, { useState, useEffect } from 'react';
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
}

const ApplePayButton: React.FC<ApplePayButtonProps> = ({
  onPayment,
  totalAmount,
  merchantId,
  isDisabled = false
}) => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Check if Apple Pay is available
    const checkAvailability = () => {
      if (typeof window === 'undefined') {
        return false;
      }

      // Check if ApplePaySession exists and browser supports it
      if (!window.ApplePaySession) {
        console.log('🍎 Apple Pay not supported - ApplePaySession not available');
        return false;
      }

      // Check if the device can make Apple Pay payments
      if (!window.ApplePaySession.canMakePayments()) {
        console.log('🍎 Apple Pay not available - Device cannot make payments');
        return false;
      }

      console.log('🍎 Apple Pay is available');
      return true;
    };

    setIsAvailable(checkAvailability());
  }, []);

  const handleClick = async () => {
    if (isDisabled || isProcessing) {
      return;
    }

    try {
      setIsProcessing(true);
      console.log('🍎 Apple Pay button clicked');
      await onPayment();
    } catch (error) {
      console.error('🍎 Apple Pay error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Don't render if Apple Pay is not available
  if (!isAvailable) {
    return null;
  }

  return (
    <div className="relative w-full">
      <apple-pay-button
        buttonstyle="black"
        type="plain"
        locale="en"
        onClick={handleClick}
        style={{
          width: '100%',
          height: '44px',
          borderRadius: '4px',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          opacity: isDisabled ? 0.5 : 1,
          pointerEvents: isDisabled ? 'none' : 'auto'
        }}
      />
      
      {isProcessing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded">
          <Loader2 className="h-5 w-5 animate-spin text-white" />
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
