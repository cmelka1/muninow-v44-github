import React from 'react';
import { SuperAdminLayout } from '@/components/layouts/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowLeft, FileText } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

const SuperAdminFinixOnboardingSuccess = () => {
  const [searchParams] = useSearchParams();
  const sellerId = searchParams.get('sellerId');
  const applicationId = searchParams.get('applicationId');
  const verificationStatus = searchParams.get('verificationStatus');

  return (
    <SuperAdminLayout>
      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-green-700">
                Application Submitted Successfully!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-600">
                The Finix seller onboarding application has been submitted and processed successfully.
              </p>
              
              {sellerId && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Seller ID:</span>
                    <span className="font-mono text-sm bg-white px-2 py-1 rounded border">
                      {sellerId}
                    </span>
                  </div>
                  
                  {applicationId && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Application ID:</span>
                      <span className="font-mono text-sm bg-white px-2 py-1 rounded border">
                        {applicationId}
                      </span>
                    </div>
                  )}
                  
                  {verificationStatus && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Verification Status:</span>
                      <span className={`px-2 py-1 rounded text-sm font-medium ${
                        verificationStatus === 'verified' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {verificationStatus.charAt(0).toUpperCase() + verificationStatus.slice(1)}
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-left">
                    <h3 className="font-medium text-blue-900">Next Steps</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      The application is now with Finix for processing. You can check the customer record 
                      in the customers section for updates on verification status and approval.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild>
                  <Link to="/superadmin/customers">
                    View Customers
                  </Link>
                </Button>
                
                <Button variant="outline" asChild>
                  <Link to="/superadmin/finix-onboarding">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Submit Another Application
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminFinixOnboardingSuccess;