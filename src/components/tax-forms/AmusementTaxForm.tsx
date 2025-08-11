import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/formatters';

interface AmusementTaxData {
  grossReceipts: string;
  exemptReceipts: string;
  taxableReceipts: string;
  tax: string;
  penalty: string;
  interest: string;
  totalDue: string;
}

interface AmusementTaxFormProps {
  data: AmusementTaxData;
  onChange: (data: AmusementTaxData) => void;
  disabled?: boolean;
}

export const AmusementTaxForm: React.FC<AmusementTaxFormProps> = ({
  data,
  onChange,
  disabled = false
}) => {
  const handleInputChange = (field: keyof AmusementTaxData, value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    const newData = { ...data, [field]: numericValue };
    
    // Auto-calculate dependent fields
    const grossReceipts = parseFloat(newData.grossReceipts) || 0;
    const exemptReceipts = parseFloat(newData.exemptReceipts) || 0;
    
    // Calculate taxable receipts: Gross Receipts - Exempt Receipts
    const taxableReceipts = Math.max(0, grossReceipts - exemptReceipts);
    newData.taxableReceipts = taxableReceipts.toFixed(2);
    
    // Calculate tax: Taxable Receipts × 0.10 (10%)
    const tax = taxableReceipts * 0.10;
    newData.tax = tax.toFixed(2);
    
    const penalty = parseFloat(newData.penalty) || 0;
    const interest = parseFloat(newData.interest) || 0;
    
    // Calculate total due: Tax + Penalty + Interest
    const totalDue = tax + penalty + interest;
    newData.totalDue = totalDue.toFixed(2);
    
    onChange(newData);
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm">Amusement Tax Calculation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="gross-receipts" className="text-sm font-medium">
              Gross Receipts ($)
            </Label>
            <Input
              id="gross-receipts"
              type="text"
              placeholder="0.00"
              value={data.grossReceipts}
              onChange={(e) => handleInputChange('grossReceipts', e.target.value)}
              disabled={disabled}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="exempt-receipts" className="text-sm font-medium">
              Exempt Receipts ($)
            </Label>
            <Input
              id="exempt-receipts"
              type="text"
              placeholder="0.00"
              value={data.exemptReceipts}
              onChange={(e) => handleInputChange('exemptReceipts', e.target.value)}
              disabled={disabled}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="taxable-receipts" className="text-sm font-medium">
              Taxable Receipts ($)
            </Label>
            <Input
              id="taxable-receipts"
              type="text"
              value={data.taxableReceipts}
              disabled
              className="mt-1 bg-muted"
            />
          </div>
          
          <div>
            <Label htmlFor="tax-amount" className="text-sm font-medium">
              Tax (10%) ($)
            </Label>
            <Input
              id="tax-amount"
              type="text"
              value={data.tax}
              disabled
              className="mt-1 bg-muted"
            />
          </div>
          
          <div>
            <Label htmlFor="penalty" className="text-sm font-medium">
              Penalty ($)
            </Label>
            <Input
              id="penalty"
              type="text"
              placeholder="0.00"
              value={data.penalty}
              onChange={(e) => handleInputChange('penalty', e.target.value)}
              disabled={disabled}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="interest" className="text-sm font-medium">
              Interest ($)
            </Label>
            <Input
              id="interest"
              type="text"
              placeholder="0.00"
              value={data.interest}
              onChange={(e) => handleInputChange('interest', e.target.value)}
              disabled={disabled}
              className="mt-1"
            />
          </div>
          
          <div className="md:col-span-2">
            <Label htmlFor="total-due" className="text-sm font-medium">
              Total Due ($)
            </Label>
            <Input
              id="total-due"
              type="text"
              value={data.totalDue}
              disabled
              className="mt-1 bg-muted font-semibold"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};