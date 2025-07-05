import React from 'react';
import CookiePolicySection from './CookiePolicySection';

const ContactSection: React.FC = () => {
  return (
    <CookiePolicySection title="8. Contact Us" id="contact">
      <p className="mb-4">
        If you have any questions or concerns about our use of cookies or this 
        Cookies Policy, please contact us:
      </p>
      
      <div className="space-y-4">
        <div>
          <div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">General Inquiries</h3>
            <div className="space-y-2">
              <p><strong>Email:</strong> contact@muninow.com</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2 text-foreground">Policy Updates</h3>
        <p className="mb-2">
          This Cookies Policy may be updated from time to time to reflect changes 
          in our practices or applicable law. We will notify users of significant 
          changes through:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Email notification to registered users</li>
          <li>Prominent notice on our website</li>
          <li>Updated effective date at the top of this policy</li>
        </ul>
        <p className="mt-2">
          Continued use of our website after policy changes indicates acceptance 
          of the updated terms.
        </p>
      </div>
    </CookiePolicySection>
  );
};

export default ContactSection;