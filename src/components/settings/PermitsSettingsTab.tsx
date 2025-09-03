import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const PermitsSettingsTab = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Permit Configuration</CardTitle>
          <CardDescription>
            Configure permit settings, questions, and workflow for your municipality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Permit settings configuration will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};