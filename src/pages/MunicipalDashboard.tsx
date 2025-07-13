import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';

const MunicipalDashboard = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-center min-h-[50vh]">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <CardTitle className="text-2xl">Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Municipal Dashboard features are under development
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MunicipalDashboard;