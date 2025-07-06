import React from 'react';
import { SuperAdminLayout } from '@/components/layouts/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowLeft, FileText } from 'lucide-react';
import { Link, useSearchParams, useParams } from 'react-router-dom';

const SuperAdminBankAccountSuccess = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const [searchParams] = useSearchParams();
  const paymentMethodId = searchParams.get('paymentMethodId');
  const finixId = searchParams.get('finixId');
  const accountNickname = searchParams.get('accountNickname');
  const maskedAccountNumber = searchParams.get('maskedAccountNumber');
  const accountHolderName = searchParams.get('accountHolderName');

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
                Bank Account Added Successfully!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-600">
                The bank account has been added and is pending verification with Finix.
              </p>
              
              {finixId && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Payment Method ID:</span>
                    <span className="font-mono text-sm bg-white px-2 py-1 rounded border">
                      {paymentMethodId}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Finix ID:</span>
                    <span className="font-mono text-sm bg-white px-2 py-1 rounded border">
                      {finixId}
                    </span>
                  </div>
                  
                  {accountHolderName && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Account Holder:</span>
                      <span className="text-sm bg-white px-2 py-1 rounded border">
                        {accountHolderName}
                      </span>
                    </div>
                  )}
                  
                  {maskedAccountNumber && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Account Number:</span>
                      <span className="font-mono text-sm bg-white px-2 py-1 rounded border">
                        {maskedAccountNumber}
                      </span>
                    </div>
                  )}
                  
                  {accountNickname && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Nickname:</span>
                      <span className="text-sm bg-white px-2 py-1 rounded border">
                        {accountNickname}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Status:</span>
                    <span className="px-2 py-1 rounded text-sm font-medium bg-yellow-100 text-yellow-800">
                      Pending Verification
                    </span>
                  </div>
                </div>
              )}
              
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-left">
                    <h3 className="font-medium text-blue-900">Next Steps</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      The bank account is now with Finix for verification. You can check the customer record 
                      for updates on verification status and approval. The verification process typically takes 1-2 business days.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild>
                  <Link to={`/superadmin/customers/${customerId}`}>
                    View Customer
                  </Link>
                </Button>
                
                <Button variant="outline" asChild>
                  <Link to={`/superadmin/customers/${customerId}/add-merchant-account`}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Add Another Account
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

export default SuperAdminBankAccountSuccess;