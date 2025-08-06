import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BuildingPermitsMunicipalityAutocomplete } from '@/components/ui/building-permits-municipality-autocomplete';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PayTaxDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SelectedMunicipality {
  id: string;
  merchant_name: string;
  business_name: string;
  customer_city: string;
  customer_state: string;
  customer_id: string;
}

const TAX_TYPES = [
  'Food & Beverage',
  'Amusement',
  'Hotel & Motel'
];

export const PayTaxDialog: React.FC<PayTaxDialogProps> = ({
  open,
  onOpenChange
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedMunicipality, setSelectedMunicipality] = useState<SelectedMunicipality | null>(null);
  const [selectedTaxType, setSelectedTaxType] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const dialogContentRef = useRef<HTMLDivElement>(null);

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const validateStep1Fields = () => {
    const errors: Record<string, string> = {};

    if (!selectedMunicipality) errors.municipality = 'Municipality is required';
    if (!selectedTaxType) errors.taxType = 'Tax type is required';

    return errors;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      // Validate step 1 mandatory fields before proceeding
      const errors = validateStep1Fields();
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        // Scroll to first error field
        const firstErrorField = document.querySelector(`[data-error="true"]`);
        if (firstErrorField) {
          firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      } else {
        setValidationErrors({});
      }
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      // Scroll to top of dialog content
      if (dialogContentRef.current) {
        dialogContentRef.current.scrollTop = 0;
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // Scroll to top of dialog content
      if (dialogContentRef.current) {
        dialogContentRef.current.scrollTop = 0;
      }
    }
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

  const handleClose = () => {
    setCurrentStep(1);
    setSelectedMunicipality(null);
    setSelectedTaxType('');
    setValidationErrors({});
    onOpenChange(false);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="space-y-6">
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Tax Information</CardTitle>
            <p className="text-sm text-muted-foreground">
              Select the municipality and tax type for your tax payment
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Municipality Selection */}
            <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <Label htmlFor="municipality" className="text-sm font-medium">
                Municipality *
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                Select the municipality where you need to pay taxes
              </p>
              <BuildingPermitsMunicipalityAutocomplete
                value={selectedMunicipality?.merchant_name || ''}
                onSelect={(municipality) => {
                  setSelectedMunicipality(municipality);
                  clearFieldError('municipality');
                }}
                placeholder="Search for a municipality..."
                className={validationErrors.municipality ? 'border-destructive' : ''}
              />
              {validationErrors.municipality && (
                <p className="text-sm text-destructive">{validationErrors.municipality}</p>
              )}
            </div>

            <Separator className="opacity-50" />

            {/* Tax Type Selection */}
            <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <Label htmlFor="taxType" className="text-sm font-medium">
                Tax Type *
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                Choose the type of tax you need to pay
              </p>
              <Select
                value={selectedTaxType}
                onValueChange={(value) => {
                  setSelectedTaxType(value);
                  clearFieldError('taxType');
                }}
              >
                <SelectTrigger 
                  data-error={!!validationErrors.taxType}
                  className={validationErrors.taxType ? 'border-destructive' : ''}
                >
                  <SelectValue placeholder="Select tax type..." />
                </SelectTrigger>
                <SelectContent>
                  {TAX_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.taxType && (
                <p className="text-sm text-destructive">{validationErrors.taxType}</p>
              )}
            </div>

            {/* Selection Summary */}
            {(selectedMunicipality || selectedTaxType) && (
              <div className="mt-6 p-4 bg-muted/50 rounded-lg animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <h4 className="font-medium text-sm mb-3">Selection Summary</h4>
                <div className="space-y-2 text-sm">
                  {selectedMunicipality && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Municipality:</span>
                      <span className="font-medium">{selectedMunicipality.merchant_name}</span>
                    </div>
                  )}
                  {selectedTaxType && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax Type:</span>
                      <span className="font-medium">{selectedTaxType}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return (
          <div className="space-y-6">
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Step 2 Content</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Coming soon...
                </p>
              </CardHeader>
              <CardContent>
                <p>Step 2 will be implemented next.</p>
              </CardContent>
            </Card>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Step 3 Content</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Coming soon...
                </p>
              </CardHeader>
              <CardContent>
                <p>Step 3 will be implemented next.</p>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        ref={dialogContentRef}
      >
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-bold">Pay Tax</DialogTitle>
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
              <span className="text-sm text-muted-foreground">
                {currentStep === 1 && "Tax Info"}
                {currentStep === 2 && "Business Information"}
                {currentStep === 3 && "Tax Calculation"}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1">
          <div className="py-6">
            {renderStepContent()}
          </div>
        </div>

        <div className="flex-shrink-0 flex justify-between items-center pt-6 border-t">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? handleClose : handlePrevious}
            className="flex items-center"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            {currentStep === 1 ? 'Cancel' : 'Previous'}
          </Button>

          <div className="flex space-x-2">
            {currentStep < totalSteps ? (
              <Button onClick={handleNext} className="flex items-center">
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleClose} className="flex items-center">
                Submit Payment
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};