import React from 'react';
import PrivacyPolicySection from './PrivacyPolicySection';

const DataCollectionSection: React.FC = () => {
  return (
    <PrivacyPolicySection title="2. Information We Collect">
      <h3 className="text-xl font-medium mb-3 text-foreground">2.1 Personal Information</h3>
      <p className="mb-4">We may collect the following types of personal information:</p>
      <ul className="list-disc pl-6 mb-4">
        <li><strong>Contact Information:</strong> Name, email address, postal address, phone number.</li>
        <li><strong>Account Information:</strong> Username, password, account preferences, and municipality affiliations.</li>
        <li><strong>Financial Information:</strong> Payment method details, transaction history, billing information.</li>
        <li><strong>Identity Verification Information:</strong> Date of birth, government-issued identification numbers (as required for certain services).</li>
        <li><strong>Municipal Relationship Data:</strong> Property information, utility account numbers, tax identification data.</li>
      </ul>

      <h3 className="text-xl font-medium mb-3 text-foreground">2.2 Payment and Financial Data</h3>
      <p className="mb-4">When you make payments through our Service, we collect specific payment-related information:</p>
      <ul className="list-disc pl-6 mb-4">
        <li><strong>Payment Card Information:</strong> Card number, expiration date, CVV/CVC code, and billing address (processed securely through PCI-compliant tokenization).</li>
        <li><strong>Bank Account Information:</strong> Account numbers, routing numbers, and account holder information (when applicable).</li>
        <li><strong>Transaction Data:</strong> Payment amounts, dates, merchant information, transaction IDs, and payment status.</li>
        <li><strong>Payment Processor Data:</strong> Tokenized payment credentials, payment instrument IDs, and transaction metadata shared with our payment processor, Finix.</li>
        <li><strong>Fraud Prevention Data:</strong> Device fingerprinting, IP addresses, geolocation data, and behavioral analytics to prevent fraudulent transactions.</li>
      </ul>
      
      <h3 className="text-xl font-medium mb-3 text-foreground">2.3 Usage and Technical Data</h3>
      <p className="mb-4">We automatically collect certain information when you visit, use, or navigate our Service:</p>
      <ul className="list-disc pl-6 mb-4">
        <li><strong>Device Information:</strong> IP address, browser type, operating system, device information.</li>
        <li><strong>Usage Data:</strong> Pages visited, features used, time spent, and other interactions with the Service.</li>
        <li><strong>Cookies and Similar Technologies:</strong> Information collected through cookies, web beacons, and other tracking technologies.</li>
        <li><strong>Log Data:</strong> Server logs, error reports, and performance data.</li>
      </ul>
    </PrivacyPolicySection>
  );
};

export default DataCollectionSection;