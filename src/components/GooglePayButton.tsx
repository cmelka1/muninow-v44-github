import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

interface GooglePayButtonProps {
  merchantId: string;
  amount: number;
  disabled?: boolean;
}

export const GooglePayButton: React.FC<GooglePayButtonProps> = ({ 
  merchantId, 
  amount,
  disabled = true 
}) => {
  const [isGooglePayReady, setIsGooglePayReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkGooglePayReadiness = async () => {
      try {
        // Wait for Google Pay API to load
        if (!window.google?.payments?.api?.PaymentsClient) {
          console.log('Google Pay API not yet loaded, retrying...');
          setTimeout(checkGooglePayReadiness, 500);
          return;
        }

        const paymentsClient = new window.google.payments.api.PaymentsClient({
          environment: 'TEST'
        });

        // Define allowed card networks
        const allowedCardNetworks = [
          'AMEX',
          'DISCOVER', 
          'INTERAC',
          'JCB',
          'MASTERCARD',
          'VISA'
        ];

        // Base payment method configuration with authentication methods
        const allowedCardAuthMethods = ["PAN_ONLY", "CRYPTOGRAM_3DS"];
        const baseCardPaymentMethod = {
          type: 'CARD' as const,
          parameters: {
            allowedCardNetworks: allowedCardNetworks,
            allowedCardAuthMethods: allowedCardAuthMethods,
          },
        };

        const isReadyToPayRequest = {
          apiVersion: 2,
          apiVersionMinor: 0,
          allowedPaymentMethods: [baseCardPaymentMethod],
        };

        const response = await paymentsClient.isReadyToPay(isReadyToPayRequest);
        setIsGooglePayReady(response.result);
      } catch (error) {
        console.error('Error checking Google Pay readiness:', error);
        setIsGooglePayReady(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkGooglePayReadiness();
  }, []);

  if (isLoading) {
    return (
      <Card className="p-4 border-dashed border-muted-foreground/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-8 bg-muted rounded animate-pulse"></div>
            <span className="text-sm text-muted-foreground">Loading Google Pay...</span>
          </div>
        </div>
      </Card>
    );
  }

  if (!isGooglePayReady) {
    return null; // Don't show if Google Pay is not supported
  }

  return (
    <Card className={`p-4 border transition-colors ${
      disabled 
        ? 'border-muted-foreground/30 bg-muted/30 cursor-not-allowed' 
        : 'border-border hover:border-primary/50 cursor-pointer'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img 
            src="https://qcuiuubbaozncmejzvxje.supabase.co/storage/v1/object/public/google-pay-button/Google_Pay_Logo.png"
            alt="Google Pay"
            className="h-8 w-auto"
          />
          <div>
            <p className={`font-medium ${disabled ? 'text-muted-foreground' : 'text-foreground'}`}>
              Google Pay
            </p>
            {disabled && (
              <p className="text-xs text-muted-foreground">Coming soon</p>
            )}
          </div>
        </div>
        {!disabled && (
          <div className="text-sm text-muted-foreground">
            ${(amount / 100).toFixed(2)}
          </div>
        )}
      </div>
    </Card>
  );
};