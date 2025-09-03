import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const BusinessLicensesSettingsTab = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Business License Configuration</CardTitle>
          <CardDescription>
            Configure business license settings, types, and approval workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Business license settings configuration will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};