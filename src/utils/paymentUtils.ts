import { PaymentError } from '@/types/payment';

export const classifyPaymentError = (error: any): PaymentError => {
  const errorMessage = error?.value?.message || error?.message || error?.toString() || '';
  const statusCode = error?.value?.statusCode;
  const errorName = error?.value?.name;
  
  // Check for user cancellation
  const isUserCancellation = statusCode === 'CANCELED' ||
                            errorName === 'AbortError' ||
                            errorMessage.includes('CANCELED') || 
                            errorMessage.includes('canceled') || 
                            errorMessage.includes('cancelled') ||
                            errorMessage.includes('User canceled') ||
                            errorMessage.includes('User closed the Payment Request UI') ||
                            errorMessage.includes('AbortError') ||
                            errorMessage.includes('Payment request was aborted');
  
  if (isUserCancellation) {
    return {
      type: 'user_cancelled',
      message: 'Payment was cancelled by user',
      retryable: true,
      details: error
    };
  }
  
  // Check for network errors
  if (errorMessage.includes('network') || 
      errorMessage.includes('connection') ||
      errorMessage.includes('timeout') ||
      error?.code === 'NETWORK_ERROR') {
    return {
      type: 'network',
      message: 'Network error occurred. Please check your connection and try again.',
      retryable: true,
      details: error
    };
  }
  
  // Check for payment declined
  if (errorMessage.includes('declined') || 
      errorMessage.includes('insufficient') ||
      errorMessage.includes('invalid card') ||
      statusCode === 'PAYMENT_DECLINED') {
    return {
      type: 'payment_declined',
      message: 'Payment was declined. Please check your payment method and try again.',
      retryable: false,
      details: error
    };
  }
  
  // Check for validation errors
  if (errorMessage.includes('validation') ||
      errorMessage.includes('invalid') ||
      errorMessage.includes('required') ||
      statusCode === 'VALIDATION_ERROR') {
    return {
      type: 'validation',
      message: 'Payment information is invalid. Please check your details.',
      retryable: false,
      details: error
    };
  }
  
  // Check for configuration errors
  if (errorMessage.includes('merchant') ||
      errorMessage.includes('configuration') ||
      errorMessage.includes('not configured')) {
    return {
      type: 'configuration',
      message: 'Payment service is not properly configured. Please contact support.',
      retryable: false,
      details: error
    };
  }
  
  // Default to unknown error
  return {
    type: 'unknown',
    message: errorMessage || 'An unexpected error occurred. Please try again.',
    retryable: true,
    details: error
  };
};

export const generateIdempotencyId = (prefix: string, billId?: string): string => {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substr(2, 9);
  const billPart = billId ? `${billId}_` : '';
  return `${prefix}_${billPart}${timestamp}_${randomPart}`;
};

export const initializeApplePaySession = async (
  merchantId: string,
  totalAmount: number,
  merchantName: string,
  onValidateMerchant: (event: any) => Promise<any>,
  onPaymentAuthorized: (event: any) => Promise<any>
): Promise<any> => {
  if (!window.ApplePaySession) {
    throw new Error('Apple Pay is not available on this device');
  }

  if (!window.ApplePaySession.canMakePayments()) {
    throw new Error('Apple Pay is not available on this device');
  }

  const paymentRequest = {
    countryCode: 'US',
    currencyCode: 'USD',
    supportedNetworks: ['visa', 'masterCard', 'amex', 'discover'],
    merchantCapabilities: ['supports3DS'],
    total: {
      label: merchantName,
      amount: (totalAmount / 100).toFixed(2),
      type: 'final'
    }
  };

  const session = new window.ApplePaySession(3, paymentRequest);

  session.onvalidatemerchant = onValidateMerchant;
  session.onpaymentauthorized = onPaymentAuthorized;
  
  session.oncancel = () => {
    console.log('Apple Pay session was cancelled by user');
  };

  return session;
};