import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle } from "lucide-react";
import { BuildingPermitsMunicipalityAutocomplete } from "@/components/ui/building-permits-municipality-autocomplete";
import { RestPlacesAutocomplete } from "@/components/ui/rest-places-autocomplete";
import { useToast } from "@/hooks/use-toast";

interface NewBusinessLicenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SelectedMunicipality {
  id: string;
  name: string;
  state: string;
}

interface AddressComponents {
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
}

const BUSINESS_TYPES = [
  "Retail & Trade",
  "Professional Services", 
  "Construction & Contracting",
  "Industrial & Manufacturing",
  "Personal Services",
  "Hospitality & Lodging",
  "Other"
];

export const NewBusinessLicenseDialog: React.FC<NewBusinessLicenseDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedMunicipality, setSelectedMunicipality] = useState<SelectedMunicipality | null>(null);
  const [selectedBusinessType, setSelectedBusinessType] = useState<string>("");
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleClose = () => {
    setCurrentStep(1);
    setSelectedMunicipality(null);
    setSelectedBusinessType("");
    setBusinessName("");
    setBusinessAddress("");
    setOwnerName("");
    setOwnerEmail("");
    setOwnerPhone("");
    setValidationErrors({});
    setIsSubmitting(false);
    onOpenChange(false);
  };

  const validateCurrentStep = () => {
    const errors: Record<string, string> = {};
    
    if (currentStep === 1) {
      if (!selectedMunicipality) {
        errors.municipality = "Municipality is required";
      }
      if (!selectedBusinessType) {
        errors.businessType = "Business type is required";
      }
      if (!businessName.trim()) {
        errors.businessName = "Business name is required";
      }
      if (!businessAddress.trim()) {
        errors.businessAddress = "Business address is required";
      }
      if (!ownerName.trim()) {
        errors.ownerName = "Owner name is required";
      }
      if (!ownerEmail.trim()) {
        errors.ownerEmail = "Owner email is required";
      }
      if (!ownerPhone.trim()) {
        errors.ownerPhone = "Owner phone is required";
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleMunicipalitySelect = (municipality: any) => {
    // Transform the municipality data to match our interface
    const transformedMunicipality: SelectedMunicipality = {
      id: municipality.id || municipality.customer_id,
      name: municipality.business_name || municipality.merchant_name,
      state: municipality.customer_state
    };
    setSelectedMunicipality(transformedMunicipality);
    setValidationErrors(prev => ({ ...prev, municipality: "" }));
  };

  const handleBusinessTypeSelect = (businessType: string) => {
    setSelectedBusinessType(businessType);
    setValidationErrors(prev => ({ ...prev, businessType: "" }));
  };

  const handleAddressSelect = (addressComponents: AddressComponents) => {
    const fullAddress = `${addressComponents.streetAddress}, ${addressComponents.city}, ${addressComponents.state} ${addressComponents.zipCode}`;
    setBusinessAddress(fullAddress);
    setValidationErrors(prev => ({ ...prev, businessAddress: "" }));
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Implement business license application submission
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      toast({
        title: "Application Submitted",
        description: "Your business license application has been submitted successfully.",
      });
      handleClose();
    } catch (error) {
      console.error('Error submitting business license application:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit business license application. Please try again.",
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
          <div className="space-y-6">
            {/* License Information Card */}
            <Card className="animate-fade-in" style={{ animationDelay: '0s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  License Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="municipality">Municipality *</Label>
                    <BuildingPermitsMunicipalityAutocomplete
                      onSelect={handleMunicipalitySelect}
                      className={validationErrors.municipality ? "border-destructive" : ""}
                    />
                    {validationErrors.municipality && (
                      <p className="text-sm text-destructive">{validationErrors.municipality}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessType">Business Type *</Label>
                    <Select value={selectedBusinessType} onValueChange={handleBusinessTypeSelect}>
                      <SelectTrigger className={validationErrors.businessType ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        {BUSINESS_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {validationErrors.businessType && (
                      <p className="text-sm text-destructive">{validationErrors.businessType}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Information Card */}
            <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    value={businessName}
                    onChange={(e) => {
                      setBusinessName(e.target.value);
                      setValidationErrors(prev => ({ ...prev, businessName: "" }));
                    }}
                    className={validationErrors.businessName ? "border-destructive" : ""}
                    placeholder="Enter business name"
                  />
                  {validationErrors.businessName && (
                    <p className="text-sm text-destructive">{validationErrors.businessName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessAddress">Business Address *</Label>
                  <RestPlacesAutocomplete
                    placeholder="Search for business address..."
                    onAddressSelect={handleAddressSelect}
                    value={businessAddress}
                    onChange={(value) => {
                      setBusinessAddress(value);
                      setValidationErrors(prev => ({ ...prev, businessAddress: "" }));
                    }}
                    className={validationErrors.businessAddress ? "border-destructive" : ""}
                  />
                  {validationErrors.businessAddress && (
                    <p className="text-sm text-destructive">{validationErrors.businessAddress}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Owner Information Card */}
            <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Owner Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Owner Name *</Label>
                  <Input
                    id="ownerName"
                    value={ownerName}
                    onChange={(e) => {
                      setOwnerName(e.target.value);
                      setValidationErrors(prev => ({ ...prev, ownerName: "" }));
                    }}
                    className={validationErrors.ownerName ? "border-destructive" : ""}
                    placeholder="Enter owner name"
                  />
                  {validationErrors.ownerName && (
                    <p className="text-sm text-destructive">{validationErrors.ownerName}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ownerEmail">Owner Email *</Label>
                    <Input
                      id="ownerEmail"
                      type="email"
                      value={ownerEmail}
                      onChange={(e) => {
                        setOwnerEmail(e.target.value);
                        setValidationErrors(prev => ({ ...prev, ownerEmail: "" }));
                      }}
                      className={validationErrors.ownerEmail ? "border-destructive" : ""}
                      placeholder="Enter owner email"
                    />
                    {validationErrors.ownerEmail && (
                      <p className="text-sm text-destructive">{validationErrors.ownerEmail}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ownerPhone">Owner Phone *</Label>
                    <Input
                      id="ownerPhone"
                      type="tel"
                      value={ownerPhone}
                      onChange={(e) => {
                        setOwnerPhone(e.target.value);
                        setValidationErrors(prev => ({ ...prev, ownerPhone: "" }));
                      }}
                      className={validationErrors.ownerPhone ? "border-destructive" : ""}
                      placeholder="Enter owner phone"
                    />
                    {validationErrors.ownerPhone && (
                      <p className="text-sm text-destructive">{validationErrors.ownerPhone}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 2:
        return (
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold mb-2">Step 2: Additional Information</h3>
            <p className="text-muted-foreground">This step will be implemented next.</p>
          </div>
        );
      case 3:
        return (
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold mb-2">Step 3: Review & Submit</h3>
            <p className="text-muted-foreground">This step will be implemented next.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Business License Application</DialogTitle>
        </DialogHeader>

        {/* Progress Section */}
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center space-x-8 py-6">
          {[
            { step: 1, label: 'License Info' },
            { step: 2, label: 'Additional Info' },
            { step: 3, label: 'Review' }
          ].map(({ step, label }) => (
            <div key={step} className="flex flex-col items-center space-y-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                step < currentStep 
                  ? 'bg-primary border-primary text-primary-foreground shadow-md' 
                  : step === currentStep 
                    ? 'border-primary bg-primary/10 text-primary ring-4 ring-primary/20' 
                    : 'border-muted-foreground/30 bg-background text-muted-foreground'
              }`}>
                {step < currentStep ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{step}</span>
                )}
              </div>
              <span className={`text-xs transition-colors ${
                step <= currentStep ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px] mb-6">
          {renderStepContent()}
        </div>

        {/* Navigation Footer */}
        <div className="bg-muted/30 rounded-lg p-4 mt-6">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={currentStep === 1 ? handleClose : handlePrevious}
              disabled={isSubmitting}
            >
              {currentStep === 1 ? 'Cancel' : 'Previous'}
            </Button>
            
            <div className="flex space-x-2">
              {currentStep < totalSteps ? (
                <Button onClick={handleNext} disabled={isSubmitting}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting}>
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