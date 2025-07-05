export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
  benefits: string[];
}

export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string;
  canonical: string;
}

export interface Breadcrumb {
  name: string;
  url: string;
}