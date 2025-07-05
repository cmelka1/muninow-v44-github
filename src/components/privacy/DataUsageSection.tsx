import React from 'react';
import PrivacyPolicySection from './PrivacyPolicySection';

const DataUsageSection: React.FC = () => {
  return (
    <PrivacyPolicySection title="6. How We Use Your Information">
      <p className="mb-4">We use your personal information for the following purposes:</p>
      <ul className="list-disc pl-6 mb-4">
        <li>To provide, maintain, and improve our Service.</li>
        <li>To process and complete transactions, and send related information including confirmations and receipts.</li>
        <li>To verify your identity and prevent fraud, money laundering, and other financial crimes.</li>
        <li>To comply with payment industry regulations and standards, including PCI DSS requirements.</li>
        <li>To respond to your inquiries and provide customer support.</li>
        <li>To send administrative information, such as updates, security alerts, and support messages.</li>
        <li>To personalize your experience and deliver content relevant to your interests.</li>
        <li>To facilitate communication between municipalities and residents.</li>
        <li>To monitor and analyze usage patterns and trends to improve our Service.</li>
        <li>To detect, prevent, and address technical issues, fraud, and security incidents.</li>
        <li>To comply with legal obligations and enforce our terms and policies.</li>
        <li>To manage payment disputes, chargebacks, and refund requests.</li>
      </ul>
    </PrivacyPolicySection>
  );
};

export default DataUsageSection;