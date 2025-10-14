import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DeleteMerchantDialog from './DeleteMerchantDialog';

interface Merchant {
  id: string;
  merchant_name: string;
  business_name: string;
  business_address_line1: string;
  business_address_line2?: string;
  business_city: string;
  business_state: string;
  business_zip_code: string;
  business_country: string;
}

interface MerchantProfileTabProps {
  merchant: Merchant;
  onDelete?: (merchantId: string) => Promise<void>;
  isDeleting?: boolean;
}

const MerchantProfileTab: React.FC<MerchantProfileTabProps> = ({ 
  merchant, 
  onDelete, 
  isDeleting = false 
}) => {
  const formatAddress = () => {
    const addressParts = [
      merchant.business_address_line1,
      merchant.business_address_line2,
      `${merchant.business_city}, ${merchant.business_state} ${merchant.business_zip_code}`,
      merchant.business_country
    ].filter(Boolean);
    
    return addressParts.join('\n');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Merchant Name</label>
              <p className="text-base font-medium text-gray-900">
                {merchant.merchant_name || merchant.business_name}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Business Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Address</label>
              <div className="text-base text-gray-900 whitespace-pre-line">
                {formatAddress()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {onDelete && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">Delete this merchant</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Once deleted, this merchant cannot be recovered. All associated data will be permanently removed.
                </p>
              </div>
              <DeleteMerchantDialog
                merchantName={merchant.merchant_name || merchant.business_name}
                merchantId={merchant.id}
                onDelete={onDelete}
                isDeleting={isDeleting}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MerchantProfileTab;