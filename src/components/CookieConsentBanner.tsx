import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { X, Settings, Cookie } from 'lucide-react';
import { useCookieConsent, CookieConsent } from './CookieConsentProvider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Link } from 'react-router-dom';

const CookieConsentBanner: React.FC = () => {
  const { updateConsent } = useCookieConsent();
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false,
    functional: false,
  });

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

  const handleSavePreferences = () => {
    const consent: CookieConsent = {
      ...preferences,
      essential: true, // Always true
      timestamp: new Date().toISOString(),
    };
    updateConsent(consent);
    setShowPreferences(false);
  };

  const handlePreferenceChange = (key: keyof typeof preferences, value: boolean) => {
    if (key === 'essential') return; // Cannot change essential cookies
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  return (
    <>
      {/* Main Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur border-t shadow-lg">
        <div className="container mx-auto max-w-6xl">
          <Card className="border-0 shadow-none bg-transparent">
            <CardContent className="pb-4">
              <div className="flex items-start gap-3">
                <Cookie className="w-6 h-6 mt-1 text-primary flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-2 text-foreground">We use cookies to enhance your experience</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    We use cookies to provide secure payment processing, analyze site usage, and improve our services. 
                    You can customize your preferences or accept all cookies to continue.{' '}
                    <Link to="/cookies" className="text-primary hover:underline">
                      Learn more about our cookie policy
                    </Link>
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2 pt-0">
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <Button
                  onClick={handleAcceptAll}
                  className="flex-1 sm:flex-none"
                >
                  Accept All
                </Button>
                <Button
                  onClick={handleRejectAll}
                  variant="outline"
                  className="flex-1 sm:flex-none"
                >
                  Reject All
                </Button>
                <Button
                  onClick={() => setShowPreferences(true)}
                  variant="ghost"
                  className="flex-1 sm:flex-none"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Customize
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Cookie Preferences Dialog */}
      <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cookie className="w-5 h-5" />
              Cookie Preferences
            </DialogTitle>
            <DialogDescription>
              Choose which cookies you want to accept. Essential cookies are required for the website to function properly.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Essential Cookies */}
            <div className="flex items-start justify-between space-x-4">
              <div className="flex-1">
                <h4 className="font-medium text-foreground">Essential Cookies</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Required for website functionality, security, and payment processing. Cannot be disabled.
                </p>
              </div>
              <Switch
                checked={true}
                disabled={true}
                aria-label="Essential cookies (always enabled)"
              />
            </div>

            {/* Analytics Cookies */}
            <div className="flex items-start justify-between space-x-4">
              <div className="flex-1">
                <h4 className="font-medium text-foreground">Analytics Cookies</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Help us understand how visitors interact with our website to improve performance and user experience.
                </p>
              </div>
              <Switch
                checked={preferences.analytics}
                onCheckedChange={(value) => handlePreferenceChange('analytics', value)}
                aria-label="Analytics cookies"
              />
            </div>

            {/* Functional Cookies */}
            <div className="flex items-start justify-between space-x-4">
              <div className="flex-1">
                <h4 className="font-medium text-foreground">Functional Cookies</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Enable enhanced functionality and personalization, such as remembering your preferences and settings.
                </p>
              </div>
              <Switch
                checked={preferences.functional}
                onCheckedChange={(value) => handlePreferenceChange('functional', value)}
                aria-label="Functional cookies"
              />
            </div>

            {/* Marketing Cookies */}
            <div className="flex items-start justify-between space-x-4">
              <div className="flex-1">
                <h4 className="font-medium text-foreground">Marketing Cookies</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Used to deliver relevant advertisements and measure campaign effectiveness. We do not sell your personal data.
                </p>
              </div>
              <Switch
                checked={preferences.marketing}
                onCheckedChange={(value) => handlePreferenceChange('marketing', value)}
                aria-label="Marketing cookies"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button onClick={handleSavePreferences} className="flex-1">
              Save Preferences
            </Button>
            <Button onClick={handleAcceptAll} variant="outline" className="flex-1">
              Accept All
            </Button>
            <Button onClick={handleRejectAll} variant="ghost" className="flex-1">
              Reject All
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            You can change your cookie preferences at any time by clicking the cookie settings link in our footer.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CookieConsentBanner;