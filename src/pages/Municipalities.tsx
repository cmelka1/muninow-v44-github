import React from 'react';
import { PreloginHeader } from '@/components/layout/PreloginHeader';
import { PreloginFooter } from '@/components/layout/PreloginFooter';
import LazyLoadingWrapper from '@/components/shared/LazyLoadingWrapper';
import { useResponsiveNavigation } from '@/hooks/useResponsiveNavigation';

// Lazy load heavy components
const MunicipalitiesHero = React.lazy(() => import('@/components/municipalities/MunicipalitiesHero'));
const ServicesGrid = React.lazy(() => import('@/components/municipalities/ServicesGrid'));
const MunicipalitiesCTA = React.lazy(() => import('@/components/municipalities/MunicipalitiesCTA'));

const Municipalities = () => {
  const { isMobile } = useResponsiveNavigation();

  return (
    <div className="flex flex-col min-h-screen">
      <PreloginHeader />

      <main className="flex-1">
        {/* Hero Section - Critical above-the-fold content */}
        <LazyLoadingWrapper fallback={<div className="h-96 gradient-bg animate-pulse" />}>
          <MunicipalitiesHero />
        </LazyLoadingWrapper>

        {/* Services Grid - Lazy loaded for better performance */}
        <LazyLoadingWrapper fallback={<div className="h-96 bg-background animate-pulse" />}>
          <ServicesGrid />
        </LazyLoadingWrapper>

        {/* CTA Section - Lazy loaded */}
        <LazyLoadingWrapper fallback={<div className="h-64 bg-muted animate-pulse" />}>
          <MunicipalitiesCTA />
        </LazyLoadingWrapper>
      </main>

      <PreloginFooter />
    </div>
  );
};

export default Municipalities;