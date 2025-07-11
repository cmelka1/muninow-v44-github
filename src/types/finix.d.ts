// Finix JavaScript Library TypeScript Declarations

declare global {
  interface Window {
    Finix: {
      Auth: (
        environment: string,
        merchantId: string,
        callback?: (sessionKey: string) => void
      ) => FinixAuth;
    };
  }
}

interface FinixAuth {
  getSessionKey(): string;
}

export {};