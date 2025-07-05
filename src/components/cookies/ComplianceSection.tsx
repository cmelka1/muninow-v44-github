import React from 'react';
import CookiePolicySection from './CookiePolicySection';

const ComplianceSection: React.FC = () => {
  return (
    <CookiePolicySection title="7. Legal Compliance" id="compliance">
      <p className="mb-4">
        Our use of cookies complies with applicable data protection and privacy laws:
      </p>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">GDPR Compliance (EU)</h3>
          <p className="mb-2">
            For users in the European Union, we comply with the General Data Protection Regulation:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Explicit consent for non-essential cookies</li>
            <li>Clear information about cookie purposes</li>
            <li>Easy withdrawal of consent</li>
            <li>Data minimization and purpose limitation</li>
            <li>Right to access and delete cookie data</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">CCPA Compliance (California)</h3>
          <p className="mb-2">
            For California residents, we comply with the California Consumer Privacy Act:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Disclosure of cookie data collection practices</li>
            <li>Right to know what information is collected</li>
            <li>Right to delete personal information</li>
            <li>Right to opt-out of sale of personal information</li>
            <li>Non-discrimination for exercising privacy rights</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">Other Jurisdictions</h3>
          <p className="mb-2">
            We also comply with privacy laws in other jurisdictions where we operate:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Canada's Personal Information Protection and Electronic Documents Act (PIPEDA)</li>
            <li>Australia's Privacy Act</li>
            <li>Brazil's Lei Geral de Proteção de Dados (LGPD)</li>
            <li>Other applicable local privacy regulations</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="font-semibold mb-2 text-foreground">Your Rights:</p>
        <p>
          Depending on your location, you may have specific rights regarding your 
          cookie data, including the right to access, correct, delete, or port your 
          information. Contact us using the information below to exercise these rights.
        </p>
      </div>
    </CookiePolicySection>
  );
};

export default ComplianceSection;