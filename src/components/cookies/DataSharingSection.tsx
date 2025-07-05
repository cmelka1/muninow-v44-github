import React from 'react';
import CookiePolicySection from './CookiePolicySection';

const DataSharingSection: React.FC = () => {
  return (
    <CookiePolicySection title="6. Data Sharing and Third Parties" id="data-sharing">
      <p className="mb-4">
        Information collected through cookies may be shared with third parties 
        in the following circumstances:
      </p>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">Service Providers</h3>
          <p className="mb-2">
            We share cookie data with trusted service providers who help us operate our platform:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Payment processors for transaction security</li>
            <li>Analytics providers for website optimization</li>
            <li>Security services for fraud prevention</li>
            <li>Cloud hosting providers for data storage</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">Legal Requirements</h3>
          <p className="mb-2">
            We may share cookie data when required by law or to:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Comply with legal obligations</li>
            <li>Protect our rights and property</li>
            <li>Prevent fraud and abuse</li>
            <li>Ensure user safety and security</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">Business Transfers</h3>
          <p>
            In the event of a merger, acquisition, or sale of assets, cookie data 
            may be transferred as part of the business transaction. Users will be 
            notified of any such transfer and given choices regarding their data.
          </p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="font-semibold mb-2 text-foreground">Data Protection:</p>
        <p>
          All third parties we work with are required to maintain appropriate security 
          measures and use cookie data only for specified purposes. We do not sell 
          personal information collected through cookies to third parties for marketing purposes.
        </p>
      </div>
    </CookiePolicySection>
  );
};

export default DataSharingSection;