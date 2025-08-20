import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RestPlacesAutocomplete } from '@/components/ui/rest-places-autocomplete';
import { useToast } from '@/hooks/use-toast';

interface NewBusinessLicenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface BusinessInformation {
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  licenseType: string;
  businessCategory: string;
  businessDescription: string;
  operatingHours: string;
  numberOfEmployees: string;
}

interface OwnerInformation {
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  ownerAddress: string;
  federalEIN: string;
  stateRegistrationNumber: string;
}

const NewBusinessLicenseDialog: React.FC<NewBusinessLicenseDialogProps> = ({
  open,
  onOpenChange
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [businessInfo, setBusinessInfo] = useState<BusinessInformation>({
    businessName: '',
    businessAddress: '',
    businessPhone: '',
    businessEmail: '',
    licenseType: '',
    businessCategory: '',
    businessDescription: '',
    operatingHours: '',
    numberOfEmployees: ''
  });
  const [ownerInfo, setOwnerInfo] = useState<OwnerInformation>({
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    ownerAddress: '',
    federalEIN: '',
    stateRegistrationNumber: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setBusinessInfo({
      businessName: '',
      businessAddress: '',
      businessPhone: '',
      businessEmail: '',
      licenseType: '',
      businessCategory: '',
      businessDescription: '',
      operatingHours: '',
      numberOfEmployees: ''
    });
    setOwnerInfo({
      ownerName: '',
      ownerPhone: '',
      ownerEmail: '',
      ownerAddress: '',
      federalEIN: '',
      stateRegistrationNumber: ''
    });
    setIsSubmitting(false);
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "License application submitted!",
        description: "Your business license application has been submitted for review.",
      });

      handleClose();
    } catch (error: any) {
      toast({
        title: "Submission failed",
        description: "An error occurred while submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Business Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                value={businessInfo.businessName}
                onChange={(e) => setBusinessInfo(prev => ({ ...prev, businessName: e.target.value }))}
                placeholder="Enter business name"
              />
            </div>
            <div>
              <Label htmlFor="businessPhone">Business Phone *</Label>
              <Input
                id="businessPhone"
                value={businessInfo.businessPhone}
                onChange={(e) => setBusinessInfo(prev => ({ ...prev, businessPhone: e.target.value }))}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="businessEmail">Business Email *</Label>
            <Input
              id="businessEmail"
              type="email"
              value={businessInfo.businessEmail}
              onChange={(e) => setBusinessInfo(prev => ({ ...prev, businessEmail: e.target.value }))}
              placeholder="business@example.com"
            />
          </div>

          <div>
            <Label htmlFor="businessAddress">Business Address *</Label>
            <RestPlacesAutocomplete
              value={businessInfo.businessAddress}
              onChange={(value) => setBusinessInfo(prev => ({ ...prev, businessAddress: value }))}
              onAddressSelect={(addressComponents) => {
                const fullAddress = `${addressComponents.streetAddress}, ${addressComponents.city}, ${addressComponents.state} ${addressComponents.zipCode}`;
                setBusinessInfo(prev => ({ ...prev, businessAddress: fullAddress }));
              }}
              placeholder="Enter business address"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="licenseType">License Type *</Label>
              <Select
                value={businessInfo.licenseType}
                onValueChange={(value) => setBusinessInfo(prev => ({ ...prev, licenseType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select license type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="business_license">General Business License</SelectItem>
                  <SelectItem value="food_service">Food Service License</SelectItem>
                  <SelectItem value="liquor_license">Liquor License</SelectItem>
                  <SelectItem value="retail_license">Retail License</SelectItem>
                  <SelectItem value="professional_service">Professional Service License</SelectItem>
                  <SelectItem value="home_occupation">Home Occupation Permit</SelectItem>
                  <SelectItem value="special_event">Special Event Permit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="businessCategory">Business Category *</Label>
              <Select
                value={businessInfo.businessCategory}
                onValueChange={(value) => setBusinessInfo(prev => ({ ...prev, businessCategory: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
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
            </div>
          </div>

          <div>
            <Label htmlFor="businessDescription">Business Description</Label>
            <Textarea
              id="businessDescription"
              value={businessInfo.businessDescription}
              onChange={(e) => setBusinessInfo(prev => ({ ...prev, businessDescription: e.target.value }))}
              placeholder="Describe your business activities"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="operatingHours">Operating Hours</Label>
              <Input
                id="operatingHours"
                value={businessInfo.operatingHours}
                onChange={(e) => setBusinessInfo(prev => ({ ...prev, operatingHours: e.target.value }))}
                placeholder="e.g., Mon-Fri 9AM-5PM"
              />
            </div>
            <div>
              <Label htmlFor="numberOfEmployees">Number of Employees</Label>
              <Select
                value={businessInfo.numberOfEmployees}
                onValueChange={(value) => setBusinessInfo(prev => ({ ...prev, numberOfEmployees: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 employee (just me)</SelectItem>
                  <SelectItem value="2-5">2-5 employees</SelectItem>
                  <SelectItem value="6-10">6-10 employees</SelectItem>
                  <SelectItem value="11-25">11-25 employees</SelectItem>
                  <SelectItem value="26-50">26-50 employees</SelectItem>
                  <SelectItem value="50+">50+ employees</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Owner Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="ownerName">Owner/Authorized Representative Name *</Label>
            <Input
              id="ownerName"
              value={ownerInfo.ownerName}
              onChange={(e) => setOwnerInfo(prev => ({ ...prev, ownerName: e.target.value }))}
              placeholder="Enter full name"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ownerPhone">Owner Phone *</Label>
              <Input
                id="ownerPhone"
                value={ownerInfo.ownerPhone}
                onChange={(e) => setOwnerInfo(prev => ({ ...prev, ownerPhone: e.target.value }))}
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <Label htmlFor="ownerEmail">Owner Email *</Label>
              <Input
                id="ownerEmail"
                type="email"
                value={ownerInfo.ownerEmail}
                onChange={(e) => setOwnerInfo(prev => ({ ...prev, ownerEmail: e.target.value }))}
                placeholder="owner@example.com"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="ownerAddress">Owner Address *</Label>
            <RestPlacesAutocomplete
              value={ownerInfo.ownerAddress}
              onChange={(value) => setOwnerInfo(prev => ({ ...prev, ownerAddress: value }))}
              onAddressSelect={(addressComponents) => {
                const fullAddress = `${addressComponents.streetAddress}, ${addressComponents.city}, ${addressComponents.state} ${addressComponents.zipCode}`;
                setOwnerInfo(prev => ({ ...prev, ownerAddress: fullAddress }));
              }}
              placeholder="Enter owner address"
            />
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="federalEIN">Federal EIN (if applicable)</Label>
              <Input
                id="federalEIN"
                value={ownerInfo.federalEIN}
                onChange={(e) => setOwnerInfo(prev => ({ ...prev, federalEIN: e.target.value }))}
                placeholder="XX-XXXXXXX"
              />
            </div>
            <div>
              <Label htmlFor="stateRegistrationNumber">State Registration Number</Label>
              <Input
                id="stateRegistrationNumber"
                value={ownerInfo.stateRegistrationNumber}
                onChange={(e) => setOwnerInfo(prev => ({ ...prev, stateRegistrationNumber: e.target.value }))}
                placeholder="Enter state registration number"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Review & Submit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium mb-2">Business Information</h4>
            <div className="text-sm space-y-1 text-muted-foreground">
              <p><strong>Business Name:</strong> {businessInfo.businessName}</p>
              <p><strong>Address:</strong> {businessInfo.businessAddress}</p>
              <p><strong>License Type:</strong> {businessInfo.licenseType}</p>
              <p><strong>Category:</strong> {businessInfo.businessCategory}</p>
              <p><strong>Phone:</strong> {businessInfo.businessPhone}</p>
              <p><strong>Email:</strong> {businessInfo.businessEmail}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-2">Owner Information</h4>
            <div className="text-sm space-y-1 text-muted-foreground">
              <p><strong>Owner Name:</strong> {ownerInfo.ownerName}</p>
              <p><strong>Phone:</strong> {ownerInfo.ownerPhone}</p>
              <p><strong>Email:</strong> {ownerInfo.ownerEmail}</p>
              <p><strong>Address:</strong> {ownerInfo.ownerAddress}</p>
              {ownerInfo.federalEIN && <p><strong>Federal EIN:</strong> {ownerInfo.federalEIN}</p>}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Important Notes</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Your application will be reviewed within 5-10 business days</li>
              <li>• You will receive email updates on your application status</li>
              <li>• Additional documentation may be requested during review</li>
              <li>• License fees will be calculated based on your business type</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle>New Business License Application</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Step {currentStep} of {totalSteps}</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-1">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </div>

          <div className="flex justify-between items-center pt-4 border-t flex-shrink-0">
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
              {currentStep < totalSteps ? (
                <Button onClick={handleNext} className="flex items-center gap-2">
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Submit Application
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewBusinessLicenseDialog;