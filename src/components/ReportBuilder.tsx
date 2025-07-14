import React, { useState } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  FileBarChart, 
  Calendar, 
  Users, 
  Clock, 
  Mail, 
  Download,
  X,
  Plus
} from 'lucide-react';

interface ReportBuilderProps {
  children: React.ReactNode;
}

const ReportBuilder = ({ children }: ReportBuilderProps) => {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [timePeriod, setTimePeriod] = useState('1month');
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState('monthly');
  const [recipients, setRecipients] = useState<string[]>(['mayor@city.gov']);
  const [newRecipient, setNewRecipient] = useState('');

  const reportMetrics = [
    { id: 'total-revenue', label: 'Total Revenue', category: 'Revenue Metrics' },
    { id: 'collection-rate', label: 'Collection Rate', category: 'Revenue Metrics' },
    { id: 'outstanding-bills', label: 'Outstanding Bills', category: 'Revenue Metrics' },
    { id: 'bills-by-status', label: 'Bills by Status', category: 'Bill Analytics' },
    { id: 'payment-methods', label: 'Payment Methods', category: 'Bill Analytics' },
    { id: 'bill-types', label: 'Bill Types Distribution', category: 'Bill Analytics' },
    { id: 'department-performance', label: 'Department Performance', category: 'Department Analytics' },
    { id: 'growth-rates', label: 'Growth Rates', category: 'Department Analytics' },
    { id: 'monthly-trends', label: 'Monthly Revenue Trends', category: 'Financial Trends' },
    { id: 'seasonal-patterns', label: 'Seasonal Patterns', category: 'Financial Trends' },
    { id: 'online-adoption', label: 'Online Payment Adoption', category: 'Citizen Engagement' },
    { id: 'processing-times', label: 'Processing Times', category: 'System Performance' },
  ];

  const suggestedRecipients = [
    'mayor@city.gov',
    'finance.director@city.gov',
    'city.manager@city.gov',
    'treasurer@city.gov',
    'budget.analyst@city.gov'
  ];

  const groupedMetrics = reportMetrics.reduce((acc, metric) => {
    if (!acc[metric.category]) {
      acc[metric.category] = [];
    }
    acc[metric.category].push(metric);
    return acc;
  }, {} as Record<string, typeof reportMetrics>);

  const handleMetricToggle = (metricId: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metricId) 
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    );
  };

  const addRecipient = () => {
    if (newRecipient && !recipients.includes(newRecipient)) {
      setRecipients([...recipients, newRecipient]);
      setNewRecipient('');
    }
  };

  const removeRecipient = (email: string) => {
    setRecipients(recipients.filter(r => r !== email));
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="w-[480px] sm:w-[540px] overflow-y-auto">
        <SheetHeader className="pb-6">
          <SheetTitle className="flex items-center gap-2">
            <FileBarChart className="h-5 w-5" />
            Custom Report Builder
          </SheetTitle>
          <SheetDescription>
            Create detailed reports for municipal financial data and analytics
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Report Content Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileBarChart className="h-4 w-4" />
                Report Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(groupedMetrics).map(([category, metrics]) => (
                <div key={category} className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    {category}
                  </Label>
                  <div className="space-y-2 pl-2">
                    {metrics.map((metric) => (
                      <div key={metric.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={metric.id}
                          checked={selectedMetrics.includes(metric.id)}
                          onCheckedChange={() => handleMetricToggle(metric.id)}
                        />
                        <Label
                          htmlFor={metric.id}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {metric.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Time Period Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Time Period
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={timePeriod === '1week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimePeriod('1week')}
                >
                  1 Week
                </Button>
                <Button
                  variant={timePeriod === '1month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimePeriod('1month')}
                >
                  1 Month
                </Button>
                <Button
                  variant={timePeriod === '3months' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimePeriod('3months')}
                >
                  3 Months
                </Button>
                <Button
                  variant={timePeriod === '1year' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimePeriod('1year')}
                >
                  1 Year
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="compare-previous"
                  defaultChecked
                />
                <Label htmlFor="compare-previous" className="text-sm">
                  Compare to previous period
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Recurring Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Recurring Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                        <Checkbox
                          id="recurring"
                          checked={isRecurring}
                          onCheckedChange={(checked) => setIsRecurring(checked === true)}
                        />
                <Label htmlFor="recurring" className="text-sm">
                  Send recurring reports
                </Label>
              </div>

              {isRecurring && (
                <div className="space-y-3 pl-6">
                  <div>
                    <Label className="text-sm">Frequency</Label>
                    <Select value={frequency} onValueChange={setFrequency}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annually">Annually</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm">Start Date</Label>
                    <Input type="date" className="mt-1" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recipients */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Recipients
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter email address"
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addRecipient()}
                />
                <Button onClick={addRecipient} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Current Recipients</Label>
                <div className="flex flex-wrap gap-1">
                  {recipients.map((email) => (
                    <Badge key={email} variant="secondary" className="flex items-center gap-1">
                      {email}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeRecipient(email)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Suggested Recipients</Label>
                <div className="flex flex-wrap gap-1">
                  {suggestedRecipients
                    .filter(email => !recipients.includes(email))
                    .map((email) => (
                      <Badge 
                        key={email} 
                        variant="outline" 
                        className="cursor-pointer hover:bg-accent"
                        onClick={() => setRecipients([...recipients, email])}
                      >
                        {email}
                      </Badge>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Format
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm">PDF</Button>
                <Button variant="outline" size="sm">Excel</Button>
                <Button variant="outline" size="sm">CSV</Button>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button className="w-full" disabled={selectedMetrics.length === 0}>
              <FileBarChart className="h-4 w-4 mr-2" />
              Generate Report ({selectedMetrics.length} metrics)
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm">
                Preview Report
              </Button>
              <Button variant="outline" size="sm">
                Save Template
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ReportBuilder;