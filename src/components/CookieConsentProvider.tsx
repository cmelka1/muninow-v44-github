import React, { createContext, useContext, useState, useEffect } from 'react';
import CookieConsentBanner from './CookieConsentBanner';

// Cookie consent types
export type CookieConsent = {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  timestamp: string;
};

// Define the context
type CookieConsentContextType = {
  consent: CookieConsent | null;
  analyticsConsent: boolean;
  marketingConsent: boolean;
  functionalConsent: boolean;
  updateConsent: (newConsent: CookieConsent) => void;
  openPreferences: () => void;
  hasConsented: boolean;
};

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

// Provider component
export const CookieConsentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check for stored consent on component mount
    const storedConsent = localStorage.getItem('muninow-cookie-consent');
    if (storedConsent) {
      try {
        const parsed = JSON.parse(storedConsent);
        setConsent(parsed);
      } catch (error) {
        console.error('Error parsing stored cookie consent:', error);
        // If parsing fails, show banner
        setShowBanner(true);
      }
    } else {
      // No stored consent, show banner
      setShowBanner(true);
    }
  }, []);

  const updateConsent = (newConsent: CookieConsent) => {
    localStorage.setItem('muninow-cookie-consent', JSON.stringify(newConsent));
    setConsent(newConsent);
    setShowBanner(false);
  };

  const openPreferences = () => {
    setShowBanner(true);
  };

  const analyticsConsent = consent?.analytics ?? false;
  const marketingConsent = consent?.marketing ?? false;
  const functionalConsent = consent?.functional ?? false;
  const hasConsented = consent !== null;

  return (
    <CookieConsentContext.Provider value={{ 
      consent, 
      analyticsConsent, 
      marketingConsent, 
      functionalConsent, 
      updateConsent, 
      openPreferences, 
      hasConsented 
    }}>
      {children}
      {showBanner && <CookieConsentBanner />}
    </CookieConsentContext.Provider>
  );
};

// Hook for using the cookie consent context
export const useCookieConsent = () => {
  const context = useContext(CookieConsentContext);
  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  return context;
};

export default CookieConsentProvider;