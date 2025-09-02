import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ServiceFeeResult {
  baseAmount: number;
  serviceFee: number;
  totalAmount: number;
  isCard: boolean;
  basisPoints: number;
  isLoading: boolean;
  error: string | null;
}

export const useServiceFeeCalculation = (
  baseAmountCents: number,
  selectedPaymentMethod: string | null
) => {
  const [result, setResult] = useState<ServiceFeeResult>({
    baseAmount: baseAmountCents,
    serviceFee: 0,
    totalAmount: baseAmountCents,
    isCard: true,
    basisPoints: 0,
    isLoading: false,
    error: null
  });

  useEffect(() => {
    const calculateFee = async () => {
      if (!baseAmountCents || baseAmountCents <= 0 || !selectedPaymentMethod) {
        setResult({
          baseAmount: baseAmountCents,
          serviceFee: 0,
          totalAmount: baseAmountCents,
          isCard: true,
          basisPoints: 0,
          isLoading: false,
          error: null
        });
        return;
      }

      setResult(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const { data, error } = await supabase.functions.invoke('calculate-service-fee', {
          body: {
            baseAmountCents,
            paymentInstrumentId: selectedPaymentMethod === 'google-pay' || selectedPaymentMethod === 'apple-pay' 
              ? null 
              : selectedPaymentMethod,
            paymentMethodType: selectedPaymentMethod === 'google-pay' || selectedPaymentMethod === 'apple-pay' 
              ? 'card' 
              : null
          }
        });

        if (error) {
          throw error;
        }

        if (data.success) {
          setResult({
            baseAmount: data.baseAmount,
            serviceFee: data.serviceFee,
            totalAmount: data.totalAmount,
            isCard: data.isCard,
            basisPoints: data.basisPoints,
            isLoading: false,
            error: null
          });
        } else {
          throw new Error(data.error || 'Failed to calculate service fee');
        }
      } catch (error) {
        console.error('Service fee calculation error:', error);
        setResult({
          baseAmount: baseAmountCents,
          serviceFee: 0,
          totalAmount: baseAmountCents,
          isCard: true,
          basisPoints: 0,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to calculate service fee'
        });
      }
    };

    calculateFee();
  }, [baseAmountCents, selectedPaymentMethod]);

  return result;
};