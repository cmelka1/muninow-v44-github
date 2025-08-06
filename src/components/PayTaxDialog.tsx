import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MunicipalityAutocomplete } from '@/components/ui/municipality-autocomplete';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PayTaxDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SelectedMunicipality {
  customer_id: string;
  legal_entity_name: string;
  doing_business_as: string;
  business_city: string;
  business_state: string;
}

interface TaxFormData {
  municipality: SelectedMunicipality | null;
  taxType: string;
  businessName: string;
  businessAddress: string;
  contactPerson: string;
  phoneNumber: string;
  email: string;
}

export const PayTaxDialog: React.FC<PayTaxDialogProps> = ({
  open,
  onOpenChange
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<TaxFormData>({
    municipality: null,
    taxType: '',
    businessName: '',
    businessAddress: '',
    contactPerson: '',
    phoneNumber: '',
    email: ''
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const handleClose = () => {
    console.log('PayTaxDialog: Closing dialog');
    setCurrentStep(1);
    setFormData({
      municipality: null,
      taxType: '',
      businessName: '',
      businessAddress: '',
      contactPerson: '',
      phoneNumber: '',
      email: ''
    });
    setValidationErrors({});
    onOpenChange(false);
  };

  const validateStep = (step: number) => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.municipality) errors.municipality = 'Municipality is required';
      if (!formData.taxType) errors.taxType = 'Tax type is required';
    }

    if (step === 2) {
      if (!formData.businessName) errors.businessName = 'Business name is required';
      if (!formData.contactPerson) errors.contactPerson = 'Contact person is required';
      if (!formData.email) errors.email = 'Email is required';
    }

    return errors;
  };

  const handleNext = () => {
    const errors = validateStep(currentStep);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleMunicipalitySelect = (municipality: SelectedMunicipality) => {
    setFormData(prev => ({ ...prev, municipality }));
    if (validationErrors.municipality) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.municipality;
        return newErrors;
      });
    }
  };

  const handleTaxTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, taxType: value }));
    if (validationErrors.taxType) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.taxType;
        return newErrors;
      });
    }
  };

  const handleInputChange = (field: keyof TaxFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Tax Information';
      case 2: return 'Business Information';
      case 3: return 'Payment & Review';
      default: return 'Tax Information';
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Tax Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="municipality">
                  Municipality <span className="text-destructive">*</span>
                </Label>
                <MunicipalityAutocomplete
                  value={formData.municipality?.legal_entity_name || ''}
                  onSelect={handleMunicipalitySelect}
                  placeholder="Search for your municipality..."
                  className={validationErrors.municipality ? 'border-destructive' : ''}
                />
                {validationErrors.municipality && (
                  <p className="text-sm text-destructive">{validationErrors.municipality}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxType">
                  Tax Type <span className="text-destructive">*</span>
                </Label>
                <Select value={formData.taxType} onValueChange={handleTaxTypeChange}>
                  <SelectTrigger className={validationErrors.taxType ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select tax type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="food-beverage">Food & Beverage</SelectItem>
                    <SelectItem value="amusement">Amusement</SelectItem>
                    <SelectItem value="hotel-motel">Hotel & Motel</SelectItem>
                    <SelectItem value="property">Property Tax</SelectItem>
                    <SelectItem value="business">Business Tax</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.taxType && (
                  <p className="text-sm text-destructive">{validationErrors.taxType}</p>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">
                  Business Name <span className="text-destructive">*</span>
                </Label>
                <input
                  type="text"
                  id="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange('businessName')}
                  className={`w-full px-3 py-2 border rounded-md ${
                    validationErrors.businessName ? 'border-destructive' : 'border-input'
                  }`}
                  placeholder="Enter business name"
                />
                {validationErrors.businessName && (
                  <p className="text-sm text-destructive">{validationErrors.businessName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPerson">
                  Contact Person <span className="text-destructive">*</span>
                </Label>
                <input
                  type="text"
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange('contactPerson')}
                  className={`w-full px-3 py-2 border rounded-md ${
                    validationErrors.contactPerson ? 'border-destructive' : 'border-input'
                  }`}
                  placeholder="Enter contact person name"
                />
                {validationErrors.contactPerson && (
                  <p className="text-sm text-destructive">{validationErrors.contactPerson}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  className={`w-full px-3 py-2 border rounded-md ${
                    validationErrors.email ? 'border-destructive' : 'border-input'
                  }`}
                  placeholder="Enter email address"
                />
                {validationErrors.email && (
                  <p className="text-sm text-destructive">{validationErrors.email}</p>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Payment & Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Review Your Information</h3>
                <div className="bg-muted p-4 rounded-md space-y-2">
                  <p><strong>Municipality:</strong> {formData.municipality?.legal_entity_name}</p>
                  <p><strong>Tax Type:</strong> {formData.taxType}</p>
                  <p><strong>Business Name:</strong> {formData.businessName}</p>
                  <p><strong>Contact Person:</strong> {formData.contactPerson}</p>
                  <p><strong>Email:</strong> {formData.email}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Payment processing will be implemented in the next phase.
              </p>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>Pay Tax - {getStepTitle()}</DialogTitle>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2 shrink-0">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto px-1">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t shrink-0">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>

          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            {currentStep < totalSteps ? (
              <Button onClick={handleNext} className="flex items-center space-x-2">
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleClose}>
                Submit Payment
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};