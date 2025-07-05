import React from 'react';
import PrivacyPolicySection from './PrivacyPolicySection';

const PaymentComplianceSection: React.FC = () => {
  return (
    <PrivacyPolicySection title="3. Payment Processing and PCI Compliance">
      <p className="mb-4">
        We are committed to maintaining the highest standards of payment security and compliance:
      </p>
      <ul className="list-disc pl-6 mb-4">
        <li><strong>PCI DSS Compliance:</strong> Our payment processing systems comply with the Payment Card Industry Data Security Standards (PCI DSS) Level 1 requirements.</li>
        <li><strong>Tokenization:</strong> We use secure tokenization technology to replace sensitive payment card data with non-sensitive tokens, ensuring your actual card details are never stored on our servers.</li>
        <li><strong>Encryption:</strong> All payment data is encrypted both in transit (using TLS 1.2 or higher) and at rest using industry-standard encryption protocols.</li>
        <li><strong>Payment Processor Partnership:</strong> We partner with Finix, a PCI-compliant payment processor, to handle sensitive payment data securely.</li>
        <li><strong>Limited Data Access:</strong> We implement strict access controls to ensure only authorized personnel can access payment-related data, and only when necessary for legitimate business purposes.</li>
      </ul>
    </PrivacyPolicySection>
  );
};

export default PaymentComplianceSection;