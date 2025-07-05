import React from 'react';

interface PrivacyPolicySectionProps {
  title: string;
  children: React.ReactNode;
  id?: string;
}

const PrivacyPolicySection: React.FC<PrivacyPolicySectionProps> = ({ title, children, id }) => {
  return (
    <section className="mb-8" id={id}>
      <h2 className="text-2xl font-semibold mb-4 text-foreground">{title}</h2>
      <div className="text-muted-foreground">
        {children}
      </div>
    </section>
  );
};

export default PrivacyPolicySection;