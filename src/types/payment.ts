// Shared payment interfaces and types

export interface ServiceFee {
  totalFee: number; // Legacy - same as serviceFeeToDisplay
  percentageFee: number;
  fixedFee: number;
  basisPoints: number;
  isCard: boolean;
  totalAmountToCharge: number; // The grossed-up amount (T)
  serviceFeeToDisplay: number; // The fee amount shown to user (T - A)
}

export interface PaymentResponse {
  success: boolean;
  error?: string;
  transaction_id?: string;
  payment_id?: string;
  status?: string;
}

export interface PaymentError {
  type: 'network' | 'payment_declined' | 'validation' | 'user_cancelled' | 'configuration' | 'unknown';
  message: string;
  retryable: boolean;
  details?: any;
}

export interface GooglePayMerchantResponse {
  success: boolean;
  merchant_id: string | null;
  error?: string;
}

export interface ApplePaySessionRequest {
  validation_url: string;
  merchant_id: string;
}

export interface ApplePaySessionResponse {
  success: boolean;
  session?: any;
  error?: string;
}

export interface BillingAddress {
  name?: string;
  postal_code?: string;
  country_code?: string;
  address1?: string;
  address2?: string;
  locality?: string;
  administrative_area?: string;
}

export interface PaymentMethodHookReturn {
  // State
  selectedPaymentMethod: string | null;
  setSelectedPaymentMethod: (method: string | null) => void;
  isProcessingPayment: boolean;
  serviceFee: ServiceFee | null;
  totalWithFee: number;
  paymentInstruments: any[];
  topPaymentMethods: any[];
  paymentMethodsLoading: boolean;
  googlePayMerchantId: string | null;
  
  // Actions
  handlePayment: () => Promise<PaymentResponse>;
  handleGooglePayment: () => Promise<PaymentResponse>;
  handleApplePayment: () => Promise<PaymentResponse>;
  loadPaymentInstruments: () => void;
}