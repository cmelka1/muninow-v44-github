import { SEOMetadata } from '@/types';

export const getPageMetadata = (page: string): SEOMetadata => {
  const metadata: Record<string, SEOMetadata> = {
    home: {
      title: "MuniNow - Simplified Municipal Bill Pay Platform",
      description: "Pay all your municipal bills in one place. Secure, easy-to-use platform for residents, businesses, and municipalities. Schedule automatic payments and never miss a due date.",
      keywords: "municipal bill pay, city bills, utility payments, autopay, bill management, local government payments, online bill pay, municipal services",
      canonical: "https://muninow.com/"
    },
    features: {
      title: "MuniNow Features - Complete Municipal Payment Solution",
      description: "Explore MuniNow's powerful features including secure payments, automated reminders, detailed analytics, and seamless municipal integrations for enhanced efficiency.",
      keywords: "muninow features, municipal payment features, secure payments, bill automation, payment analytics, municipal software, payment processing",
      canonical: "https://muninow.com/features"
    }
  };

  return metadata[page] || metadata.home;
};