import React from 'react';
import CookiePolicySection from './CookiePolicySection';

const IntroductionSection: React.FC = () => {
  return (
    <CookiePolicySection title="1. What Are Cookies?" id="introduction">
      <p className="mb-4">
        Cookies are small text files that are stored on your device when you visit our website. 
        They help us provide you with a better experience by remembering your preferences and 
        enabling certain website functionality.
      </p>
      <p className="mb-4">
        MuniNow uses cookies to enhance your experience on our platform, improve our services, 
        and provide secure payment processing for municipal bill payments.
      </p>
      <p>
        This Cookies Policy explains what cookies we use, why we use them, and how you can 
        control them. By continuing to use our website, you consent to our use of cookies 
        in accordance with this policy.
      </p>
    </CookiePolicySection>
  );
};

export default IntroductionSection;