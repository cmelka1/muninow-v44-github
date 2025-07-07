import React from 'react';
import { SuperAdminLayout } from '@/components/layouts/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SuperAdminCustomers = () => {
  return (
    <SuperAdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Customers
          </h1>
          <p className="text-gray-600">
            Manage merchant accounts and payment processing
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Customer Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Customer management features will be added here.
            </p>
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminCustomers;