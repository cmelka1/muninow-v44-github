import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer as RechartsResponsiveContainer, Area, AreaChart } from 'recharts';
import ReportBuilder from '@/components/ReportBuilder';
import { useResponsiveNavigation } from '@/hooks/useResponsiveNavigation';
import { 
  DollarSign, 
  FileText, 
  Users, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  CreditCard,
  Building2,
  Car,
  Calendar,
  CheckCircle,
  XCircle,
  Timer,
  FileBarChart
} from 'lucide-react';

// Dummy data for the dashboard
const monthlyRevenue = [
  { month: 'Jan', revenue: 2850000, bills: 12500, collection: 92 },
  { month: 'Feb', revenue: 2620000, bills: 11800, collection: 89 },
  { month: 'Mar', revenue: 3100000, bills: 13200, collection: 94 },
  { month: 'Apr', revenue: 2950000, bills: 12900, collection: 91 },
  { month: 'May', revenue: 3350000, bills: 14100, collection: 96 },
  { month: 'Jun', revenue: 3200000, bills: 13800, collection: 93 },
];

const revenueByCategory = [
  { category: 'Property Taxes', revenue: 8500000, percentage: 45, color: '#8884d8' },
  { category: 'Traffic Fines', revenue: 2100000, percentage: 11, color: '#82ca9d' },
  { category: 'Permits & Licenses', revenue: 1800000, percentage: 10, color: '#ffc658' },
  { category: 'Utilities', revenue: 3200000, percentage: 17, color: '#ff7c7c' },
  { category: 'Other Fees', revenue: 3200000, percentage: 17, color: '#8dd1e1' },
];

const actualVsBudget = [
  { month: 'Jan', actual: 2850000, budget: 3000000 },
  { month: 'Feb', actual: 2620000, budget: 2800000 },
  { month: 'Mar', actual: 3100000, budget: 3200000 },
  { month: 'Apr', actual: 2950000, budget: 3100000 },
  { month: 'May', actual: 3350000, budget: 3400000 },
  { month: 'Jun', actual: 3200000, budget: 3300000 },
];

const paymentMethods = [
  { method: 'Online Payment', count: 45600, percentage: 62 },
  { method: 'ACH Transfer', count: 18200, percentage: 25 },
  { method: 'In-Person', count: 7300, percentage: 10 },
  { method: 'Phone Payment', count: 2200, percentage: 3 },
];

const recentBills = [
  { id: 'B-2024-001', type: 'Property Tax', amount: 2450, status: 'Paid', date: '2024-01-15' },
  { id: 'B-2024-002', type: 'Parking Fine', amount: 75, status: 'Overdue', date: '2024-01-12' },
  { id: 'B-2024-003', type: 'Business License', amount: 150, status: 'Paid', date: '2024-01-14' },
  { id: 'B-2024-004', type: 'Water Bill', amount: 89, status: 'Pending', date: '2024-01-16' },
  { id: 'B-2024-005', type: 'Building Permit', amount: 500, status: 'Paid', date: '2024-01-13' },
];

const topDepartments = [
  { department: 'Property Assessment', revenue: 8500000, growth: 12 },
  { department: 'Transportation', revenue: 2100000, growth: -5 },
  { department: 'Planning & Zoning', revenue: 1800000, growth: 8 },
  { department: 'Public Works', revenue: 1600000, growth: 15 },
];

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
  bills: {
    label: "Bills Issued",
    color: "hsl(var(--secondary))",
  },
  collection: {
    label: "Collection Rate",
    color: "hsl(var(--accent))",
  },
  actual: {
    label: "Actual Revenue",
    color: "hsl(var(--primary))",
  },
  budget: {
    label: "Budget Revenue",
    color: "hsl(var(--muted-foreground))",
  },
};

const MunicipalDashboard = () => {
  const { isMobile } = useResponsiveNavigation();
  
  // Simplified responsive dimensions
  const chartHeight = 'h-[350px]';
  const chartContentHeight = 'h-[280px]';
  const pieRadius = isMobile ? 60 : 80;
  
  // Simplified grid configurations
  const kpiGridCols = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
  const mainChartCols = 'grid-cols-1 xl:grid-cols-2';
  const secondaryChartCols = 'grid-cols-1 lg:grid-cols-2';
  
  return (
    <div className="container mx-auto p-4 space-y-6 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Municipal Dashboard</h1>
        </div>
        <ReportBuilder>
          <Button variant="outline" className="flex items-center gap-2">
            <FileBarChart className="h-4 w-4" />
            {!isMobile ? 'Create Report' : 'Report'}
          </Button>
        </ReportBuilder>
      </div>

      {/* KPI Cards */}
      <div className={`grid ${kpiGridCols} gap-4`}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$18.8M</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12.5% from last year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bills Processed</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">73,500</div>
            <p className="text-xs text-muted-foreground">+2,100 this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92.8%</div>
            <p className="text-xs text-muted-foreground">+1.2% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Bills</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1.3M</div>
            <p className="text-xs text-muted-foreground">
              <AlertCircle className="inline h-3 w-3 mr-1" />
              156 overdue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className={`grid ${mainChartCols} gap-4`}>
        {/* Actual vs Budget Revenue */}
        <Card className={chartHeight}>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Actual vs Budget Revenue</CardTitle>
          </CardHeader>
          <CardContent className={chartContentHeight}>
            <ChartContainer config={chartConfig} className="h-full">
              <RechartsResponsiveContainer width="100%" height="100%">
                <BarChart data={actualVsBudget}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis 
                    tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                    fontSize={12}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value) => [`$${(Number(value) / 1000000).toFixed(2)}M`]}
                  />
                  <Bar 
                    dataKey="actual" 
                    fill="hsl(var(--primary))" 
                    radius={[2, 2, 0, 0]}
                    name="Actual Revenue"
                  />
                  <Bar 
                    dataKey="budget" 
                    fill="hsl(var(--muted-foreground))" 
                    radius={[2, 2, 0, 0]}
                    name="Budget Revenue"
                  />
                </BarChart>
              </RechartsResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Revenue Trend */}
        <Card className={chartHeight}>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Monthly Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent className={chartContentHeight}>
            <ChartContainer config={chartConfig} className="h-full">
              <RechartsResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis 
                    tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                    fontSize={12}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value) => [`$${(Number(value) / 1000000).toFixed(2)}M`, 'Revenue']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary))" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </RechartsResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Category and Additional Metrics */}
      <div className={`grid ${secondaryChartCols} gap-4`}>
        {/* Revenue by Category */}
        <Card className={chartHeight}>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Revenue by Category</CardTitle>
          </CardHeader>
          <CardContent className={chartContentHeight}>
            <ChartContainer config={chartConfig} className="h-full">
              <RechartsResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueByCategory}
                    cx="50%"
                    cy="50%"
                    outerRadius={pieRadius}
                    dataKey="revenue"
                    label={!isMobile ? ({ category, percentage }) => `${category}: ${percentage}%` : false}
                    labelLine={!isMobile}
                  >
                    {revenueByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value) => [`$${(Number(value) / 1000000).toFixed(1)}M`, 'Revenue']}
                  />
                </PieChart>
              </RechartsResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className={chartHeight}>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Payment Methods</CardTitle>
          </CardHeader>
          <CardContent className={`${chartContentHeight} space-y-4 overflow-y-auto`}>
            {paymentMethods.map((method) => (
              <div key={method.method} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-sm">{method.method}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={method.percentage} className="w-16" />
                  <span className="text-sm font-medium">{method.percentage}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Top Departments */}
      <Card className={chartHeight}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Top Revenue Departments</CardTitle>
        </CardHeader>
        <CardContent className={`${chartContentHeight} space-y-4 overflow-y-auto`}>
          {topDepartments.map((dept) => (
            <div key={dept.department} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{dept.department}</p>
                <p className="text-xs text-muted-foreground">
                  ${(dept.revenue / 1000000).toFixed(1)}M
                </p>
              </div>
              <Badge variant={dept.growth > 0 ? "default" : "destructive"}>
                {dept.growth > 0 ? '+' : ''}{dept.growth}%
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* System Status */}
      <Card className="h-auto">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">System Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Payment Processing</span>
            <Badge variant="default">
              <CheckCircle className="h-3 w-3 mr-1" />
              Online
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Bill Generation</span>
            <Badge variant="default">
              <CheckCircle className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Notification Service</span>
            <Badge variant="secondary">
              <Timer className="h-3 w-3 mr-1" />
              Maintenance
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Data Sync</span>
            <Badge variant="default">
              <CheckCircle className="h-3 w-3 mr-1" />
              Synced
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Table */}
      <Card className="h-auto">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Bills Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {isMobile ? (
            // Mobile Card Layout
            <div className="space-y-4">
              {recentBills.map((bill) => (
                <div key={bill.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium">{bill.id}</p>
                      <p className="text-xs text-muted-foreground">{bill.type}</p>
                    </div>
                    <Badge variant={
                      bill.status === 'Paid' ? 'default' : 
                      bill.status === 'Overdue' ? 'destructive' : 'secondary'
                    }>
                      {bill.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">${bill.amount}</span>
                    <span className="text-xs text-muted-foreground">{bill.date}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Desktop Table Layout
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Bill ID</th>
                    <th className="text-left p-2 font-medium">Type</th>
                    <th className="text-left p-2 font-medium">Amount</th>
                    <th className="text-left p-2 font-medium">Status</th>
                    <th className="text-left p-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBills.map((bill) => (
                    <tr key={bill.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{bill.id}</td>
                      <td className="p-2">{bill.type}</td>
                      <td className="p-2">${bill.amount}</td>
                      <td className="p-2">
                        <Badge variant={
                          bill.status === 'Paid' ? 'default' : 
                          bill.status === 'Overdue' ? 'destructive' : 'secondary'
                        }>
                          {bill.status}
                        </Badge>
                      </td>
                      <td className="p-2">{bill.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default MunicipalDashboard;