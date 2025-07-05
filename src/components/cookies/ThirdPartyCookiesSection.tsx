import React from 'react';
import CookiePolicySection from './CookiePolicySection';

const ThirdPartyCookiesSection: React.FC = () => {
  return (
    <CookiePolicySection title="3. Third-Party Cookies" id="third-party-cookies">
      <p className="mb-4">
        We may allow third-party service providers to place cookies on your device to 
        provide certain services. These include:
      </p>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">Google Analytics</h3>
          <p className="mb-2">
            We use Google Analytics to analyze website traffic and user behavior. 
            Google may use this data in accordance with their privacy policy.
          </p>
          <p className="text-sm">
            Learn more: <a href="https://policies.google.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a>
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">Payment Processors</h3>
          <p className="mb-2">
            Our payment processing partners (including Finix) may set cookies to 
            ensure secure transactions and prevent fraud.
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Fraud detection and prevention cookies</li>
            <li>Secure payment processing cookies</li>
            <li>Transaction verification cookies</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">Security Services</h3>
          <p className="mb-2">
            We use security services to protect against malicious activity:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Bot detection and prevention cookies</li>
            <li>DDoS protection cookies</li>
            <li>Security monitoring cookies</li>
          </ul>
        </div>
      </div>

      <p className="mt-4">
        These third-party cookies are governed by the respective privacy policies 
        of these service providers. We do not control these cookies and recommend 
        reviewing their privacy policies for more information.
      </p>
    </CookiePolicySection>
  );
};

export default ThirdPartyCookiesSection;