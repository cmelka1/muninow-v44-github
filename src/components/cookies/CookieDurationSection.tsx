import React from 'react';
import CookiePolicySection from './CookiePolicySection';

const CookieDurationSection: React.FC = () => {
  return (
    <CookiePolicySection title="4. Cookie Duration" id="cookie-duration">
      <p className="mb-4">
        We use both session cookies and persistent cookies:
      </p>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">Session Cookies</h3>
          <p className="mb-2">
            These cookies are temporary and are deleted when you close your browser:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Authentication session cookies</li>
            <li>Shopping cart or form data cookies</li>
            <li>Temporary security cookies</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">Persistent Cookies</h3>
          <p className="mb-2">
            These cookies remain on your device for a specified period:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Remember Me cookies:</strong> Up to 30 days</li>
            <li><strong>Preference cookies:</strong> Up to 1 year</li>
            <li><strong>Analytics cookies:</strong> Up to 2 years</li>
            <li><strong>Security cookies:</strong> Up to 90 days</li>
            <li><strong>Marketing cookies:</strong> Up to 1 year</li>
          </ul>
        </div>
      </div>

      <p className="mt-4">
        You can manually delete cookies at any time through your browser settings. 
        Some cookies may be recreated if they are essential for website functionality.
      </p>
    </CookiePolicySection>
  );
};

export default CookieDurationSection;