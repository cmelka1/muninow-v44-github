import React from 'react';
import PrivacyPolicySection from './PrivacyPolicySection';

const ContactSection: React.FC = () => {
  return (
    <>
      <PrivacyPolicySection title="17. Contact Information">
        <p className="mb-4">
          If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us at:
        </p>
        <div className="mb-4">
          <p className="mb-1"><strong>Muni Now, Inc.</strong></p>
          <p className="mb-1">123 Tech Plaza, Suite 400</p>
          <p className="mb-1">Boston, MA 02110</p>
          <p className="mb-1">Email: <a href="mailto:contact@muninow.com" className="text-primary hover:underline">contact@muninow.com</a></p>
          <p className="mb-1">Data Protection Officer: <a href="mailto:contact@muninow.com" className="text-primary hover:underline">contact@muninow.com</a></p>
        </div>
      </PrivacyPolicySection>

      <PrivacyPolicySection title="18. Payment-Related Contact Information">
        <p className="mb-4">
          For payment-related inquiries, disputes, or issues:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li><strong>General Payment Support:</strong> <a href="mailto:contact@muninow.com" className="text-primary hover:underline">contact@muninow.com</a></li>
          <li><strong>Payment Disputes:</strong> <a href="mailto:contact@muninow.com" className="text-primary hover:underline">contact@muninow.com</a></li>
          <li><strong>Finix Customer Service:</strong> Available through their support channels for processor-specific issues</li>
          <li><strong>Fraud Reports:</strong> <a href="mailto:contact@muninow.com" className="text-primary hover:underline">contact@muninow.com</a></li>
        </ul>
        
        <p>
          For general privacy concerns or data protection inquiries, please use the contact information provided in Section 17.
        </p>
      </PrivacyPolicySection>
    </>
  );
};

export default ContactSection;