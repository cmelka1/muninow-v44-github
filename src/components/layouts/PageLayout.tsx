import React from 'react';
import { Helmet } from 'react-helmet-async';
import { PreloginHeader } from '@/components/layout/PreloginHeader';
import { PreloginFooter } from '@/components/layout/PreloginFooter';

interface PageLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  noIndex?: boolean;
  structuredData?: any;
  breadcrumbs?: Array<{name: string, url: string}>;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  description,
  children,
  className = "",
  keywords,
  canonical,
  ogImage = "https://muninow.com/opengraph-image.png",
  noIndex = false,
  structuredData,
  breadcrumbs
}) => {
  const fullTitle = `${title} | MuniNow`;
  const defaultDescription = "Simplify your municipal payments with MuniNow's secure, all-in-one platform. Pay for permits, licenses, taxes, and other services online with autopay options.";
  const metaDescription = description || defaultDescription;

  return (
    <>
      <Helmet>
        <title>{fullTitle}</title>
        <meta name="description" content={metaDescription} />
        {keywords && <meta name="keywords" content={keywords} />}
        {canonical && <link rel="canonical" href={canonical} />}
        {noIndex && <meta name="robots" content="noindex, nofollow" />}
        
        {/* Enhanced meta tags for better SEO */}
        <meta name="author" content="MuniNow" />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        <meta name="bingbot" content="index, follow" />
        
        {/* Open Graph */}
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="MuniNow" />
        {canonical && <meta property="og:url" content={canonical} />}
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@muninow" />
        <meta name="twitter:creator" content="@muninow" />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={ogImage} />
        
        {/* Additional SEO meta tags */}
        <meta name="theme-color" content="#3b82f6" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="application-name" content="MuniNow" />
        <meta name="apple-mobile-web-app-title" content="MuniNow" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* Language and location */}
        <meta httpEquiv="content-language" content="en-US" />
        <meta name="geo.region" content="US" />
        <meta name="geo.placename" content="United States" />
        
        {/* Structured Data */}
        {structuredData && (
          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>
        )}
        
        {/* Breadcrumb Structured Data */}
        {breadcrumbs && breadcrumbs.length > 1 && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": breadcrumbs.map((crumb, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "name": crumb.name,
                "item": crumb.url
              }))
            })}
          </script>
        )}
      </Helmet>
      <div className={`flex flex-col min-h-screen ${className}`}>
        <PreloginHeader />
        <main className="flex-1">
          {children}
        </main>
        <PreloginFooter />
      </div>
    </>
  );
};

export default PageLayout;