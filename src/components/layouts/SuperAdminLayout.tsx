import React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { SuperAdminSidebar } from '@/components/SuperAdminSidebar';

interface SuperAdminLayoutProps {
  children: React.ReactNode;
}

export const SuperAdminLayout: React.FC<SuperAdminLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <SuperAdminSidebar />
        <SidebarInset className="flex-1 bg-gray-100">
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};