import React from 'react';
import { Button } from '@/components/ui/button';
import { useCookieConsent, CookieConsent } from './CookieConsentProvider';
import { Link } from 'react-router-dom';

const CookieConsentBanner: React.FC = () => {
  const { updateConsent } = useCookieConsent();

  const handleAcceptAll = () => {
    const consent: CookieConsent = {
      essential: true,
      analytics: true,
      marketing: true,
      functional: true,
      timestamp: new Date().toISOString(),
    };
    updateConsent(consent);
  };

  const handleRejectAll = () => {
    const consent: CookieConsent = {
      essential: true, // Essential cookies cannot be rejected
      analytics: false,
      marketing: false,
      functional: false,
      timestamp: new Date().toISOString(),
    };
    updateConsent(consent);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-2 bg-background/90 border-t">
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 py-2">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              We use cookies for secure payments and analytics.{' '}
              <Link to="/cookies" className="text-primary hover:underline">
                Cookie policy
              </Link>
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleAcceptAll}
              size="sm"
              className="text-xs px-3 py-1"
            >
              Accept All
            </Button>
            <Button
              onClick={handleRejectAll}
              variant="outline"
              size="sm"
              className="text-xs px-3 py-1"
            >
              Reject All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;