import React from 'react';
import { PreloginHeader } from '@/components/layout/PreloginHeader';
import { PreloginFooter } from '@/components/layout/PreloginFooter';

interface PageLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  className = ""
}) => {
  return (
    <div className={`flex flex-col min-h-screen ${className}`}>
      <PreloginHeader />
      <main className="flex-1">
        {children}
      </main>
      <PreloginFooter />
    </div>
  );
};

export default PageLayout;