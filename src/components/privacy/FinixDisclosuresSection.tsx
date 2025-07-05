import React from 'react';
import PrivacyPolicySection from './PrivacyPolicySection';

const FinixDisclosuresSection: React.FC = () => {
  return (
    <PrivacyPolicySection title="4. Finix Payment Processing Disclosures">
      <p className="mb-4">
        We partner with Finix Payments, Inc. ("Finix") to process payments securely. By using our payment services, you agree to the following disclosures required by Finix:
      </p>
      
      <h3 className="text-xl font-medium mb-3 text-foreground">4.1 Payment Processor Information</h3>
      <ul className="list-disc pl-6 mb-4">
        <li><strong>Payment Processor:</strong> Finix Payments, Inc.</li>
        <li><strong>Processor Address:</strong> 405 Howard Street, Suite 450, San Francisco, CA 94105</li>
        <li><strong>Processor Website:</strong> <a href="https://finix.com" className="text-primary hover:underline">https://finix.com</a></li>
        <li><strong>Customer Service:</strong> Available through Finix's support channels for payment-related inquiries</li>
      </ul>

      <h3 className="text-xl font-medium mb-3 text-foreground">4.2 Payment Data Processing</h3>
      <p className="mb-4">When you make a payment through our Service:</p>
      <ul className="list-disc pl-6 mb-4">
        <li>Your payment information is transmitted directly to Finix using secure, encrypted connections</li>
        <li>Finix tokenizes your payment card data, replacing sensitive information with secure tokens</li>
        <li>We never store your actual payment card numbers or CVV codes on our servers</li>
        <li>Finix maintains PCI DSS Level 1 compliance for secure payment processing</li>
        <li>Transaction data is processed through Finix's secure payment infrastructure</li>
      </ul>

      <h3 className="text-xl font-medium mb-3 text-foreground">4.3 Data Shared with Finix</h3>
      <p className="mb-4">To process payments, we share the following information with Finix:</p>
      <ul className="list-disc pl-6 mb-4">
        <li>Cardholder name and billing address</li>
        <li>Transaction amount and currency</li>
        <li>Merchant and transaction identifiers</li>
        <li>Identity verification information as required for compliance</li>
        <li>Device and session information for fraud prevention</li>
        <li>IP address and geolocation data for risk assessment</li>
      </ul>

      <h3 className="text-xl font-medium mb-3 text-foreground">4.4 Finix's Use of Your Data</h3>
      <p className="mb-4">Finix uses your payment data to:</p>
      <ul className="list-disc pl-6 mb-4">
        <li>Process payment transactions and provide payment services</li>
        <li>Prevent fraud and unauthorized transactions</li>
        <li>Comply with financial regulations and reporting requirements</li>
        <li>Provide customer support for payment-related issues</li>
        <li>Maintain and improve their payment processing systems</li>
      </ul>

      <h3 className="text-xl font-medium mb-3 text-foreground">4.5 Finix Privacy Policy</h3>
      <p className="mb-4">
        Finix has its own privacy policy that governs their collection, use, and protection of your payment data. 
        You can review Finix's Privacy Policy at <a href="https://finix.com/privacy-policy" className="text-primary hover:underline">https://finix.com/privacy-policy</a>.
      </p>

      <h3 className="text-xl font-medium mb-3 text-foreground">4.6 Third-Party Payment Networks</h3>
      <p>
        Finix works with major payment card networks (Visa, Mastercard, American Express, Discover) and 
        banking institutions to process transactions. Your payment data may be shared with these entities 
        as necessary to complete transactions and comply with payment industry regulations.
      </p>
    </PrivacyPolicySection>
  );
};

export default FinixDisclosuresSection;