// Finix JavaScript Library TypeScript Declarations

declare global {
  interface Window {
    Finix: {
      Auth: (
        environment: string,
        merchantId: string,
        callback?: (sessionKey: string) => void
      ) => FinixAuth;
      CardTokenForm: (config: FinixFormConfig) => FinixTokenForm;
      BankTokenForm: (config: FinixFormConfig) => FinixTokenForm;
    };
  }
}

interface FinixAuth {
  getSessionKey(): string;
}

interface FinixFormConfig {
  applicationId: string;
  environment: 'sandbox' | 'live';
}

interface FinixTokenForm {
  render(containerId: string, styles?: FinixFormStyles): void;
  submit(): Promise<FinixTokenResponse>;
  on(event: 'ready' | 'change' | 'error', callback: (data?: any) => void): void;
  clear(): void;
  destroy(): void;
}

interface FinixFormStyles {
  base?: {
    fontSize?: string;
    fontFamily?: string;
    color?: string;
    backgroundColor?: string;
    padding?: string;
    borderRadius?: string;
    border?: string;
    '::placeholder'?: {
      color?: string;
    };
  };
  focus?: {
    borderColor?: string;
    outline?: string;
  };
  error?: {
    borderColor?: string;
    color?: string;
  };
}

interface FinixTokenResponse {
  token: string;
  last_four?: string;
  brand?: string;
  expiration_month?: number;
  expiration_year?: number;
  account_type?: string;
}

export {};