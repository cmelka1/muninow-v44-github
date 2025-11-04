import React from 'react';
import GooglePayButton from './GooglePayButton';
import ApplePayButton from './ApplePayButton';

interface PaymentButtonsContainerProps {
  totalAmount: number;
  merchantId: string;
  isDisabled?: boolean;
  onGooglePayment: () => Promise<void>;
  onApplePayment: () => Promise<void>;
}

const PaymentButtonsContainer: React.FC<PaymentButtonsContainerProps> = ({
  totalAmount,
  merchantId,
  isDisabled = false,
  onGooglePayment,
  onApplePayment
}) => {
  return (
    <div className="space-y-3 w-full">
      <div className="text-sm text-muted-foreground text-center mb-2">
        Express Checkout
      </div>
      
      <GooglePayButton
        onPayment={onGooglePayment}
        totalAmount={totalAmount}
        merchantId={merchantId}
        isDisabled={isDisabled}
      />
      
      <ApplePayButton
        onPayment={onApplePayment}
        totalAmount={totalAmount}
        merchantId={merchantId}
        isDisabled={isDisabled}
      />
      
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or pay with card
          </span>
        </div>
      </div>
    </div>
  );
};

export default PaymentButtonsContainer;