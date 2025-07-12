import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface GooglePayButtonProps {
  onPayment: (paymentData: any) => Promise<void>;
  bill: any;
  totalAmount: number;
  merchantFinixIdentityId?: string;
  googlePayMerchantId?: string;
  isDisabled?: boolean;
}

const GooglePayButton: React.FC<GooglePayButtonProps> = ({
  onPayment,
  bill,
  totalAmount,
  merchantFinixIdentityId,
  googlePayMerchantId,
  isDisabled = false
}) => {
  const [isGooglePayReady, setIsGooglePayReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const checkGooglePayAvailability = async () => {
      try {
        if (!window.google?.payments?.api) {
          console.log('Google Pay API not available');
          setIsLoading(false);
          return;
        }

        const paymentsClient = new window.google.payments.api.PaymentsClient({
          environment: 'TEST' // Change to 'PRODUCTION' for live environment
        });

        window.googlePayClient = paymentsClient;

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
        setIsLoading(false);
      }
    };

    checkGooglePayAvailability();
  }, []);

  const handleClick = async () => {
    if (isDisabled || isProcessing || !isGooglePayReady || !merchantFinixIdentityId || !googlePayMerchantId) return;

    try {
      setIsProcessing(true);

      const tokenizationSpecification = {
        type: 'PAYMENT_GATEWAY' as const,
        parameters: {
          gateway: 'finix' as const,
          gatewayMerchantId: merchantFinixIdentityId,
        },
      };

      const paymentDataRequest = {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [
          {
            type: 'CARD' as const,
            parameters: {
              allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
              allowedCardNetworks: ['AMEX', 'DISCOVER', 'INTERAC', 'JCB', 'MASTERCARD', 'VISA']
            },
            tokenizationSpecification: tokenizationSpecification,
          },
        ],
        transactionInfo: {
          totalPriceStatus: 'FINAL' as const,
          totalPrice: totalAmount.toString(),
          currencyCode: 'USD',
          countryCode: 'US',
        },
        merchantInfo: {
          merchantId: googlePayMerchantId,
          merchantName: bill.merchant_name || 'Merchant',
        },
      };

      const paymentData = await window.googlePayClient.loadPaymentData(paymentDataRequest);
      await onPayment(paymentData);
    } catch (error) {
      console.error('Google Pay payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="border rounded-lg p-2.5 border-border opacity-50">
        <div className="flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-sm">Checking Google Pay...</span>
        </div>
      </div>
    );
  }

  if (!isGooglePayReady) {
    return null; // Don't show button if Google Pay isn't available
  }

  return (
    <div
      className={`border rounded-lg p-2.5 cursor-pointer transition-all bg-card hover:bg-accent ${
        isDisabled || isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-center justify-center">
        <img 
          src="/lovable-uploads/c2b3d2f7-9a1c-480f-9b7f-eca749490b01.png"
          alt="Google Pay"
          className="h-7 w-auto object-contain"
        />
      </div>
    </div>
  );
};

export default GooglePayButton;