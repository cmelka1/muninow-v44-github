import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { PermitsSettingsTab } from '@/components/settings/PermitsSettingsTab';
import { BusinessLicensesSettingsTab } from '@/components/settings/BusinessLicensesSettingsTab';
import { TaxesSettingsTab } from '@/components/settings/TaxesSettingsTab';

const MunicipalSettings = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'permits';

  // Redirect unauthenticated users
  React.useEffect(() => {
    if (!isLoading && !user) {
      navigate('/signin');
    }
  }, [user, isLoading, navigate]);

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
          Municipal Settings
        </h1>
        <p className="text-slate-600">
          Configure settings for your municipal services and applications
        </p>
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-white border border-slate-200 rounded-lg">
          <TabsTrigger 
            value="permits" 
            className="text-sm font-medium py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Permits
          </TabsTrigger>
          <TabsTrigger 
            value="business-licenses" 
            className="text-sm font-medium py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Business Licenses
          </TabsTrigger>
          <TabsTrigger 
            value="taxes" 
            className="text-sm font-medium py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Taxes
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="permits" className="space-y-6">
            <PermitsSettingsTab />
          </TabsContent>

          <TabsContent value="business-licenses" className="space-y-6">
            <BusinessLicensesSettingsTab />
          </TabsContent>

          <TabsContent value="taxes" className="space-y-6">
            <TaxesSettingsTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default MunicipalSettings;