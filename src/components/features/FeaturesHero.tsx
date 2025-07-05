import React from 'react';
import ResponsiveTypography from '@/components/ui/responsive-typography';
import ResponsiveContainer from '@/components/ui/responsive-container';

const FeaturesHero: React.FC = () => {
  return (
    <section className="bg-gradient-to-b from-blue-50 to-white">
      <ResponsiveContainer variant="hero" maxWidth="6xl">
        <div className="text-center">
          <ResponsiveTypography variant="h1" className="mb-4">
            Powerful Features for Modern Municipalities
          </ResponsiveTypography>
          <ResponsiveTypography variant="body" className="text-muted-foreground max-w-3xl mx-auto">
            Streamline payment collection, improve financial oversight, and enhance resident satisfaction with our comprehensive solution.
          </ResponsiveTypography>
        </div>
      </ResponsiveContainer>
    </section>
  );
};

export default FeaturesHero;