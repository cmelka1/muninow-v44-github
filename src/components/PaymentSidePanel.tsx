import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { useBill } from '@/hooks/useBill';
import { useUserPaymentInstruments } from '@/hooks/useUserPaymentInstruments';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CreditCard, Star, Plus, X } from 'lucide-react';
import PaymentButtonsContainer from '@/components/PaymentButtonsContainer';
import { AddPaymentMethodDialog } from '@/components/profile/AddPaymentMethodDialog';

interface PaymentSidePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  billId: string;
}

const PaymentSidePanel: React.FC<PaymentSidePanelProps> = ({
  open,
  onOpenChange,
  billId,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: bill, isLoading: billLoading } = useBill(billId);
  const { paymentInstruments, isLoading: paymentMethodsLoading, loadPaymentInstruments } = useUserPaymentInstruments();
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false);
  const [serviceFee, setServiceFee] = useState<{ totalFee: number } | null>(null);
  const [finixAuth, setFinixAuth] = useState<any>(null);
  const [fraudSessionId, setFraudSessionId] = useState<string | null>(null);

  const topPaymentMethods = paymentInstruments.slice(0, 2);

  // Calculate service fee based on selected payment method and bill data
  const calculateServiceFee = () => {
    if (!bill) return null;
    
    // Handle Google Pay and Apple Pay as special cases - always use card fees
    if (selectedPaymentMethod === 'google-pay' || selectedPaymentMethod === 'apple-pay') {
      const basisPoints = bill.basis_points || 250;
      const fixedFee = bill.fixed_fee || 50;
      const percentageFee = Math.round((bill.total_amount_cents * basisPoints) / 10000);
      const totalFee = percentageFee + fixedFee;

      return {
        totalFee,
        percentageFee,
        fixedFee,
        basisPoints,
        isCard: true
      };
    }
    
    if (!selectedPaymentMethod) return null;
    
    const selectedInstrument = paymentInstruments.find(instrument => instrument.id === selectedPaymentMethod);
    if (!selectedInstrument) return null;

    const isCard = selectedInstrument.instrument_type === 'PAYMENT_CARD';
    const basisPoints = isCard ? (bill.basis_points || 250) : (bill.ach_basis_points || 20);
    const fixedFee = isCard ? (bill.fixed_fee || 50) : (bill.ach_fixed_fee || 50);

    const percentageFee = Math.round((bill.total_amount_cents * basisPoints) / 10000);
    const totalFee = percentageFee + fixedFee;

    return {
      totalFee,
      percentageFee,
      fixedFee,
      basisPoints,
      isCard
    };
  };

  const serviceFeeCalculated = calculateServiceFee();

  // Calculate total with fee
  const baseAmount = bill?.total_amount_cents ? bill.total_amount_cents / 100 : 0;
  const feeAmount = serviceFee?.totalFee || 0;
  const totalWithFee = baseAmount + feeAmount;
  const totalWithFeeCents = bill ? bill.total_amount_cents + (serviceFeeCalculated?.totalFee || 0) : 0;

  // Check if payment is available for this bill
  const isPaymentAvailable = bill?.finix_merchant_id && !billLoading;
  const paymentUnavailableReason = !bill?.finix_merchant_id ? 
    "Payment processing is not available for this bill. The merchant account may not be fully configured." : 
    null;

  // Reset selected payment method when panel opens
  useEffect(() => {
    if (open && paymentInstruments.length > 0) {
      const defaultInstrument = paymentInstruments.find(i => i.is_default);
      setSelectedPaymentMethod(defaultInstrument?.id || paymentInstruments[0]?.id || '');
    }
  }, [open, paymentInstruments]);

  // Initialize Finix Auth for fraud detection
  useEffect(() => {
    const initializeFinixAuth = () => {
      // Check if Finix library is loaded and bill data is available
      if (typeof window !== 'undefined' && (window as any).Finix && bill?.finix_merchant_id) {
        try {
          console.log('Initializing Finix Auth with merchant ID:', bill.finix_merchant_id);
          
          const auth = (window as any).Finix.Auth(
            "sandbox", // Environment
            bill.finix_merchant_id, // Merchant ID from bill data
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
    if (!(window as any).Finix) {
      const retryTimeout = setTimeout(initializeFinixAuth, 1000);
      return () => clearTimeout(retryTimeout);
    }
  }, [bill?.finix_merchant_id]);

  // Update service fee state whenever calculation changes
  useEffect(() => {
    if (serviceFeeCalculated) {
      setServiceFee({ totalFee: serviceFeeCalculated.totalFee / 100 }); // Convert cents to dollars
    } else {
      setServiceFee(null);
    }
  }, [selectedPaymentMethod, bill, paymentInstruments]);

  const getCardIcon = (instrumentType: string, cardBrand?: string) => {
    return <CreditCard className="h-5 w-5 text-muted-foreground" />;
  };

  const handlePayment = async () => {
    if (!bill || !selectedPaymentMethod) {
      toast({
        title: "Error",
        description: "Please select a payment method and ensure bill details are loaded.",
        variant: "destructive",
      });
      return;
    }

    if (!serviceFeeCalculated) {
      toast({
        title: "Error",
        description: "Service fee calculation failed. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingPayment(true);
    try {
      // Generate idempotency ID
      const idempotencyId = `${bill.bill_id}-${selectedPaymentMethod}-${Date.now()}`;

      // Get current fraud session ID
      let currentFraudSessionId = fraudSessionId;
      if (finixAuth && !currentFraudSessionId) {
        try {
          currentFraudSessionId = finixAuth.getSessionKey();
          setFraudSessionId(currentFraudSessionId);
        } catch (error) {
          console.warn('Could not get fraud session ID:', error);
        }
      }

      console.log('Processing payment with parameters:', {
        bill_id: bill.bill_id,
        payment_instrument_id: selectedPaymentMethod,
        total_amount_cents: totalWithFeeCents,
        idempotency_id: idempotencyId,
        fraud_session_id: currentFraudSessionId
      });

      const { data, error } = await supabase.functions.invoke('process-finix-transfer', {
        body: {
          bill_id: bill.bill_id,
          payment_instrument_id: selectedPaymentMethod,
          total_amount_cents: totalWithFeeCents,
          idempotency_id: idempotencyId,
          fraud_session_id: currentFraudSessionId
        },
      });

      if (error) {
        console.error('Payment error:', error);
        toast({
          title: "Payment Failed",
          description: "There was an error processing your payment. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data.success) {
        toast({
          title: "Payment Successful",
          description: "Your payment has been processed successfully.",
        });
        
        onOpenChange(false);
      } else {
        toast({
          title: "Payment Failed",
          description: data.error || "Payment processing failed. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleGooglePayment = async (paymentData: any) => {
    if (!bill) return;

    setIsProcessingPayment(true);
    try {
      // Generate idempotency ID for Google Pay
      const idempotencyId = `googlepay_${bill.bill_id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      console.log('Processing Google Pay with parameters:', {
        bill_id: bill.bill_id,
        total_amount_cents: totalWithFeeCents,
        idempotency_id: idempotencyId
      });

      const { data, error } = await supabase.functions.invoke('process-google-pay-transfer', {
        body: {
          bill_id: bill.bill_id,
          google_pay_token: paymentData,
          total_amount_cents: totalWithFeeCents,
          idempotency_id: idempotencyId,
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Payment Successful",
          description: "Your Google Pay payment has been processed successfully.",
        });
        onOpenChange(false);
      } else {
        throw new Error(data?.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Google Pay error:', error);
      toast({
        title: "Payment Failed",
        description: "Failed to process Google Pay payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleApplePayment = async (payment: any) => {
    if (!bill) return;

    setIsProcessingPayment(true);
    try {
      // Generate idempotency ID for Apple Pay
      const idempotencyId = `applepay_${bill.bill_id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      console.log('Processing Apple Pay with parameters:', {
        bill_id: bill.bill_id,
        total_amount_cents: totalWithFeeCents,
        idempotency_id: idempotencyId,
        fraud_session_id: fraudSessionId
      });

      const { data, error } = await supabase.functions.invoke('process-apple-pay-transfer', {
        body: {
          bill_id: bill.bill_id,
          apple_pay_token: payment,
          total_amount_cents: totalWithFeeCents,
          idempotency_id: idempotencyId,
          fraud_session_id: fraudSessionId
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Payment Successful",
          description: "Your Apple Pay payment has been processed successfully.",
        });
        onOpenChange(false);
      } else {
        throw new Error(data?.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Apple Pay error:', error);
      toast({
        title: "Payment Failed",
        description: "Failed to process Apple Pay payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (billLoading || !bill) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Pay Bill</SheetTitle>
            <SheetDescription>
              Complete payment for {bill.merchant_name || 'this bill'}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Bill Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bill Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <p className="text-base font-medium">{bill.merchant_name || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground">{bill.category || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground">{formatDate(bill.due_date)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center py-1">
                  <span className="text-base">Amount Due</span>
                  <span className="text-base font-medium">{formatCurrency(baseAmount)}</span>
                </div>
                
                <div className="flex justify-between items-center py-1">
                  <span className="text-base">Service Fee</span>
                  <span className="text-base font-medium text-right">
                    {serviceFee ? (
                      formatCurrency(serviceFee.totalFee)
                    ) : selectedPaymentMethod ? (
                      formatCurrency(0)
                    ) : (
                      "Select payment method"
                    )}
                  </span>
                </div>
                
                <div className="border-t border-border my-2"></div>
                
                <div className="flex justify-between items-center py-1 bg-muted/30 px-3 rounded">
                  <span className="text-base font-semibold">Total Amount Due</span>
                  <span className="text-lg font-bold">{formatCurrency(totalWithFee)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment unavailable warning */}
            {!isPaymentAvailable && paymentUnavailableReason && (
              <Card className="border-warning bg-warning/5">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <X className="h-5 w-5 text-warning" />
                    <p className="text-sm text-warning font-medium">Payment Not Available</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {paymentUnavailableReason}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Payment Method Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentMethodsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : topPaymentMethods.length > 0 ? (
                  <div className="space-y-2">
                    {topPaymentMethods.map((instrument) => (
                      <div
                        key={instrument.id}
                        className={`border rounded-lg p-3 cursor-pointer transition-all ${
                          selectedPaymentMethod === instrument.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedPaymentMethod(instrument.id)}
                      >
                        <div className="flex items-center space-x-3">
                          {getCardIcon(instrument.instrument_type, instrument.card_brand || undefined)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium truncate">
                                {instrument.display_name}
                              </p>
                              {instrument.is_default && (
                                <Badge variant="default" className="text-xs">
                                  <Star className="h-3 w-3 mr-1" />
                                  Default
                                </Badge>
                              )}
                            </div>
                            {instrument.instrument_type === 'PAYMENT_CARD' && 
                             instrument.card_expiration_month && 
                             instrument.card_expiration_year && (
                              <p className="text-xs text-muted-foreground">
                                Expires {instrument.card_expiration_month.toString().padStart(2, '0')}/{instrument.card_expiration_year}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <CreditCard className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">No payment methods added</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/profile?tab=payment-methods')}
                    >
                      Add Payment Method
                    </Button>
                  </div>
                )}

                 {/* Payment Options - Google/Apple Pay */}
                {isPaymentAvailable && (
                  <PaymentButtonsContainer
                    bill={bill}
                    totalAmount={totalWithFee}
                    merchantId={bill.finix_merchant_id}
                    isDisabled={isProcessingPayment}
                    onGooglePayment={() => handleGooglePayment({})}
                    onApplePayment={() => handleApplePayment({})}
                  />
                )}

                <div className="border-t border-border my-3"></div>

                {/* Pay Now Section */}
                <div className="space-y-3">
                  <Button 
                    className="w-full" 
                    size="lg"
                    disabled={!selectedPaymentMethod || isProcessingPayment || !isPaymentAvailable || selectedPaymentMethod === 'google-pay' || selectedPaymentMethod === 'apple-pay'}
                    onClick={handlePayment}
                  >
                    {!isPaymentAvailable ? 'Payment Not Available' :
                     isProcessingPayment ? 'Processing...' : 
                     selectedPaymentMethod === 'google-pay' ? 'Use Google Pay button above' : 
                     selectedPaymentMethod === 'apple-pay' ? 'Use Apple Pay button above' :
                     `Pay ${formatCurrency(totalWithFee)}`}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    size="lg"
                    onClick={() => setIsAddPaymentDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Payment Method
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    Your payment will be processed securely
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </SheetContent>
      </Sheet>

      <AddPaymentMethodDialog
        open={isAddPaymentDialogOpen}
        onOpenChange={setIsAddPaymentDialogOpen}
        onSuccess={async (paymentMethodId) => {
          await loadPaymentInstruments();
          if (paymentMethodId) {
            setSelectedPaymentMethod(paymentMethodId);
          }
        }}
      />
    </>
  );
};

export default PaymentSidePanel;