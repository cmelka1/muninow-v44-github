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

export interface MunicipalService {
  id: string;
  name: string;
  description: string;
  category: string;
  features: string[];
  icon?: string;
}