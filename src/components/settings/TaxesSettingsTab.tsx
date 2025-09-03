import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const TaxesSettingsTab = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tax Configuration</CardTitle>
          <CardDescription>
            Configure tax settings, rates, and submission requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Tax settings configuration will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};