import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SuperAdminLayout } from '@/components/layouts/SuperAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { useCustomerDetail } from '@/hooks/useCustomerDetail';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import BankAccountStep from '@/components/merchant/BankAccountStep';
import { merchantAccountSchema, MerchantAccountFormData } from '@/schemas/merchantAccountSchema';
import { supabase } from '@/integrations/supabase/client';

const SuperAdminMerchantAccountForm = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const { data: customer, isLoading, error } = useCustomerDetail(customerId!);

  const form = useForm<MerchantAccountFormData>({
    resolver: zodResolver(merchantAccountSchema),
    defaultValues: {
      bankAccount: {
        nameOnAccount: '',
        accountNickname: '',
        routingNumber: '',
        accountNumber: '',
        accountNumberConfirmation: '',
      },
    },
  });

  const handleGoBack = () => {
    navigate(`/superadmin/customers/${customerId}`);
  };

  const handleSubmit = async () => {
    const isValid = await form.trigger('bankAccount');
    if (isValid) {
      try {
        console.log('Submitting bank account data...');
        
        const { data, error } = await supabase.functions.invoke('create-finix-customer-payment-instrument', {
          body: {
            customerId,
            bankAccount: form.getValues('bankAccount')
          }
        });

        if (error) {
          console.error('Error creating payment instrument:', error);
          alert(`Error: ${error.message}`);
          return;
        }

        if (data?.success) {
          console.log('Payment instrument created successfully:', data);
          // Navigate to success page with payment method details
          const params = new URLSearchParams({
            paymentMethodId: data.paymentMethod.id,
            finixId: data.paymentMethod.finixId,
            accountHolderName: data.paymentMethod.accountHolderName,
            maskedAccountNumber: data.paymentMethod.maskedAccountNumber,
            ...(data.paymentMethod.accountNickname && { accountNickname: data.paymentMethod.accountNickname })
          });
          navigate(`/superadmin/customers/${customerId}/bank-account/success?${params.toString()}`);
        } else {
          console.error('Unexpected response:', data);
          alert('An unexpected error occurred. Please try again.');
        }
      } catch (error) {
        console.error('Error submitting bank account:', error);
        alert('Failed to submit bank account. Please try again.');
      }
    }
  };

  const getCustomerName = () => {
    if (!customer) return 'Loading...';
    return customer.business_name || 'Unknown Customer';
  };

  if (error) {
    return (
      <SuperAdminLayout>
        <div className="p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Customer Not Found</h1>
            <p className="text-gray-600 mb-6">
              The customer you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button onClick={handleGoBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Customer
            </Button>
          </div>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <div className="p-8">
        {/* Header with Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/superadmin/dashboard">SuperAdmin Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/superadmin/customers">Customers</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/superadmin/customers/${customerId}`}>
                  {getCustomerName()}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Add Bank Account</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Add Bank Account
              </h1>
              <p className="text-gray-600 mt-1">
                Set up bank account for {getCustomerName()}
              </p>
            </div>
            <Button onClick={handleGoBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Customer
            </Button>
          </div>
        </div>

        {/* Form Content */}
        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Form {...form}>
            <form className="space-y-6">
              <BankAccountStep 
                businessName={customer?.business_name || ''}
                finixIdentityId={customer?.finix_identity_id || ''}
              />

              {/* Form Actions */}
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoBack}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                
                <Button
                  type="button"
                  onClick={handleSubmit}
                >
                  Submit for Approval
                </Button>
              </div>
            </form>
          </Form>
        )}
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminMerchantAccountForm;