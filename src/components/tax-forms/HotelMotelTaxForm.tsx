import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/formatters';

interface HotelMotelTaxData {
  totalReceipts: string;
  exemptReceipts: string;
  netReceipts: string;
  tax: string;
  penalty: string;
  interest: string;
  totalDue: string;
}

interface HotelMotelTaxFormProps {
  data: HotelMotelTaxData;
  onChange: (data: HotelMotelTaxData) => void;
  disabled?: boolean;
}

export const HotelMotelTaxForm: React.FC<HotelMotelTaxFormProps> = ({
  data,
  onChange,
  disabled = false
}) => {
  const handleInputChange = (field: keyof HotelMotelTaxData, value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    const newData = { ...data, [field]: numericValue };
    
    // Auto-calculate dependent fields
    const totalReceipts = parseFloat(newData.totalReceipts) || 0;
    const exemptReceipts = parseFloat(newData.exemptReceipts) || 0;
    
    // Calculate net receipts: Total Receipts - Exempt Receipts
    const netReceipts = Math.max(0, totalReceipts - exemptReceipts);
    newData.netReceipts = netReceipts.toFixed(2);
    
    // Calculate tax: Net Receipts × 0.05 (5%)
    const tax = netReceipts * 0.05;
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
        <CardTitle className="text-sm">Hotel & Motel Tax Calculation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="total-receipts" className="text-sm font-medium">
              Total Monthly Receipts ($)
            </Label>
            <Input
              id="total-receipts"
              type="text"
              placeholder="0.00"
              value={data.totalReceipts}
              onChange={(e) => handleInputChange('totalReceipts', e.target.value)}
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
            <Label htmlFor="net-receipts" className="text-sm font-medium">
              Net Receipts ($)
            </Label>
            <Input
              id="net-receipts"
              type="text"
              value={data.netReceipts}
              disabled
              className="mt-1 bg-muted"
            />
          </div>
          
          <div>
            <Label htmlFor="tax-amount" className="text-sm font-medium">
              Tax (5%) ($)
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