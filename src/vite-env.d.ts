/// <reference types="vite/client" />

declare namespace JSX {
  interface IntrinsicElements {
    'apple-pay-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      buttonstyle?: string;
      type?: string;
      locale?: string;
    };
  }
}

interface Window {
  ApplePaySession?: {
    new(version: number, paymentRequest: any): any;
    canMakePayments(): boolean;
    STATUS_SUCCESS: number;
    STATUS_FAILURE: number;
  };
}
