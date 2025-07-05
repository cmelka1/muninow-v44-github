import React from 'react';
import PrivacyPolicySection from './PrivacyPolicySection';

const PrivacyRightsSection: React.FC = () => {
  return (
    <PrivacyPolicySection title="9. Your Privacy Rights">
      <p className="mb-4">
        Depending on your location, you may have various rights regarding your personal information:
      </p>
      <ul className="list-disc pl-6 mb-4">
        <li><strong>Access:</strong> You can request copies of your personal information.</li>
        <li><strong>Rectification:</strong> You can request that we correct inaccurate or incomplete information.</li>
        <li><strong>Erasure:</strong> You can request that we delete your personal information, subject to legal and regulatory retention requirements for payment and financial data.</li>
        <li><strong>Restriction:</strong> You can request that we restrict the processing of your information.</li>
        <li><strong>Data Portability:</strong> You can request a copy of the information you provided to us in a structured, commonly used, machine-readable format.</li>
        <li><strong>Objection:</strong> You can object to our processing of your personal information.</li>
        <li><strong>Withdraw Consent:</strong> Where we rely on consent as the legal basis for processing, you can withdraw your consent at any time.</li>
      </ul>
      <p className="mb-4">
        <strong>Important Note:</strong> Some rights may be limited for payment and financial data due to legal and regulatory requirements, including anti-money laundering laws, tax regulations, and payment industry standards.
      </p>
      <p className="mb-4">
        To exercise these rights, please contact us using the details provided in the "Contact Information" section. We may need to verify your identity before responding to your request.
      </p>
      <p>
        <strong>California Residents:</strong> Under the California Consumer Privacy Act (CCPA), California residents have specific rights regarding their personal information. In addition to the rights described above, California residents can request information about our collection, use, disclosure, and sale of personal information over the past 12 months.
      </p>
    </PrivacyPolicySection>
  );
};

export default PrivacyRightsSection;