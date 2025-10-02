import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useMunicipalRecentApplications } from '@/hooks/useMunicipalRecentApplications';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { PermitStatusBadge } from '@/components/PermitStatusBadge';
import { BusinessLicenseStatusBadge } from '@/components/BusinessLicenseStatusBadge';
import { TaxSubmissionStatusBadge } from '@/components/TaxSubmissionStatusBadge';
import ServiceApplicationStatusBadge from '@/components/ServiceApplicationStatusBadge';
import { Badge } from '@/components/ui/badge';

const PaymentStatusBadge = ({ status }: { status: string | null }) => {
  if (!status) {
    return <Badge className="bg-muted text-muted-foreground hover:bg-muted">N/A</Badge>;
  }
  
  const config = status === 'paid' 
    ? { className: 'bg-green-500 text-white hover:bg-green-500', label: 'Paid' }
    : status === 'pending'
    ? { className: 'bg-yellow-500 text-white hover:bg-yellow-500', label: 'Pending' }
    : { className: 'bg-red-500 text-white hover:bg-red-500', label: 'Unpaid' };
    
  return <Badge className={config.className}>{config.label}</Badge>;
};

export const MunicipalRecentApplicationsTables = () => {
  const navigate = useNavigate();
  const { permits, licenses, taxes, services, isLoading } = useMunicipalRecentApplications();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Building Permits */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Building Permits</CardTitle>
        </CardHeader>
        <CardContent>
          {permits.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No recent building permits</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="text-xs font-normal text-muted-foreground">Date</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">User/Business</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">Service Type</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">Category</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">Status</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permits.map((permit) => (
                  <TableRow 
                    key={permit.id}
                    className="cursor-pointer hover:bg-muted/30 border-b border-border/40"
                    onClick={() => navigate(`/municipal/permits/${permit.id}`)}
                  >
                    <TableCell className="text-sm">{formatDate(permit.submitted_at)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium">{permit.applicant_full_name}</span>
                        {permit.applicant_email && (
                          <span className="text-xs text-muted-foreground">{permit.applicant_email}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">Permit</TableCell>
                    <TableCell className="text-sm">{permit.permit_type}</TableCell>
                    <TableCell>
                      <PermitStatusBadge status={permit.application_status as any} />
                    </TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={permit.payment_status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Business Licenses */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Business Licenses</CardTitle>
        </CardHeader>
        <CardContent>
          {licenses.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No recent business licenses</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="text-xs font-normal text-muted-foreground">Date</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">User/Business</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">Service Type</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">Category</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">Status</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {licenses.map((license) => (
                  <TableRow 
                    key={license.id}
                    className="cursor-pointer hover:bg-muted/30 border-b border-border/40"
                    onClick={() => navigate(`/municipal/business-licenses/${license.id}`)}
                  >
                    <TableCell className="text-sm">{formatDate(license.submitted_at)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium">
                          {license.business_legal_name || `${license.owner_first_name} ${license.owner_last_name}`}
                        </span>
                        {(license.business_email || license.owner_email) && (
                          <span className="text-xs text-muted-foreground">
                            {license.business_email || license.owner_email}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">License</TableCell>
                    <TableCell className="text-sm">{license.business_type}</TableCell>
                    <TableCell>
                      <BusinessLicenseStatusBadge status={license.application_status} />
                    </TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={license.payment_status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Business Taxes */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Business Taxes</CardTitle>
        </CardHeader>
        <CardContent>
          {taxes.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No recent business taxes</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="text-xs font-normal text-muted-foreground">Date</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">User/Business</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">Service Type</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">Category</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">Status</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {taxes.map((tax) => (
                  <TableRow 
                    key={tax.id}
                    className="cursor-pointer hover:bg-muted/30 border-b border-border/40"
                    onClick={() => navigate(`/municipal/taxes/${tax.id}`)}
                  >
                    <TableCell className="text-sm">{formatDate(tax.submission_date)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium">
                          {tax.payer_business_name || `${tax.first_name || ''} ${tax.last_name || ''}`.trim() || 'N/A'}
                        </span>
                        {tax.email && (
                          <span className="text-xs text-muted-foreground">{tax.email}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">Tax</TableCell>
                    <TableCell className="text-sm">{tax.tax_type}</TableCell>
                    <TableCell>
                      <TaxSubmissionStatusBadge status={tax.submission_status} />
                    </TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={tax.payment_status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Service Applications */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Service Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No recent service applications</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="text-xs font-normal text-muted-foreground">Date</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">User/Business</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">Service Type</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">Category</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">Status</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow 
                    key={service.id}
                    className="cursor-pointer hover:bg-muted/30 border-b border-border/40"
                    onClick={() => navigate(`/municipal/other-services/${service.id}`)}
                  >
                    <TableCell className="text-sm">{formatDate(service.submitted_at)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium">
                          {service.business_legal_name || service.applicant_name || 'N/A'}
                        </span>
                        {service.applicant_email && (
                          <span className="text-xs text-muted-foreground">{service.applicant_email}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">Service</TableCell>
                    <TableCell className="text-sm">{service.service_name || 'Service Application'}</TableCell>
                    <TableCell>
                      <ServiceApplicationStatusBadge status={service.status} />
                    </TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={service.payment_status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
