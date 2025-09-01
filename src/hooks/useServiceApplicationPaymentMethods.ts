import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useUserPaymentInstruments } from '@/hooks/useUserPaymentInstruments';
import { supabase } from '@/integrations/supabase/client';
import { ServiceFee, PaymentResponse, GooglePayMerchantResponse } from '@/types/payment';
import { classifyPaymentError, generateIdempotencyId, initializeApplePaySession } from '@/utils/paymentUtils';
import { useSessionValidation } from '@/hooks/useSessionValidation';
import { MunicipalServiceTile } from '@/hooks/useMunicipalServiceTiles';

export const useServiceApplicationPaymentMethods = (tile: MunicipalServiceTile | null, userDefinedAmount?: number) => {
  const { toast } = useToast();
  const { paymentInstruments, isLoading: paymentMethodsLoading, loadPaymentInstruments } = useUserPaymentInstruments();
  const { ensureValidSession } = useSessionValidation();
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [finixAuth, setFinixAuth] = useState<any>(null);
  const [fraudSessionId, setFraudSessionId] = useState<string | null>(null);
  const [googlePayMerchantId, setGooglePayMerchantId] = useState<string | null>(null);
  const [merchantFeeProfile, setMerchantFeeProfile] = useState<any>(null);

  // Get top 3 payment methods (prioritize default, then by creation date)
  const topPaymentMethods = paymentInstruments
    .slice()
    .sort((a, b) => {
      if (a.is_default && !b.is_default) return -1;
      if (!a.is_default && b.is_default) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    })
    .slice(0, 3);

  const calculateServiceFee = (): ServiceFee | null => {
    if (!tile || !merchantFeeProfile) return null;
    
    // Determine the service amount - use user defined amount if provided and allowed, otherwise use tile amount
    const serviceAmount = (tile.allow_user_defined_amount && userDefinedAmount) 
      ? userDefinedAmount * 100 // Convert to cents
      : tile.amount_cents || 0;
    
    if (serviceAmount <= 0) return null;
    
    // Get fee data from merchant fee profile
    const basisPoints = merchantFeeProfile.basis_points;
    const fixedFee = merchantFeeProfile.fixed_fee; 
    const achBasisPoints = merchantFeeProfile.ach_basis_points;
    const achFixedFee = merchantFeeProfile.ach_fixed_fee;
    
    // If no fee data available, we can't calculate service fees
    if (!basisPoints && !achBasisPoints) return null;
    
    // Handle Google Pay and Apple Pay as special cases - always use card fees
    if (selectedPaymentMethod === 'google-pay' || selectedPaymentMethod === 'apple-pay') {
      const cardBasisPoints = basisPoints || 250;
      const cardFixedFee = fixedFee || 50;
      
      // Convert basis points to decimal percentage (p)
      const percentageDecimal = cardBasisPoints / 10000;
      
      // Prevent division by zero or invalid percentages
      if (percentageDecimal >= 1) {
        console.error('Invalid percentage fee: cannot be 100% or higher');
        return null;
      }
      
      // Apply grossed-up formula: T = (A + f) / (1 - p)
      const totalAmountToCharge = Math.round((serviceAmount + cardFixedFee) / (1 - percentageDecimal));
      const serviceFeeToDisplay = totalAmountToCharge - serviceAmount;
      
      // Calculate percentage fee for display purposes
      const percentageFee = Math.round((serviceAmount * cardBasisPoints) / 10000);

      return {
        totalFee: serviceFeeToDisplay, // Legacy compatibility
        percentageFee,
        fixedFee: cardFixedFee,
        basisPoints: cardBasisPoints,
        isCard: true,
        totalAmountToCharge,
        serviceFeeToDisplay
      };
    }
    
    if (!selectedPaymentMethod) return null;
    
    const selectedInstrument = topPaymentMethods.find(instrument => instrument.id === selectedPaymentMethod);
    if (!selectedInstrument) return null;

    const isCard = selectedInstrument.instrument_type === 'PAYMENT_CARD';
    const instrumentBasisPoints = isCard ? (basisPoints || 250) : (achBasisPoints || 20);
    const instrumentFixedFee = isCard ? (fixedFee || 50) : (achFixedFee || 50);
    
    // Convert basis points to decimal percentage (p)
    const percentageDecimal = instrumentBasisPoints / 10000;
    
    // Prevent division by zero or invalid percentages
    if (percentageDecimal >= 1) {
      console.error('Invalid percentage fee: cannot be 100% or higher');
      return null;
    }
    
    // Apply grossed-up formula: T = (A + f) / (1 - p)
    const totalAmountToCharge = Math.round((serviceAmount + instrumentFixedFee) / (1 - percentageDecimal));
    const serviceFeeToDisplay = totalAmountToCharge - serviceAmount;
    
    // Calculate percentage fee for display purposes
    const percentageFee = Math.round((serviceAmount * instrumentBasisPoints) / 10000);

    return {
      totalFee: serviceFeeToDisplay, // Legacy compatibility
      percentageFee,
      fixedFee: instrumentFixedFee,
      basisPoints: instrumentBasisPoints,
      isCard,
      totalAmountToCharge,
      serviceFeeToDisplay
    };
  };

  const serviceFee = calculateServiceFee();
  const baseAmount = tile?.allow_user_defined_amount && userDefinedAmount 
    ? userDefinedAmount * 100 
    : tile?.amount_cents || 0;
  const totalWithFee = serviceFee?.totalAmountToCharge || baseAmount;

  // Auto-select default payment method when payment methods load
  useEffect(() => {
    if (!selectedPaymentMethod && topPaymentMethods.length > 0) {
      const defaultMethod = topPaymentMethods.find(method => method.is_default);
      if (defaultMethod) {
        setSelectedPaymentMethod(defaultMethod.id);
      } else if (topPaymentMethods.length > 0) {
        // If no default, select the first available method
        setSelectedPaymentMethod(topPaymentMethods[0].id);
      }
    }
  }, [topPaymentMethods, selectedPaymentMethod]);

  // Fetch merchant fee profile when tile changes
  useEffect(() => {
    const fetchMerchantFeeProfile = async () => {
      if (!tile?.merchant_id) return;
      
      try {
        const { data, error } = await supabase
          .from('merchant_fee_profiles')
          .select('*')
          .eq('merchant_id', tile.merchant_id)
          .single();
        
        if (error) {
          console.error('Error fetching merchant fee profile:', error);
          return;
        }
        
        setMerchantFeeProfile(data);
      } catch (error) {
        console.error('Failed to fetch merchant fee profile:', error);
      }
    };

    fetchMerchantFeeProfile();
  }, [tile?.merchant_id]);

  // Initialize Finix Auth for fraud detection
  useEffect(() => {
    const initializeFinixAuth = () => {
      // Check if Finix library is loaded and tile has merchant data
      if (typeof window !== 'undefined' && window.Finix && tile?.finix_merchant_id) {
        try {
          const finixMerchantId = tile.finix_merchant_id;
          console.log('Initializing Finix Auth with merchant ID:', finixMerchantId);
          
          const auth = window.Finix.Auth(
            "sandbox", // Environment
            finixMerchantId, // Merchant ID from tile data
            (sessionKey: string) => {
              console.log('Finix Auth initialized with session key:', sessionKey);
              setFraudSessionId(sessionKey);
            }
          );
          
          setFinixAuth(auth);
          
          // Also get session key immediately if available
          try {
            const immediateSessionKey = auth.getSessionKey();
            if (immediateSessionKey) {
              setFraudSessionId(immediateSessionKey);
            }
          } catch (error) {
            console.log('Session key not immediately available, will wait for callback');
          }
        } catch (error) {
          console.error('Error initializing Finix Auth:', error);
        }
      }
    };

    // Try to initialize immediately
    initializeFinixAuth();

    // If Finix library is not loaded yet, retry after a short delay
    if (!window.Finix) {
      const retryTimeout = setTimeout(initializeFinixAuth, 1000);
      return () => clearTimeout(retryTimeout);
    }
  }, [tile?.finix_merchant_id]);

  // Fetch Google Pay merchant ID
  useEffect(() => {
    const fetchGooglePayMerchantId = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-google-pay-merchant-id');
        
        if (error) {
          console.error('Error fetching Google Pay merchant ID:', error);
          return;
        }
        
        const response = data as GooglePayMerchantResponse;
        if (response?.merchant_id) {
          setGooglePayMerchantId(response.merchant_id);
          console.log('Google Pay merchant ID fetched:', response.merchant_id);
        } else {
          console.warn('Google Pay merchant ID not configured');
        }
      } catch (error) {
        console.error('Failed to fetch Google Pay merchant ID:', error);
      }
    };

    fetchGooglePayMerchantId();
  }, []);

  const handlePayment = async (applicationId: string): Promise<PaymentResponse> => {
    console.log('Processing service application payment:', {
      applicationId,
      selectedPaymentMethod,
      totalWithFee,
      serviceFee
    });
    
    // Validate session and selected payment method
    if (!selectedPaymentMethod || !tile) {
      toast({
        title: "Error",
        description: "Please select a payment method and ensure service details are loaded.",
        variant: "destructive",
      });
      return { success: false, error: "No payment method selected", retryable: false };
    }

    // Validate session before processing payment
    const sessionValid = await ensureValidSession();
    
    if (!sessionValid) {
      return { success: false, error: "Session validation failed", retryable: false };
    }

    if (!serviceFee || totalWithFee <= 0) {
      toast({
        title: "Error",
        description: "Service fee calculation failed. Please try again.",
        variant: "destructive",
      });
      return { success: false, error: "Invalid payment amount", retryable: false };
    }

    try {
      setIsProcessingPayment(true);

      // Generate idempotency ID for payment safety
      const idempotencyId = generateIdempotencyId('service-app', applicationId);

      const { data, error } = await supabase.functions.invoke('process-service-application-payment', {
        body: {
          application_id: applicationId,
          payment_instrument_id: selectedPaymentMethod,
          total_amount_cents: totalWithFee,
          idempotency_id: idempotencyId,
          fraud_session_id: fraudSessionId,
        }
      });

      if (error) {
        console.error('Payment processing error:', error);
        toast({
          title: "Payment Failed",
          description: error.message || "Payment processing failed. Please try again.",
          variant: "destructive",
        });
        return {
          success: false,
          error: error.message || "Payment processing failed",
          retryable: true,
        };
      }

      if (!data.success) {
        toast({
          title: "Payment Failed",
          description: data.error || "Payment failed. Please try again.",
          variant: "destructive",
        });
        return {
          success: false,
          error: data.error || "Payment failed",
          retryable: false,
        };
      }

      console.log('Payment processed successfully:', data);
      
      // Show success message based on whether application was auto-approved
      if (data.auto_approved) {
        toast({
          title: "Payment Successful",
          description: "Your payment has been processed and your application has been approved!",
        });
      } else {
        toast({
          title: "Payment Successful",
          description: "Your payment has been processed. Your application is now under review.",
        });
      }

      return {
        success: true,
        payment_id: data.payment_id,
        transaction_id: data.transfer_id,
        status: data.payment_status,
      };

    } catch (error) {
      console.error('Payment processing error:', error);
      toast({
        title: "Payment Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return {
        success: false,
        error: "Payment processing failed",
        retryable: true,
      };
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleGooglePayment = async (): Promise<PaymentResponse> => {
    // Placeholder implementation for Google Pay
    toast({
      title: "Payment Processing",
      description: "Google Pay for service applications is being implemented.",
    });
    return { success: false, error: "Not implemented yet" };
  };

  const handleApplePayment = async (): Promise<PaymentResponse> => {
    // Placeholder implementation for Apple Pay
    toast({
      title: "Payment Processing", 
      description: "Apple Pay for service applications is being implemented.",
    });
    return { success: false, error: "Not implemented yet" };
  };

  return {
    // State
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    isProcessingPayment,
    serviceFee,
    totalWithFee,
    baseAmount,
    paymentInstruments,
    topPaymentMethods,
    paymentMethodsLoading,
    googlePayMerchantId,
    merchantFeeProfile,
    
    // Actions
    handlePayment,
    handleGooglePayment,
    handleApplePayment,
    loadPaymentInstruments,
  };
};