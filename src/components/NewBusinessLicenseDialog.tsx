import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BuildingPermitsMunicipalityAutocomplete } from '@/components/ui/building-permits-municipality-autocomplete';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface NewBusinessLicenseDialogProps {
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

export const NewBusinessLicenseDialog: React.FC<NewBusinessLicenseDialogProps> = ({
  open,
  onOpenChange
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedMunicipality, setSelectedMunicipality] = useState<SelectedMunicipality | null>(null);
  const [selectedBusinessType, setSelectedBusinessType] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const dialogContentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const validateStep1Fields = () => {
    const errors: Record<string, string> = {};

    if (!selectedMunicipality) errors.municipality = 'Municipality is required';
    if (!selectedBusinessType) errors.businessType = 'Business type is required';

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
    setSelectedBusinessType('');
    setValidationErrors({});
    setIsSubmitting(false);
    onOpenChange(false);
  };

  const handleMunicipalitySelect = (municipality: SelectedMunicipality) => {
    setSelectedMunicipality(municipality);
    clearFieldError('municipality');
  };

  const handleBusinessTypeSelect = (businessType: string) => {
    setSelectedBusinessType(businessType);
    clearFieldError('businessType');
  };

  const handleSubmit = async () => {
    // Validate required fields
    const errors = validateStep1Fields();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast({
        title: "Please complete all required fields",
        description: "Check the highlighted fields below and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Implement actual submission logic
      toast({
        title: "Application submitted successfully!",
        description: "Your business license application has been submitted for review.",
      });

      handleClose();
    } catch (error: any) {
      console.error('Submission error:', error);
      toast({
        title: "Submission failed",
        description: error.message || "An error occurred while submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <Card className="animate-fade-in">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  License Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="municipality" className="text-sm font-medium text-foreground">
                      Municipality *
                    </Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Select the municipality where your license will be processed
                    </p>
                    <BuildingPermitsMunicipalityAutocomplete
                      placeholder="Search for your municipality..."
                      onSelect={(municipality) => {
                        handleMunicipalitySelect(municipality);
                      }}
                      className={`mt-1 ${validationErrors.municipality ? 'ring-2 ring-destructive border-destructive' : ''}`}
                      data-error={!!validationErrors.municipality}
                    />
                    {validationErrors.municipality && (
                      <p className="text-sm text-destructive mt-1">{validationErrors.municipality}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="business-type" className="text-sm font-medium text-foreground">
                      Business Type *
                    </Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Select the type of business you operate
                    </p>
                    <Select onValueChange={(value) => {
                      handleBusinessTypeSelect(value);
                    }}>
                      <SelectTrigger className={`mt-1 ${validationErrors.businessType ? 'ring-2 ring-destructive border-destructive' : ''}`} data-error={!!validationErrors.businessType}>
                        <SelectValue placeholder="Select a business type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="retail_trade">Retail & Trade</SelectItem>
                        <SelectItem value="professional_services">Professional Services</SelectItem>
                        <SelectItem value="construction_contracting">Construction & Contracting</SelectItem>
                        <SelectItem value="industrial_manufacturing">Industrial & Manufacturing</SelectItem>
                        <SelectItem value="personal_services">Personal Services</SelectItem>
                        <SelectItem value="hospitality_lodging">Hospitality & Lodging</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {validationErrors.businessType && (
                      <p className="text-sm text-destructive mt-1">{validationErrors.businessType}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <Card className="animate-fade-in">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Step 2 - Coming Soon
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Additional form fields will be added here.</p>
              </CardContent>
            </Card>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <Card className="animate-fade-in">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Step 3 - Coming Soon
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Review and submission will be added here.</p>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  const stepLabels = ['Basic Info', 'Business Details', 'Review & Submit'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0"
        ref={dialogContentRef}
      >
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-semibold">New Business License Application</DialogTitle>
        </DialogHeader>

        {/* Progress Section */}
        <div className="px-6 py-4 space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Step {currentStep} of {totalSteps}</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          {/* Step Indicators */}
          <div className="flex justify-between">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                  i + 1 < currentStep 
                    ? 'bg-primary text-primary-foreground' 
                    : i + 1 === currentStep 
                      ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' 
                      : 'bg-muted text-muted-foreground'
                }`}>
                  {i + 1 < currentStep ? '✓' : i + 1}
                </div>
                <span className={`text-xs mt-2 text-center max-w-20 ${
                  i + 1 === currentStep ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}>
                  {stepLabels[i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t" />

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="min-h-[400px]">
            {renderStepContent()}
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="bg-muted/20 -mx-0 -mb-0 px-6 py-4 rounded-b-lg">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              
              {currentStep < totalSteps ? (
                <Button onClick={handleNext} className="flex items-center gap-2">
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="flex items-center gap-2" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};