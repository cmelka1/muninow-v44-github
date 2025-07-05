import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import ResponsiveTypography from '@/components/ui/responsive-typography';
import ResponsiveContainer from '@/components/ui/responsive-container';

const FeaturesCTA: React.FC = () => {
  return (
    <section className="bg-muted">
      <ResponsiveContainer variant="section" maxWidth="4xl">
        <div className="text-center">
          <ResponsiveTypography variant="h2" className="mb-4">
            Ready to Modernize Your Municipal Payment System?
          </ResponsiveTypography>
          <ResponsiveTypography variant="body" className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join municipalities across the country that are improving efficiency and resident satisfaction with MuniNow.
          </ResponsiveTypography>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/signup" aria-label="Request a demo with MuniNow">
              <Button size="lg" className="px-8">
                Request a Demo
              </Button>
            </Link>
            <Link to="/signin" aria-label="Contact MuniNow for more information">
              <Button size="lg" variant="outline" className="px-8">
                Contact MuniNow
              </Button>
            </Link>
          </div>
        </div>
      </ResponsiveContainer>
    </section>
  );
};

export default FeaturesCTA;