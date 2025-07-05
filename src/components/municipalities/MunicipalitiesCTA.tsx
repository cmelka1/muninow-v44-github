import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import ResponsiveTypography from '@/components/ui/responsive-typography';
import ResponsiveContainer from '@/components/ui/responsive-container';

const MunicipalitiesCTA: React.FC = () => {
  return (
    <section className="bg-muted">
      <ResponsiveContainer variant="section" maxWidth="4xl">
        <div className="text-center">
          <ResponsiveTypography variant="h2" className="mb-6">
            Join Leading Municipalities
          </ResponsiveTypography>
          <ResponsiveTypography variant="body" className="text-muted-foreground mb-8 text-xl max-w-2xl mx-auto">
            Municipalities across the country trust MuniNow to handle their payment processing needs.
          </ResponsiveTypography>
          <Link to="/signup" aria-label="Get started with MuniNow today">
            <Button size="lg" className="px-8">
              Get Started Today
            </Button>
          </Link>
        </div>
      </ResponsiveContainer>
    </section>
  );
};

export default MunicipalitiesCTA;