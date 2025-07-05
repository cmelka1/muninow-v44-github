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
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">General Inquiries</h3>
            <div className="space-y-2">
              <p><strong>Email:</strong> privacy@muninow.com</p>
              <p><strong>Phone:</strong> 1-800-MUNINOW (1-800-686-4669)</p>
              <p><strong>Support:</strong> Available Monday-Friday, 9 AM - 6 PM EST</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">Mailing Address</h3>
            <div className="space-y-1">
              <p>Muni Now, Inc.</p>
              <p>Attn: Privacy Officer</p>
              <p>123 Municipal Way</p>
              <p>Suite 100</p>
              <p>San Francisco, CA 94105</p>
              <p>United States</p>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">Data Protection Officer</h3>
          <p className="mb-2">
            For GDPR-related inquiries or to exercise your privacy rights:
          </p>
          <p><strong>Email:</strong> dpo@muninow.com</p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="font-semibold mb-2 text-foreground">Response Time:</p>
        <p>
          We aim to respond to all privacy-related inquiries within 30 days. 
          For urgent matters, please indicate this in your communication and 
          we will respond as quickly as possible.
        </p>
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