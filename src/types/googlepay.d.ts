// Google Pay API TypeScript Declarations

declare global {
  interface Window {
    google?: {
      payments?: {
        api?: {
          PaymentsClient: new (options: GooglePayConfig) => GooglePayClient;
        };
      };
    };
  }
}

interface GooglePayConfig {
  environment: 'TEST' | 'PRODUCTION';
}

interface GooglePayClient {
  isReadyToPay(request: IsReadyToPayRequest): Promise<IsReadyToPayResponse>;
  createButton(options: ButtonOptions): HTMLElement;
  loadPaymentData(request: PaymentDataRequest): Promise<PaymentData>;
}

interface IsReadyToPayRequest {
  apiVersion: number;
  apiVersionMinor: number;
  allowedPaymentMethods: PaymentMethod[];
}

interface IsReadyToPayResponse {
  result: boolean;
}

interface PaymentMethod {
  type: 'CARD';
  parameters: {
    allowedCardNetworks: string[];
  };
  tokenizationSpecification?: TokenizationSpecification;
}

interface TokenizationSpecification {
  type: 'PAYMENT_GATEWAY';
  parameters: {
    gateway: string;
    gatewayMerchantId: string;
  };
}

interface ButtonOptions {
  onClick: () => void;
  allowedPaymentMethods: PaymentMethod[];
}

interface PaymentDataRequest {
  apiVersion: number;
  apiVersionMinor: number;
  allowedPaymentMethods: PaymentMethod[];
  transactionInfo: TransactionInfo;
  merchantInfo: MerchantInfo;
}

interface TransactionInfo {
  totalPriceStatus: 'FINAL' | 'ESTIMATED';
  totalPrice: string;
  currencyCode: string;
}

interface MerchantInfo {
  merchantName: string;
  merchantId?: string;
}

interface PaymentData {
  apiVersion: number;
  apiVersionMinor: number;
  paymentMethodData: {
    type: 'CARD';
    description: string;
    tokenizationData: {
      type: 'PAYMENT_GATEWAY';
      token: string;
    };
  };
}

export {};