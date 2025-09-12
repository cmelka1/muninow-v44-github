import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Building, DollarSign } from 'lucide-react';

interface UnifiedPaymentSummaryProps {
  entityType: 'permit' | 'business_license' | 'tax_submission' | 'service_application';
  entityName: string;
  baseAmount: number;
  serviceFee?: number;
  totalAmount: number;
  paymentMethodType?: 'card' | 'ach' | 'google-pay' | 'apple-pay';
  selectedPaymentMethodName?: string;
  className?: string;
}

const getEntityLabel = (entityType: string): string => {
  const labels = {
    permit: 'Permit Application',
    business_license: 'Business License',
    tax_submission: 'Tax Submission',
    service_application: 'Service Application'
  };
  return labels[entityType as keyof typeof labels] || 'Payment';
};

const getEntityIcon = (entityType: string) => {
  const icons = {
    permit: Building,
    business_license: CreditCard,
    tax_submission: DollarSign,
    service_application: Building
  };
  const Icon = icons[entityType as keyof typeof icons] || CreditCard;
  return <Icon className="h-5 w-5" />;
};

export const UnifiedPaymentSummary: React.FC<UnifiedPaymentSummaryProps> = ({
  entityType,
  entityName,
  baseAmount,
  serviceFee = 0,
  totalAmount,
  paymentMethodType,
  selectedPaymentMethodName,
  className = ''
}) => {
  const entityLabel = getEntityLabel(entityType);
  
  return (
    <Card className={`bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-primary">
          {getEntityIcon(entityType)}
          Payment Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {entityLabel}
              </Badge>
            </div>
            <p className="font-medium text-foreground">{entityName}</p>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Base Amount</span>
            <span className="font-medium">${(baseAmount / 100).toFixed(2)}</span>
          </div>
          
          {serviceFee > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Service Fee</span>
              <span className="font-medium">${(serviceFee / 100).toFixed(2)}</span>
            </div>
          )}
          
          <Separator className="my-2" />
          
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground">Total Amount</span>
            <span className="font-bold text-lg text-primary">
              ${(totalAmount / 100).toFixed(2)}
            </span>
          </div>
        </div>

        {selectedPaymentMethodName && (
          <>
            <Separator />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Payment Method</span>
              <div className="flex items-center gap-2">
                {paymentMethodType === 'ach' ? (
                  <Building className="h-4 w-4 text-primary" />
                ) : (
                  <CreditCard className="h-4 w-4 text-primary" />
                )}
                <span className="font-medium">{selectedPaymentMethodName}</span>
              </div>
            </div>
          </>
        )}
        
        <div className="bg-muted/50 rounded-lg p-3 mt-4">
          <div className="flex items-start gap-2">
            <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your payment will be processed securely. You will receive a confirmation email once the transaction is complete.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};