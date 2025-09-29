// Finix JavaScript Library TypeScript Declarations

declare global {
  interface Window {
    Finix: {
      Auth: (
        environment: string,
        merchantId: string,
        callback?: (sessionKey: string) => void
      ) => FinixAuth;
      CardTokenForm: (containerId: string, config?: FinixFormConfig) => FinixTokenForm;
      BankTokenForm: (containerId: string, config?: FinixFormConfig) => FinixTokenForm;
    };
  }
}

interface FinixAuth {
  getSessionKey(): string;
}

interface FinixFormConfig {
  styles?: FinixFormStyles;
  showAddress?: boolean;
  showLabels?: boolean;
  labels?: Record<string, string>;
  showPlaceholders?: boolean;
  placeholders?: Record<string, string>;
  hideFields?: string[];
  requiredFields?: string[];
  hideErrorMessages?: boolean;
  errorMessages?: Record<string, string>;
  defaultValues?: Record<string, string>;
  fonts?: Array<{ family: string; src: string }>;
}

interface FinixTokenForm {
  submit(environment: 'sandbox' | 'live', applicationId: string, callback: (err: any, res: any) => void): void;
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