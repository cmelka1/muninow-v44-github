import React, { useEffect } from 'react';
import PageLayout from '@/components/layouts/PageLayout';
import FeaturesHero from '@/components/features/FeaturesHero';
import FeaturesGrid from '@/components/features/FeaturesGrid';
import FeaturesCTA from '@/components/features/FeaturesCTA';
import LazyLoadingWrapper from '@/components/shared/LazyLoadingWrapper';
import { getPageMetadata } from '@/utils/seoUtils';

// Lazy load heavy sections
const LazyFeaturesGrid = React.lazy(() => import('@/components/features/FeaturesGrid'));
const LazyFeaturesCTA = React.lazy(() => import('@/components/features/FeaturesCTA'));

const Features: React.FC = () => {
  const metadata = getPageMetadata('features');

  // Set page title
  useEffect(() => {
    document.title = metadata.title;
    
    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', metadata.description);
    }
  }, [metadata]);

  return (
    <PageLayout title={metadata.title} description={metadata.description}>
      <div className="flex flex-col">
        {/* Hero Section - Critical above-the-fold content */}
        <FeaturesHero />

        {/* Lazy loaded sections for better performance */}
        <LazyLoadingWrapper fallback={<div className="h-96 bg-muted animate-pulse" />}>
          <LazyFeaturesGrid />
        </LazyLoadingWrapper>

        <LazyLoadingWrapper fallback={<div className="h-64 bg-background animate-pulse" />}>
          <LazyFeaturesCTA />
        </LazyLoadingWrapper>
      </div>
    </PageLayout>
  );
};

export default Features;