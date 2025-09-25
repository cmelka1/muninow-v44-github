import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentReadinessChecklistProps {
  isSubmissionCreated: boolean;
  isMerchantConfigured: boolean;
  isPaymentMethodSelected: boolean;
  isAmountValid: boolean;
  isServiceFeeLoaded: boolean;
  merchantName?: string;
  className?: string;
}

interface ChecklistItem {
  label: string;
  status: 'complete' | 'incomplete' | 'warning';
  tip?: string;
}

export const PaymentReadinessChecklist: React.FC<PaymentReadinessChecklistProps> = ({
  isSubmissionCreated,
  isMerchantConfigured,
  isPaymentMethodSelected,
  isAmountValid,
  isServiceFeeLoaded,
  merchantName,
  className
}) => {
  const items: ChecklistItem[] = [
    {
      label: 'Submission created',
      status: isSubmissionCreated ? 'complete' : 'incomplete',
      tip: !isSubmissionCreated ? 'Complete the form and click "Create Submission"' : undefined
    },
    {
      label: `${merchantName || 'Merchant'} configured`,
      status: isMerchantConfigured ? 'complete' : 'incomplete',
      tip: !isMerchantConfigured ? 'Municipality payment processing not set up' : undefined
    },
    {
      label: 'Payment method selected',
      status: isPaymentMethodSelected ? 'complete' : 'incomplete',
      tip: !isPaymentMethodSelected ? 'Choose a payment method below' : undefined
    },
    {
      label: 'Amount valid',
      status: isAmountValid ? 'complete' : 'incomplete',
      tip: !isAmountValid ? 'Enter a valid payment amount' : undefined
    },
    {
      label: 'Fees calculated',
      status: isServiceFeeLoaded ? 'complete' : 'warning',
      tip: !isServiceFeeLoaded ? 'Using standard fee rates' : undefined
    }
  ];

  const getIcon = (status: ChecklistItem['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'incomplete':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
    }
  };

  const getTextColor = (status: ChecklistItem['status']) => {
    switch (status) {
      case 'complete':
        return 'text-green-700';
      case 'incomplete':
        return 'text-red-600';
      case 'warning':
        return 'text-amber-600';
    }
  };

  const incompleteItems = items.filter(item => item.status === 'incomplete');
  const allReady = incompleteItems.length === 0;

  return (
    <Card className={cn("border-l-4", allReady ? "border-l-green-500" : "border-l-amber-500", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {allReady ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-600" />
              Ready to Pay
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 text-amber-500" />
              Payment Readiness
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              {getIcon(item.status)}
              <span className={getTextColor(item.status)}>
                {item.label}
              </span>
            </div>
          ))}
          {incompleteItems.length > 0 && (
            <div className="mt-3 p-2 bg-amber-50 rounded-md">
              <p className="text-xs text-amber-700">
                <strong>Next steps:</strong>{' '}
                {incompleteItems.map(item => item.tip).filter(Boolean).join('. ')}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};