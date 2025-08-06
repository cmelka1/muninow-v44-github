import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Building2, FileText, Calculator, CheckCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { formatCurrency } from '@/lib/formatters';
import { useToast } from '@/hooks/use-toast';
import { normalizePhoneInput } from '@/lib/phoneUtils';
import { useAuth } from '@/contexts/AuthContext';

interface PayTaxDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SelectedMunicipality {
  id: string;
  name: string;
  city: string;
  state: string;
}

interface TaxType {
  id: string;
  name: string;
  description: string;
  rate: number;
  calculationMethod: string;
}

interface BusinessInformation {
  businessName: string;
  federalTaxId: string;
  businessAddress: string;
  contactPerson: string;
  phoneNumber: string;
  email: string;
}

interface TaxCalculationData {
  grossReceipts?: number;
  totalRooms?: number;
  occupiedNights?: number;
  admissionReceipts?: number;
}

// Mock data for municipalities
const mockMunicipalities: SelectedMunicipality[] = [
  { id: '1', name: 'City of Springfield', city: 'Springfield', state: 'IL' },
  { id: '2', name: 'City of Shelbyville', city: 'Shelbyville', state: 'IL' },
  { id: '3', name: 'City of Capital City', city: 'Capital City', state: 'IL' },
];

// Tax types with updated structure
const taxTypes: TaxType[] = [
  {
    id: 'food-beverage',
    name: 'Food & Beverage',
    description: 'Tax on gross receipts from food and beverage sales including restaurants, bars, and catering services.',
    rate: 3,
    calculationMethod: 'Based on gross receipts from food and beverage sales at 3% rate'
  },
  {
    id: 'amusement',
    name: 'Amusement',
    description: 'Tax on admission receipts from entertainment venues, theaters, sporting events, and recreational facilities.',
    rate: 5,
    calculationMethod: 'Based on admission receipts and entertainment revenue at 5% rate'
  },
  {
    id: 'hotel-motels',
    name: 'Hotel & Motels',
    description: 'Tax on accommodations including hotels, motels, bed & breakfasts, and short-term rental properties.',
    rate: 2,
    calculationMethod: 'Based on occupied room nights at $2 per night rate'
  }
];

export const PayTaxDialog: React.FC<PayTaxDialogProps> = ({
  open,
  onOpenChange
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedMunicipality, setSelectedMunicipality] = useState<SelectedMunicipality | null>(null);
  const [selectedTaxType, setSelectedTaxType] = useState<TaxType | null>(null);
  const [businessInfo, setBusinessInfo] = useState<BusinessInformation>({
    businessName: '',
    federalTaxId: '',
    businessAddress: '',
    contactPerson: '',
    phoneNumber: '',
    email: ''
  });
  const [useProfileInfo, setUseProfileInfo] = useState(false);
  const [taxCalculationData, setTaxCalculationData] = useState<TaxCalculationData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const dialogContentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { profile } = useAuth();

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (!selectedMunicipality) errors.municipality = 'Municipality is required';
    if (!selectedTaxType) errors.taxType = 'Tax type is required';
    return errors;
  };

  const validateStep2 = () => {
    const errors: Record<string, string> = {};
    if (!businessInfo.businessName) errors.businessName = 'Business name is required';
    if (!businessInfo.federalTaxId) errors.federalTaxId = 'Federal Tax ID is required';
    if (!businessInfo.businessAddress) errors.businessAddress = 'Business address is required';
    if (!businessInfo.contactPerson) errors.contactPerson = 'Contact person is required';
    if (!businessInfo.phoneNumber) errors.phoneNumber = 'Phone number is required';
    if (!businessInfo.email) errors.email = 'Email address is required';
    return errors;
  };

  const validateStep3 = () => {
    const errors: Record<string, string> = {};
    
    if (selectedTaxType?.id === 'food-beverage') {
      if (!taxCalculationData.grossReceipts || taxCalculationData.grossReceipts <= 0) {
        errors.grossReceipts = 'Gross receipts amount is required';
      }
    }
    
    if (selectedTaxType?.id === 'hotel-motels') {
      if (!taxCalculationData.totalRooms || taxCalculationData.totalRooms <= 0) {
        errors.totalRooms = 'Total rooms is required';
      }
      if (!taxCalculationData.occupiedNights || taxCalculationData.occupiedNights <= 0) {
        errors.occupiedNights = 'Occupied nights is required';
      }
    }
    
    if (selectedTaxType?.id === 'amusement') {
      if (!taxCalculationData.admissionReceipts || taxCalculationData.admissionReceipts <= 0) {
        errors.admissionReceipts = 'Admission receipts amount is required';
      }
    }
    
    return errors;
  };

  const clearFieldError = (fieldName: string) => {
    if (validationErrors[fieldName]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      const errors = validateStep1();
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        const firstErrorField = document.querySelector(`[data-error="true"]`);
        if (firstErrorField) {
          firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }
    } else if (currentStep === 2) {
      const errors = validateStep2();
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        const firstErrorField = document.querySelector(`[data-error="true"]`);
        if (firstErrorField) {
          firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }
    }
    
    setValidationErrors({});
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      if (dialogContentRef.current) {
        dialogContentRef.current.scrollTop = 0;
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      if (dialogContentRef.current) {
        dialogContentRef.current.scrollTop = 0;
      }
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setSelectedMunicipality(null);
    setSelectedTaxType(null);
    setBusinessInfo({
      businessName: '',
      federalTaxId: '',
      businessAddress: '',
      contactPerson: '',
      phoneNumber: '',
      email: ''
    });
    setUseProfileInfo(false);
    setTaxCalculationData({});
    setIsSubmitting(false);
    setValidationErrors({});
    onOpenChange(false);
  };

  const calculateTax = () => {
    if (!selectedTaxType) return 0;
    
    switch (selectedTaxType.id) {
      case 'food-beverage':
        return (taxCalculationData.grossReceipts || 0) * (selectedTaxType.rate / 100);
      case 'hotel-motels':
        return (taxCalculationData.occupiedNights || 0) * selectedTaxType.rate;
      case 'amusement':
        return (taxCalculationData.admissionReceipts || 0) * (selectedTaxType.rate / 100);
      default:
        return 0;
    }
  };

  const handleSubmit = async () => {
    const errors = validateStep3();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    if (!profile?.id) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to submit a tax payment.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const calculatedTax = calculateTax();
      
      toast({
        title: "Tax calculation completed!",
        description: `Tax due: ${formatCurrency(calculatedTax)}. Payment processing will be implemented soon.`,
      });

      handleClose();
    } catch (error: any) {
      console.error('Submission error:', error);
      toast({
        title: "Submission failed",
        description: error.message || "An error occurred while processing your tax payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Municipality Selection */}
      <Card className="animate-fade-in">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Municipality Selection</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="municipality" className="text-sm font-medium">
              Select Municipality *
            </Label>
            <p className="text-xs text-muted-foreground mb-2">
              Choose the municipality where your business operates and owes taxes
            </p>
            <Select 
              onValueChange={(value) => {
                const municipality = mockMunicipalities.find(m => m.id === value);
                setSelectedMunicipality(municipality || null);
                clearFieldError('municipality');
              }}
              value={selectedMunicipality?.id || ''}
            >
              <SelectTrigger 
                className={validationErrors.municipality ? 'border-destructive' : ''}
                data-error={!!validationErrors.municipality}
              >
                <SelectValue placeholder="Choose your municipality" />
              </SelectTrigger>
              <SelectContent>
                {mockMunicipalities.map((municipality) => (
                  <SelectItem key={municipality.id} value={municipality.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{municipality.name}</span>
                      <span className="text-xs text-muted-foreground">{municipality.city}, {municipality.state}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors.municipality && (
              <p className="text-sm text-destructive mt-1">{validationErrors.municipality}</p>
            )}
          </div>

          {selectedMunicipality && (
            <div className="animate-fade-in bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className="font-medium text-primary">Selected: {selectedMunicipality.name}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedMunicipality.city}, {selectedMunicipality.state}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tax Type Selection */}
      <Card className="animate-fade-in [animation-delay:150ms]">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-secondary" />
            <CardTitle className="text-lg">Tax Type Selection</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="taxType" className="text-sm font-medium">
              Tax Type *
            </Label>
            <p className="text-xs text-muted-foreground mb-2">
              Select the type of business tax you need to pay
            </p>
            <Select 
              onValueChange={(value) => {
                const taxType = taxTypes.find(t => t.id === value);
                setSelectedTaxType(taxType || null);
                clearFieldError('taxType');
              }}
              value={selectedTaxType?.id || ''}
            >
              <SelectTrigger 
                className={validationErrors.taxType ? 'border-destructive' : ''}
                data-error={!!validationErrors.taxType}
              >
                <SelectValue placeholder="Select tax type" />
              </SelectTrigger>
              <SelectContent>
                {taxTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{type.name}</span>
                      <span className="text-xs text-muted-foreground">{type.rate}% rate</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors.taxType && (
              <p className="text-sm text-destructive mt-1">{validationErrors.taxType}</p>
            )}
          </div>

          {selectedTaxType && (
            <div className="animate-fade-in bg-secondary/5 border border-secondary/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-secondary">{selectedTaxType.name}</h4>
                <span className="text-sm font-medium bg-secondary/10 text-secondary px-2 py-1 rounded">
                  {selectedTaxType.rate}% Rate
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{selectedTaxType.description}</p>
              <Separator className="my-3" />
              <div className="text-xs text-muted-foreground">
                <p className="font-medium mb-1">Calculation Method:</p>
                <p>{selectedTaxType.calculationMethod}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      {/* Use Profile Information Toggle */}
      {profile && (
        <Card className="animate-fade-in">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="use-profile-info"
                checked={useProfileInfo}
                onCheckedChange={(checked) => {
                  setUseProfileInfo(checked);
                  if (checked && profile) {
                    setBusinessInfo(prev => ({
                      ...prev,
                      contactPerson: '',
                      email: profile.email || '',
                      phoneNumber: profile.phone || ''
                    }));
                  }
                }}
              />
              <Label htmlFor="use-profile-info" className="text-sm font-medium">
                Use information from my profile
              </Label>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Auto-fill contact information from your user profile
            </p>
          </CardContent>
        </Card>
      )}

      {/* Business Information */}
      <Card className="animate-fade-in [animation-delay:150ms]">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Business Information</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Provide your business details for tax filing purposes
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="businessName" className="text-sm font-medium">
                Business Name *
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                Legal name as registered with the state
              </p>
              <Input
                id="businessName"
                value={businessInfo.businessName}
                onChange={(e) => {
                  setBusinessInfo(prev => ({ ...prev, businessName: e.target.value }));
                  clearFieldError('businessName');
                }}
                placeholder="Enter business name"
                className={validationErrors.businessName ? 'border-destructive' : ''}
                data-error={!!validationErrors.businessName}
              />
              {validationErrors.businessName && (
                <p className="text-sm text-destructive mt-1">{validationErrors.businessName}</p>
              )}
            </div>

            <div>
              <Label htmlFor="federalTaxId" className="text-sm font-medium">
                Federal Tax ID (EIN) *
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                Your Employer Identification Number (XX-XXXXXXX)
              </p>
              <Input
                id="federalTaxId"
                value={businessInfo.federalTaxId}
                onChange={(e) => {
                  setBusinessInfo(prev => ({ ...prev, federalTaxId: e.target.value }));
                  clearFieldError('federalTaxId');
                }}
                placeholder="XX-XXXXXXX"
                className={validationErrors.federalTaxId ? 'border-destructive' : ''}
                data-error={!!validationErrors.federalTaxId}
              />
              {validationErrors.federalTaxId && (
                <p className="text-sm text-destructive mt-1">{validationErrors.federalTaxId}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="businessAddress" className="text-sm font-medium">
              Business Address *
            </Label>
            <p className="text-xs text-muted-foreground mb-2">
              Physical address of your business location
            </p>
            <Textarea
              id="businessAddress"
              value={businessInfo.businessAddress}
              onChange={(e) => {
                setBusinessInfo(prev => ({ ...prev, businessAddress: e.target.value }));
                clearFieldError('businessAddress');
              }}
              placeholder="Enter complete business address including street, city, state, and ZIP"
              rows={3}
              className={validationErrors.businessAddress ? 'border-destructive' : ''}
              data-error={!!validationErrors.businessAddress}
            />
            {validationErrors.businessAddress && (
              <p className="text-sm text-destructive mt-1">{validationErrors.businessAddress}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="animate-fade-in [animation-delay:300ms]">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-secondary" />
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Primary contact details for tax correspondence
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactPerson" className="text-sm font-medium">
                Contact Person *
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                Primary contact for tax matters
              </p>
              <Input
                id="contactPerson"
                value={businessInfo.contactPerson}
                onChange={(e) => {
                  setBusinessInfo(prev => ({ ...prev, contactPerson: e.target.value }));
                  clearFieldError('contactPerson');
                }}
                placeholder="Full name"
                className={validationErrors.contactPerson ? 'border-destructive' : ''}
                data-error={!!validationErrors.contactPerson}
              />
              {validationErrors.contactPerson && (
                <p className="text-sm text-destructive mt-1">{validationErrors.contactPerson}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phoneNumber" className="text-sm font-medium">
                Phone Number *
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                Business phone number for contact
              </p>
              <Input
                id="phoneNumber"
                value={businessInfo.phoneNumber}
                onChange={(e) => {
                  const formatted = normalizePhoneInput(e.target.value);
                  setBusinessInfo(prev => ({ ...prev, phoneNumber: formatted }));
                  clearFieldError('phoneNumber');
                }}
                placeholder="(555) 123-4567"
                className={validationErrors.phoneNumber ? 'border-destructive' : ''}
                data-error={!!validationErrors.phoneNumber}
              />
              {validationErrors.phoneNumber && (
                <p className="text-sm text-destructive mt-1">{validationErrors.phoneNumber}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address *
            </Label>
            <p className="text-xs text-muted-foreground mb-2">
              Business email for tax notifications and receipts
            </p>
            <Input
              id="email"
              type="email"
              value={businessInfo.email}
              onChange={(e) => {
                setBusinessInfo(prev => ({ ...prev, email: e.target.value }));
                clearFieldError('email');
              }}
              placeholder="business@example.com"
              className={validationErrors.email ? 'border-destructive' : ''}
              data-error={!!validationErrors.email}
            />
            {validationErrors.email && (
              <p className="text-sm text-destructive mt-1">{validationErrors.email}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStep3 = () => {
    if (!selectedTaxType) return null;

    const taxAmount = calculateTax();

    return (
      <div className="space-y-6">
        {/* Tax Type Summary */}
        <Card className="animate-fade-in">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <Calculator className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Tax Calculation</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Calculate your {selectedTaxType.name} tax based on business activity
            </p>
          </CardHeader>
          <CardContent>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-primary">{selectedTaxType.name}</h4>
                <span className="text-sm font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                  {selectedTaxType.rate}% Rate
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{selectedTaxType.description}</p>
              <Separator className="my-3" />
              <div className="text-xs text-muted-foreground">
                <p className="font-medium mb-1">Calculation Method:</p>
                <p>{selectedTaxType.calculationMethod}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tax Calculation Inputs */}
        <Card className="animate-fade-in [animation-delay:150ms]">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Enter Tax Information</CardTitle>
            <p className="text-sm text-muted-foreground">
              Provide the required information to calculate your tax liability
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedTaxType.id === 'food-beverage' && (
              <div>
                <Label htmlFor="grossReceipts" className="text-sm font-medium">
                  Gross Receipts ($) *
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Total gross receipts from food and beverage sales for the tax period
                </p>
                <Input
                  id="grossReceipts"
                  type="number"
                  min="0"
                  step="0.01"
                  value={taxCalculationData.grossReceipts || ''}
                  onChange={(e) => {
                    setTaxCalculationData(prev => ({ ...prev, grossReceipts: parseFloat(e.target.value) || 0 }));
                    clearFieldError('grossReceipts');
                  }}
                  placeholder="Enter gross receipts amount"
                  className={validationErrors.grossReceipts ? 'border-destructive' : ''}
                  data-error={!!validationErrors.grossReceipts}
                />
                {validationErrors.grossReceipts && (
                  <p className="text-sm text-destructive mt-1">{validationErrors.grossReceipts}</p>
                )}
              </div>
            )}

            {selectedTaxType.id === 'hotel-motels' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="totalRooms" className="text-sm font-medium">
                    Total Rooms *
                  </Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Total number of rooms in your establishment
                  </p>
                  <Input
                    id="totalRooms"
                    type="number"
                    min="1"
                    value={taxCalculationData.totalRooms || ''}
                    onChange={(e) => {
                      setTaxCalculationData(prev => ({ ...prev, totalRooms: parseInt(e.target.value) || 0 }));
                      clearFieldError('totalRooms');
                    }}
                    placeholder="Number of rooms"
                    className={validationErrors.totalRooms ? 'border-destructive' : ''}
                    data-error={!!validationErrors.totalRooms}
                  />
                  {validationErrors.totalRooms && (
                    <p className="text-sm text-destructive mt-1">{validationErrors.totalRooms}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="occupiedNights" className="text-sm font-medium">
                    Occupied Room Nights *
                  </Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Total occupied room nights for the tax period
                  </p>
                  <Input
                    id="occupiedNights"
                    type="number"
                    min="0"
                    value={taxCalculationData.occupiedNights || ''}
                    onChange={(e) => {
                      setTaxCalculationData(prev => ({ ...prev, occupiedNights: parseInt(e.target.value) || 0 }));
                      clearFieldError('occupiedNights');
                    }}
                    placeholder="Total occupied nights"
                    className={validationErrors.occupiedNights ? 'border-destructive' : ''}
                    data-error={!!validationErrors.occupiedNights}
                  />
                  {validationErrors.occupiedNights && (
                    <p className="text-sm text-destructive mt-1">{validationErrors.occupiedNights}</p>
                  )}
                </div>
              </div>
            )}

            {selectedTaxType.id === 'amusement' && (
              <div>
                <Label htmlFor="admissionReceipts" className="text-sm font-medium">
                  Admission Receipts ($) *
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Total admission receipts from amusement activities for the tax period
                </p>
                <Input
                  id="admissionReceipts"
                  type="number"
                  min="0"
                  step="0.01"
                  value={taxCalculationData.admissionReceipts || ''}
                  onChange={(e) => {
                    setTaxCalculationData(prev => ({ ...prev, admissionReceipts: parseFloat(e.target.value) || 0 }));
                    clearFieldError('admissionReceipts');
                  }}
                  placeholder="Enter admission receipts amount"
                  className={validationErrors.admissionReceipts ? 'border-destructive' : ''}
                  data-error={!!validationErrors.admissionReceipts}
                />
                {validationErrors.admissionReceipts && (
                  <p className="text-sm text-destructive mt-1">{validationErrors.admissionReceipts}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tax Calculation Result */}
        {taxAmount > 0 && (
          <Card className="animate-fade-in [animation-delay:300ms]">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Tax Summary</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Tax Type:</span>
                    <span className="font-medium">{selectedTaxType.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Tax Rate:</span>
                    <span className="font-medium">{selectedTaxType.rate}%</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Taxable Base:</span>
                    <span className="font-medium">
                      {selectedTaxType.id === 'food-beverage' && formatCurrency(taxCalculationData.grossReceipts || 0)}
                      {selectedTaxType.id === 'hotel-motels' && `${taxCalculationData.occupiedNights || 0} room nights`}
                      {selectedTaxType.id === 'amusement' && formatCurrency(taxCalculationData.admissionReceipts || 0)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total Tax Due:</span>
                    <span className="text-2xl font-bold text-primary">{formatCurrency(taxAmount)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-hidden"
        ref={dialogContentRef}
      >
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold">Pay Business Tax</DialogTitle>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="w-full h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className={currentStep >= 1 ? 'text-primary font-medium' : ''}>
                Tax Selection
              </span>
              <span className={currentStep >= 2 ? 'text-primary font-medium' : ''}>
                Business Info
              </span>
              <span className={currentStep >= 3 ? 'text-primary font-medium' : ''}>
                Calculate & Pay
              </span>
            </div>
          </div>
        </DialogHeader>

        <div 
          className="flex-1 overflow-y-auto pr-2 max-h-[60vh]"
          style={{ scrollbarWidth: 'thin' }}
        >
          <div className="space-y-6">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </div>
        </div>

        <div className="flex justify-between items-center pt-6 border-t bg-background">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="min-w-[100px]"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={handleClose}
              className="min-w-[80px]"
            >
              Cancel
            </Button>
            
            {currentStep === totalSteps ? (
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting || calculateTax() === 0}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  `Pay ${formatCurrency(calculateTax())}`
                )}
              </Button>
            ) : (
              <Button 
                onClick={handleNext}
                className="min-w-[100px]"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};