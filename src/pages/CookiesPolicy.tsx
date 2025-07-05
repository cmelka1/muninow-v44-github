import React from 'react';
import PageLayout from '@/components/layouts/PageLayout';
import { getPageMetadata } from '@/utils/seoUtils';
import IntroductionSection from '@/components/cookies/IntroductionSection';
import CookieTypesSection from '@/components/cookies/CookieTypesSection';
import ThirdPartyCookiesSection from '@/components/cookies/ThirdPartyCookiesSection';
import CookieDurationSection from '@/components/cookies/CookieDurationSection';
import UserControlsSection from '@/components/cookies/UserControlsSection';
import DataSharingSection from '@/components/cookies/DataSharingSection';
import ComplianceSection from '@/components/cookies/ComplianceSection';
import ContactSection from '@/components/cookies/ContactSection';

const CookiesPolicy: React.FC = () => {
  const metadata = getPageMetadata('cookies');
  
  return (
    <PageLayout
      title={metadata.title}
      description={metadata.description}
      keywords={metadata.keywords}
      canonical={metadata.canonical}
    >
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-foreground">Cookies Policy</h1>
        
        <div className="prose prose-slate max-w-none">
          <p className="text-muted-foreground mb-8 text-lg">Effective Date: April 29, 2025</p>

          <IntroductionSection />
          <CookieTypesSection />
          <ThirdPartyCookiesSection />
          <CookieDurationSection />
          <UserControlsSection />
          <DataSharingSection />
          <ComplianceSection />
          <ContactSection />
        </div>
      </div>
    </PageLayout>
  );
};

export default CookiesPolicy;