import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Building, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useBusinessLicense } from '@/hooks/useBusinessLicense';
import { useCustomerById } from '@/hooks/useCustomerById';
import { format } from 'date-fns';
import { formatEINForDisplay } from '@/lib/formatters';

const BusinessLicenseCertificate = () => {
  const { licenseId } = useParams<{ licenseId: string }>();
  const navigate = useNavigate();
  const { data: license, isLoading, error } = useBusinessLicense(licenseId!);
  const { customer: municipality, isLoading: municipalityLoading } = useCustomerById(license?.customer_id);

  const handleBack = () => {
    navigate(`/business-license/${licenseId}`);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading || municipalityLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 print:hidden">
            <Button variant="ghost" onClick={handleBack} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to License
            </Button>
          </div>
          <Card>
            <CardContent className="p-8">
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-1/2 mx-auto" />
                <Skeleton className="h-32 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !license) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 print:hidden">
            <Button variant="ghost" onClick={handleBack} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to License
            </Button>
          </div>
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">License not found or not accessible.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Only show certificate for issued licenses that are paid
  if (license.application_status !== 'issued' || license.payment_status !== 'paid') {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 print:hidden">
            <Button variant="ghost" onClick={handleBack} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to License
            </Button>
          </div>
            <Card>
              <CardContent className="p-8 text-center">
                <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Certificate Not Available</h3>
              <p className="text-muted-foreground">
                The business license certificate is only available for issued and paid licenses.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Current status: {license.application_status} | Payment: {license.payment_status}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation and Print Button - Hidden when printing */}
      <div className="print:hidden p-6 bg-background border-b">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to License
          </Button>
          <Button onClick={handlePrint} className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Print Certificate
          </Button>
        </div>
      </div>

      {/* Certificate Content - Optimized for Print */}
      <div className="p-8 print:p-0">
        <div className="max-w-4xl mx-auto print:max-w-none print:mx-0">
          {/* Print-specific styles */}
          <style dangerouslySetInnerHTML={{
            __html: `
              @media print {
                @page {
                  size: landscape;
                  margin: 0.75in;
                }
                
                * {
                  -webkit-print-color-adjust: exact !important;
                  color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                
                body {
                  background: white !important;
                  font-size: 12pt !important;
                  line-height: 1.4 !important;
                }
                
                .certificate-container {
                  width: 100% !important;
                  height: auto !important;
                  page-break-inside: avoid !important;
                  background: white !important;
                }
                
                .certificate-border {
                  border: 3pt solid #cbd5e1 !important;
                  padding: 24pt !important;
                }
                
                .certificate-header h1 {
                  font-size: 24pt !important;
                  font-weight: bold !important;
                  color: #2563eb !important;
                  margin-bottom: 8pt !important;
                }
                
                .certificate-subtitle {
                  font-size: 14pt !important;
                  color: #64748b !important;
                }
                
                .certificate-content {
                  display: grid !important;
                  grid-template-columns: 1fr 1fr !important;
                  gap: 24pt !important;
                  margin: 24pt 0 !important;
                }
                
                .certificate-section {
                  background: #f8fafc !important;
                  border: 1pt solid #e2e8f0 !important;
                  padding: 12pt !important;
                  border-radius: 4pt !important;
                }
                
                .section-header {
                  font-size: 14pt !important;
                  font-weight: bold !important;
                  margin-bottom: 12pt !important;
                }
                
                .field-label {
                  font-weight: 600 !important;
                  color: #64748b !important;
                  font-size: 10pt !important;
                }
                
                .field-value {
                  font-weight: bold !important;
                  color: #0f172a !important;
                  font-size: 11pt !important;
                  margin-bottom: 8pt !important;
                }
                
                .license-number {
                  font-size: 16pt !important;
                  color: #2563eb !important;
                  font-weight: bold !important;
                }
                
                .business-name {
                  font-size: 14pt !important;
                  font-weight: bold !important;
                }
                
                .footer-section {
                  border-top: 1pt solid #e2e8f0 !important;
                  padding-top: 16pt !important;
                  margin-top: 24pt !important;
                  display: flex !important;
                  justify-content: space-between !important;
                  align-items: flex-end !important;
                }
                
                .decorative-corner {
                  border: 2pt solid #cbd5e1 !important;
                }
              }
            `
          }} />
          
          {/* Certificate Container */}
          <div className="certificate-container bg-white">
            <div className="certificate-border border-4 border-border p-8 relative">
              {/* Decorative Corner Elements */}
              <div className="decorative-corner absolute top-2 left-2 w-8 h-8 border-l-2 border-t-2 border-border"></div>
              <div className="decorative-corner absolute top-2 right-2 w-8 h-8 border-r-2 border-t-2 border-border"></div>
              <div className="decorative-corner absolute bottom-2 left-2 w-8 h-8 border-l-2 border-b-2 border-border"></div>
              <div className="decorative-corner absolute bottom-2 right-2 w-8 h-8 border-r-2 border-b-2 border-border"></div>

              {/* Header */}
              <div className="certificate-header text-center mb-8">
                <h1 className="text-3xl font-bold text-primary mb-2">
                  BUSINESS LICENSE CERTIFICATE
                </h1>
                <div className="certificate-subtitle text-lg text-muted-foreground">
                  {municipality?.legal_entity_name || 'Municipality'}
                </div>
              </div>

              {/* Main Content */}
              <div className="certificate-content grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* License Information */}
                  <div className="certificate-section bg-muted/10 p-4 rounded border border-border">
                    <h3 className="section-header font-semibold text-lg mb-3 flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      License Details
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <div className="field-label">License Number:</div>
                        <div className="license-number field-value text-lg font-bold text-primary">
                          #{license.license_number || license.id.slice(0, 8).toUpperCase()}
                        </div>
                      </div>
                      <div>
                        <div className="field-label">License Type:</div>
                        <div className="field-value">{license.business_type}</div>
                      </div>
                      <div>
                        <div className="field-label">Issue Date:</div>
                        <div className="field-value">
                          {license.issued_at ? format(new Date(license.issued_at), 'MMMM d, yyyy') : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Business Information */}
                  <div className="certificate-section bg-muted/10 p-4 rounded border border-border">
                    <h3 className="section-header font-semibold text-lg mb-3 flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Business Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <div className="field-label">Business Name:</div>
                        <div className="business-name field-value font-bold">{license.business_legal_name}</div>
                      </div>
                      {license.doing_business_as && (
                        <div>
                          <div className="field-label">DBA:</div>
                          <div className="field-value">{license.doing_business_as}</div>
                        </div>
                      )}
                      <div>
                        <div className="field-label">Business Address:</div>
                        <div className="field-value">
                          {license.business_street_address}
                          {license.business_apt_number && `, ${license.business_apt_number}`}
                          <br />
                          {license.business_city}, {license.business_state} {license.business_zip_code}
                        </div>
                      </div>
                      {license.federal_ein && (
                        <div>
                          <div className="field-label">Federal EIN:</div>
                          <div className="field-value">{formatEINForDisplay(license.federal_ein)}</div>
                        </div>
                      )}
                      <div>
                        <div className="field-label">Owner:</div>
                        <div className="field-value">
                          {license.owner_first_name} {license.owner_last_name}
                          {license.owner_title && `, ${license.owner_title}`}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Legal Notice */}
                  <div className="certificate-section bg-primary/5 p-4 rounded border border-primary/20">
                    <h3 className="section-header font-semibold text-lg mb-3 text-primary">Important Notice</h3>
                    <div className="text-sm space-y-3 leading-relaxed">
                      <p>
                        This certificate must be displayed in a conspicuous location on the licensed 
                        premises where it can be easily seen by the public.
                      </p>
                      <p>
                        This license is valid until revoked, suspended, or expired according to 
                        municipal regulations.
                      </p>
                      <p className="font-medium">
                        Failure to display this certificate may result in penalties.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="footer-section border-t pt-6 mt-8">
                <div className="flex justify-between items-end">
                  <div>
                    <div className="field-label">Issued by:</div>
                    <div className="field-value font-semibold">{municipality?.legal_entity_name || 'Municipality'}</div>
                    <div className="text-sm text-muted-foreground">Business License Department</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      Certificate issued on {format(new Date(), 'MMMM d, yyyy')}
                    </div>
                    {municipality?.entity_website && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Verify authenticity at: {municipality.entity_website}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessLicenseCertificate;