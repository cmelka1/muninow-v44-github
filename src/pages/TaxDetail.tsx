import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign, User, Calendar, FileText, CreditCard, Building, Plus, Loader2, Download } from 'lucide-react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { MunicipalLayout } from '@/components/layouts/MunicipalLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { InlinePaymentFlow } from '@/components/payment/InlinePaymentFlow';
import { AddPaymentMethodDialog } from '@/components/profile/AddPaymentMethodDialog';
import { useTaxSubmissionDetail } from '@/hooks/useTaxSubmissionDetail';
import { useTaxSubmissionDocuments } from '@/hooks/useTaxSubmissionDocuments';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { SafeHtmlRenderer } from '@/components/ui/safe-html-renderer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const TaxDetail = () => {
  const { taxId } = useParams<{ taxId: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [addDocumentOpen, setAddDocumentOpen] = useState(false);
  const [downloadingDocument, setDownloadingDocument] = useState<string | null>(null);
  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false);
  
  const isMunicipalUser = profile?.account_type === 'municipaladmin';
  
  const { data: taxSubmission, isLoading, error, refetch: refetchTax } = useTaxSubmissionDetail(taxId!);
  const { getDocuments, getDocumentUrl } = useTaxSubmissionDocuments();
  
  // For now, we'll use empty array for documents until we have proper query for confirmed documents
  const documents: any[] = [];
  const documentsLoading = false;
  const refetchDocuments = () => {};

  // Payment callback functions
  const handlePaymentSuccess = () => {
    toast({
      title: "Payment Successful",
      description: "Your tax payment has been processed successfully.",
    });
    refetchTax();
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    toast({
      variant: "destructive",
      title: "Payment Failed",
      description: "Your payment could not be processed. Please try again.",
    });
  };

  const handleAddPaymentMethod = () => {
    setIsAddPaymentDialogOpen(true);
  };

  const handleDocumentDownload = async (document: any) => {
    setDownloadingDocument(document.id);
    try {
      console.log('Attempting to download document:', document.storage_path);
      
      const { data, error } = await supabase.storage
        .from('tax-documents')
        .download(document.storage_path);
      
      if (error) {
        console.error('Error downloading document:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to download document. Please try again or contact support.",
        });
        return;
      }
      
      if (data) {
        const url = URL.createObjectURL(data);
        const a = globalThis.document.createElement('a');
        a.href = url;
        a.download = document.file_name;
        globalThis.document.body.appendChild(a);
        a.click();
        globalThis.document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: "Download started",
          description: `${document.file_name} is being downloaded.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No data received for download.",
        });
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download document. Please try again later.",
      });
    } finally {
      setDownloadingDocument(null);
    }
  };

  const formatTaxType = (taxType: string) => {
    const typeMap: Record<string, string> = {
      'food_beverage': 'Food & Beverage',
      'hotel_motel': 'Hotel & Motel',
      'amusement': 'Amusement'
    };
    return typeMap[taxType] || taxType;
  };

  const formatPeriod = (startDate: string, endDate: string) => {
    const start = new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const end = new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${start} - ${end}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        {isMunicipalUser ? (
          <MunicipalLayout>
            <div className="p-6">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="h-48 bg-gray-200 rounded"></div>
                    <div className="h-48 bg-gray-200 rounded"></div>
                  </div>
                  <div className="space-y-6">
                    <div className="h-32 bg-gray-200 rounded"></div>
                    <div className="h-48 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </MunicipalLayout>
        ) : (
          <div className="p-6">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="h-48 bg-gray-200 rounded"></div>
                  <div className="h-48 bg-gray-200 rounded"></div>
                </div>
                <div className="space-y-6">
                  <div className="h-32 bg-gray-200 rounded"></div>
                  <div className="h-48 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (error || !taxSubmission) {
    return (
      <div className="min-h-screen bg-gray-100">
        {isMunicipalUser ? (
          <MunicipalLayout>
            <div className="p-6">
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-destructive">Error loading tax submission details. Please try again.</p>
                </CardContent>
              </Card>
            </div>
          </MunicipalLayout>
        ) : (
          <div className="p-6">
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-destructive">Error loading tax submission details. Please try again.</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  const PageContent = () => (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/taxes')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tax Submission</h1>
            <p className="text-gray-600">{formatTaxType(taxSubmission.tax_type)} - {formatPeriod(taxSubmission.tax_period_start, taxSubmission.tax_period_end)}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge 
              variant="outline" 
              className={
                taxSubmission.payment_status === 'paid' 
                  ? 'bg-green-100 text-green-800 hover:bg-green-100 border-green-200' 
                  : 'bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200'
              }
            >
              {taxSubmission.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tax Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Tax Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Tax Type</Label>
                  <p className="text-base">{formatTaxType(taxSubmission.tax_type)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Tax Period</Label>
                  <p className="text-base">{formatPeriod(taxSubmission.tax_period_start, taxSubmission.tax_period_end)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Tax Year</Label>
                  <p className="text-base">{taxSubmission.tax_year}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Submitted</Label>
                  <p className="text-base">{formatDate(taxSubmission.submission_date)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Base Amount</Label>
                  <p className="text-base">{formatCurrency(taxSubmission.amount_cents / 100)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Total Amount</Label>
                  <p className="text-base">{formatCurrency(taxSubmission.total_amount_cents / 100)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Payer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                  <p className="text-base">{taxSubmission.first_name} {taxSubmission.last_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p className="text-base">{taxSubmission.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                  <p className="text-base">{taxSubmission.payer_phone || 'N/A'}</p>
                </div>
                {taxSubmission.payer_business_name && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Business Name</Label>
                    <p className="text-base">{taxSubmission.payer_business_name}</p>
                  </div>
                )}
                {taxSubmission.payer_ein && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">EIN</Label>
                    <p className="text-base">{taxSubmission.payer_ein}</p>
                  </div>
                )}
              </div>
              {(taxSubmission.payer_street_address || taxSubmission.payer_city) && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                  <p className="text-base">
                    {taxSubmission.payer_street_address}
                    {taxSubmission.payer_city && (
                      <>
                        <br />{taxSubmission.payer_city}, {taxSubmission.payer_state} {taxSubmission.payer_zip_code}
                      </>
                    )}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Calculation Details */}
          {taxSubmission.calculation_notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Calculation Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SafeHtmlRenderer content={taxSubmission.calculation_notes} className="mt-1" fallback="No calculation details provided" />
              </CardContent>
            </Card>
          )}

          {/* Documents Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documents ({documents?.length || 0})
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAddDocumentOpen(true)}
                  className="flex items-center gap-2"
                  disabled
                >
                  <Plus className="h-4 w-4" />
                  Add Document
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {documentsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : documents && documents.length > 0 ? (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3 flex-1">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">{doc.file_name}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span>{(doc.file_size / 1024).toFixed(1)} KB</span>
                            <span>Uploaded: {formatDate(doc.uploaded_at)}</span>
                          </div>
                          {doc.description && (
                            <p className="text-xs text-muted-foreground mt-1">{doc.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDocumentDownload(doc)}
                          disabled={downloadingDocument === doc.id}
                        >
                          {downloadingDocument === doc.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="text-sm">No documents uploaded yet</p>
                  <p className="text-xs mt-1">Documents will appear here once uploaded</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Payment Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-muted-foreground">Payment Status</Label>
                  <Badge 
                    variant="outline" 
                    className={
                      taxSubmission.payment_status === 'paid' 
                        ? 'bg-green-100 text-green-800 hover:bg-green-100 border-green-200' 
                        : 'bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200'
                    }
                  >
                    {taxSubmission.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                  </Badge>
                </div>
              </div>
              
              {taxSubmission.submission_status === 'submitted' && taxSubmission.payment_status !== 'paid' ? (
                <InlinePaymentFlow
                  entityType="tax_submission"
                  entityId={taxSubmission.id}
                  entityName={`${formatTaxType(taxSubmission.tax_type)} Tax - ${formatPeriod(taxSubmission.tax_period_start, taxSubmission.tax_period_end)}`}
                  customerId={taxSubmission.customer_id}
                  merchantId={taxSubmission.merchant_id}
                  baseAmountCents={taxSubmission.amount_cents || 0}
                  initialExpanded={true}
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentError={handlePaymentError}
                  onAddPaymentMethod={handleAddPaymentMethod}
                />
              ) : taxSubmission.payment_status === 'paid' ? (
                <div className="pt-2 space-y-2">
                  <Button className="w-full" disabled variant="outline">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Payment Complete
                  </Button>
                  
                  <p className="text-xs text-green-600 mt-2">
                    Your tax payment has been paid
                  </p>
                </div>
              ) : (
                <div className="pt-2">
                  <Button className="w-full" disabled variant="outline">
                    Payment Unavailable
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Payment processing will be available once your tax submission is submitted
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center py-1">
                <span className="text-sm font-medium">Submitted</span>
                <span className="text-xs text-muted-foreground">{formatDate(taxSubmission.submission_date)}</span>
              </div>
              {taxSubmission.payment_status === 'paid' && (
                <div className="flex justify-between items-center py-1 text-green-700">
                  <span className="text-sm font-medium">Payment Complete</span>
                  <span className="text-xs">Paid</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Document upload dialog would go here when implemented */}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {isMunicipalUser ? (
        <MunicipalLayout>
          <PageContent />
        </MunicipalLayout>
      ) : (
        <PageContent />
      )}

      {/* Add Payment Method Dialog */}
      <AddPaymentMethodDialog
        open={isAddPaymentDialogOpen}
        onOpenChange={setIsAddPaymentDialogOpen}
        onSuccess={() => {
          setIsAddPaymentDialogOpen(false);
        }}
      />
    </div>
  );
};

export default TaxDetail;