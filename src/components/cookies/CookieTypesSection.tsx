import React from 'react';
import CookiePolicySection from './CookiePolicySection';

const CookieTypesSection: React.FC = () => {
  return (
    <CookiePolicySection title="2. Types of Cookies We Use" id="cookie-types">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">Essential Cookies</h3>
          <p className="mb-2">
            These cookies are necessary for the website to function properly and cannot be 
            disabled. They include:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Authentication cookies to keep you logged in</li>
            <li>Security cookies to prevent fraudulent activity</li>
            <li>Session cookies to maintain your preferences during your visit</li>
            <li>Payment processing cookies for secure transactions</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">Analytics Cookies</h3>
          <p className="mb-2">
            These cookies help us understand how visitors interact with our website:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Google Analytics cookies to track page views and user behavior</li>
            <li>Performance monitoring cookies to identify technical issues</li>
            <li>Usage statistics cookies to improve our services</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">Functional Cookies</h3>
          <p className="mb-2">
            These cookies enable enhanced functionality and personalization:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Preference cookies to remember your settings</li>
            <li>Language and region cookies for localization</li>
            <li>Accessibility cookies for enhanced user experience</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">Marketing Cookies</h3>
          <p className="mb-2">
            These cookies are used to deliver relevant advertisements:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Advertising cookies to show relevant ads</li>
            <li>Social media cookies for social sharing functionality</li>
            <li>Conversion tracking cookies to measure campaign effectiveness</li>
          </ul>
        </div>
      </div>
    </CookiePolicySection>
  );
};

export default CookieTypesSection;