import React from 'react';
import { CreditCard, Building, Star, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface PaymentMethodSelectorProps {
  paymentInstruments: any[];
  selectedPaymentMethod: string | null;
  onSelectPaymentMethod: (id: string) => void;
  isLoading?: boolean;
  maxMethods?: number;
  onAddPaymentMethod?: () => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  paymentInstruments,
  selectedPaymentMethod,
  onSelectPaymentMethod,
  isLoading = false,
  maxMethods = 3,
  onAddPaymentMethod
}) => {
  const getCardBrandIcon = (cardBrand: string) => {
    const brandMap: { [key: string]: string } = {
      'visa': 'visa-brandmark-blue-1960x622.webp',
      'mastercard': 'Mastercard-Logo.wine.png',
      'amex': 'Amex_logo_color.png',
      'american express': 'Amex_logo_color.png',
      'discover': 'Discover Logo.png'
    };

    const fileName = brandMap[cardBrand.toLowerCase()];
    if (fileName) {
      return `https://qcuiuubbaozcmejzvxje.supabase.co/storage/v1/object/public/credit-card-logos/${fileName}`;
    }
    return null;
  };

  const getCardIcon = (instrumentType: string, cardBrand?: string) => {
    if (instrumentType === 'BANK_ACCOUNT') {
      return <Building className="h-6 w-6 text-primary" />;
    }
    
    if (cardBrand) {
      const logoUrl = getCardBrandIcon(cardBrand);
      if (logoUrl) {
        return (
          <img 
            src={logoUrl} 
            alt={`${cardBrand} logo`}
            className="h-6 w-6 object-contain"
          />
        );
      }
    }
    
    return <CreditCard className="h-6 w-6 text-primary" />;
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: maxMethods }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  const displayMethods = paymentInstruments.slice(0, maxMethods);

  return (
    <div className="space-y-3">
      {displayMethods.map((instrument) => (
        <div
          key={instrument.id}
          className={`border rounded-lg p-4 cursor-pointer transition-all ${
            selectedPaymentMethod === instrument.id
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
          onClick={() => onSelectPaymentMethod(instrument.id)}
        >
          <div className="flex items-center space-x-3">
            {getCardIcon(instrument.instrument_type, instrument.card_brand || undefined)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium truncate">
                  {instrument.display_name}
                </p>
                {instrument.is_default && (
                  <Badge variant="default" className="text-xs">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Default
                  </Badge>
                )}
              </div>
              {instrument.instrument_type === 'PAYMENT_CARD' && (
                <p className="text-xs text-muted-foreground">
                  Expires {instrument.card_expiration_month?.toString().padStart(2, '0')}/{instrument.card_expiration_year}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
      
      {onAddPaymentMethod && (
        <div
          className="border border-dashed rounded-lg p-4 cursor-pointer transition-all hover:border-primary/50 hover:bg-primary/5"
          onClick={onAddPaymentMethod}
        >
          <div className="flex items-center space-x-3">
            <div className="h-6 w-6 rounded-full border-2 border-dashed border-primary flex items-center justify-center">
              <Plus className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary">
                Add New Payment Method
              </p>
              <p className="text-xs text-muted-foreground">
                Add a credit card or bank account
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;