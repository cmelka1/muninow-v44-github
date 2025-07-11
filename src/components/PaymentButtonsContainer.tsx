import React, { useState, useEffect } from 'react';
import GooglePayButton from './GooglePayButton';
import ApplePayButton from './ApplePayButton';

interface PaymentButtonsContainerProps {
  bill: any;
  totalAmount: number;
  merchantId: string;
  isDisabled?: boolean;
  onGooglePayment: () => Promise<void>;
  onApplePayment: () => Promise<void>;
}

const PaymentButtonsContainer: React.FC<PaymentButtonsContainerProps> = ({
  bill,
  totalAmount,
  merchantId,
  isDisabled = false,
  onGooglePayment,
  onApplePayment
}) => {
  const [isGooglePayReady, setIsGooglePayReady] = useState(false);
  const [isApplePayReady, setIsApplePayReady] = useState(false);
  const [isGooglePayLoading, setIsGooglePayLoading] = useState(true);
  const [isApplePayLoading, setIsApplePayLoading] = useState(true);

  // Check Google Pay availability
  useEffect(() => {
    const checkGooglePayAvailability = async () => {
      try {
        if (!window.google?.payments?.api) {
          setIsGooglePayLoading(false);
          return;
        }

        const paymentsClient = new window.google.payments.api.PaymentsClient({
          environment: 'TEST'
        });

        const isReadyToPayRequest = {
          apiVersion: 2,
          apiVersionMinor: 0,
          allowedPaymentMethods: [{
            type: 'CARD' as const,
            parameters: {
              allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
              allowedCardNetworks: ['AMEX', 'DISCOVER', 'INTERAC', 'JCB', 'MASTERCARD', 'VISA']
            }
          }]
        };

        const response = await paymentsClient.isReadyToPay(isReadyToPayRequest);
        setIsGooglePayReady(response.result);
      } catch (error) {
        console.error('Error checking Google Pay availability:', error);
        setIsGooglePayReady(false);
      } finally {
        setIsGooglePayLoading(false);
      }
    };

    checkGooglePayAvailability();
  }, []);

  // Check Apple Pay availability
  useEffect(() => {
    const checkApplePayAvailability = async () => {
      try {
        if (!window.ApplePaySession) {
          setIsApplePayLoading(false);
          return;
        }

        if (!window.ApplePaySession.canMakePayments()) {
          setIsApplePayLoading(false);
          return;
        }

        setIsApplePayReady(true);
      } catch (error) {
        console.error('Error checking Apple Pay availability:', error);
        setIsApplePayReady(false);
      } finally {
        setIsApplePayLoading(false);
      }
    };

    checkApplePayAvailability();
  }, []);

  // Don't render anything if both are still loading
  if (isGooglePayLoading || isApplePayLoading) {
    return null;
  }

  // Don't render anything if neither is available
  if (!isGooglePayReady && !isApplePayReady) {
    return null;
  }

  // Determine grid layout based on availability
  const bothAvailable = isGooglePayReady && isApplePayReady;
  const gridClass = bothAvailable ? 'grid grid-cols-2 gap-3' : 'grid grid-cols-1';

  return (
    <div className={gridClass}>
      {isGooglePayReady && (
        <GooglePayButton
          onPayment={onGooglePayment}
          bill={bill}
          totalAmount={totalAmount}
          merchantId={merchantId}
          isDisabled={isDisabled}
        />
      )}
      {isApplePayReady && (
        <ApplePayButton
          onPayment={onApplePayment}
          bill={bill}
          totalAmount={totalAmount}
          isDisabled={isDisabled}
        />
      )}
    </div>
  );
};

export default PaymentButtonsContainer;