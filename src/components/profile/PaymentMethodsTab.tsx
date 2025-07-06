import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Plus, Trash2, Star, Building } from 'lucide-react';
import { AddPaymentMethodDialog } from './AddPaymentMethodDialog';
import { useUserPaymentInstruments } from '@/hooks/useUserPaymentInstruments';

export const PaymentMethodsTab = () => {
  const {
    paymentInstruments,
    isLoading,
    loadPaymentInstruments,
    setDefaultPaymentInstrument,
    deletePaymentInstrument,
  } = useUserPaymentInstruments();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleSetDefault = async (instrumentId: string) => {
    await setDefaultPaymentInstrument(instrumentId);
  };

  const handleDeletePaymentMethod = async (instrumentId: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) return;
    await deletePaymentInstrument(instrumentId);
  };

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
      return <Building className="h-8 w-8 text-primary" />;
    }
    
    if (cardBrand) {
      const logoUrl = getCardBrandIcon(cardBrand);
      if (logoUrl) {
        return (
          <img 
            src={logoUrl} 
            alt={`${cardBrand} logo`}
            className="h-8 w-8 object-contain"
          />
        );
      }
    }
    
    return <CreditCard className="h-8 w-8 text-primary" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Payment Methods
            </CardTitle>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {paymentInstruments.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 mb-2">No payment methods added</p>
              <p className="text-sm text-slate-500 mb-4">
                Add a payment method to make payments easier
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {paymentInstruments.map((instrument) => (
                <Card key={instrument.id} className="border-slate-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getCardIcon(instrument.instrument_type, instrument.card_brand || undefined)}
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-slate-800">
                              {instrument.display_name}
                            </h4>
                            {instrument.is_default && (
                              <Badge variant="default" className="text-xs">
                                <Star className="h-3 w-3 mr-1" />
                                Default
                              </Badge>
                            )}
                          </div>
                          {instrument.instrument_type === 'PAYMENT_CARD' && 
                           instrument.card_expiration_month && 
                           instrument.card_expiration_year && (
                            <p className="text-sm text-slate-500">
                              Expires {instrument.card_expiration_month.toString().padStart(2, '0')}/{instrument.card_expiration_year}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!instrument.is_default && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSetDefault(instrument.id)}
                          >
                            Set Default
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeletePaymentMethod(instrument.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddPaymentMethodDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={loadPaymentInstruments}
      />

      {paymentInstruments.length > 0 && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">
              Payment Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Secure Payment Processing</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    All payment methods are encrypted and processed securely. We never store your full card numbers.
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
              <div>
                <h5 className="font-medium text-slate-800 mb-2">Accepted Payment Types</h5>
                <ul className="space-y-1">
                  <li>• Credit Cards (Visa, Mastercard, American Express)</li>
                  <li>• Debit Cards</li>
                  <li>• Bank Accounts (ACH)</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-slate-800 mb-2">Security Features</h5>
                <ul className="space-y-1">
                  <li>• 256-bit SSL encryption</li>
                  <li>• PCI DSS compliant</li>
                  <li>• Fraud monitoring</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};