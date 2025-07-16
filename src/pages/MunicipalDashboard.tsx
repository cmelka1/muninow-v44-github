import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from 'recharts';
import ReportBuilder from '@/components/ReportBuilder';
import { 
  DollarSign, 
  FileText, 
  TrendingUp, 
  AlertCircle,
  Building2,
  CreditCard,
  FileBarChart,
  Activity,
  Target
} from 'lucide-react';

// Structured data for balanced dashboard
const revenueMetrics = {
  total: 18800000,
  monthly: 3200000,
  growth: 12.5,
  target: 20000000
};

const collectionMetrics = {
  rate: 92.8,
  improvement: 1.2,
  totalBills: 73500,
  overdue: 156
};

const monthlyTrend = [
  { month: 'Jan', revenue: 2850000, collection: 92 },
  { month: 'Feb', revenue: 2620000, collection: 89 },
  { month: 'Mar', revenue: 3100000, collection: 94 },
  { month: 'Apr', revenue: 2950000, collection: 91 },
  { month: 'May', revenue: 3350000, collection: 96 },
  { month: 'Jun', revenue: 3200000, collection: 93 },
];

const departmentBreakdown = [
  { department: 'Property Assessment', revenue: 8500000, percentage: 45 },
  { department: 'Transportation', revenue: 2100000, percentage: 11 },
  { department: 'Planning & Zoning', revenue: 1800000, percentage: 10 },
  { department: 'Public Works', revenue: 3200000, percentage: 17 },
  { department: 'Other Services', revenue: 3200000, percentage: 17 },
];

const paymentAnalytics = [
  { method: 'Online Payment', count: 45600, percentage: 62, color: 'hsl(var(--primary))' },
  { method: 'ACH Transfer', count: 18200, percentage: 25, color: 'hsl(var(--secondary))' },
  { method: 'In-Person', count: 7300, percentage: 10, color: 'hsl(var(--accent))' },
  { method: 'Phone Payment', count: 2200, percentage: 3, color: 'hsl(var(--muted))' },
];

const recentTransactions = [
  { id: 'T-2024-001', department: 'Property Assessment', amount: 2450, type: 'Payment', date: '2024-01-15' },
  { id: 'T-2024-002', department: 'Transportation', amount: 75, type: 'Fine', date: '2024-01-14' },
  { id: 'T-2024-003', department: 'Planning & Zoning', amount: 150, type: 'License', date: '2024-01-14' },
  { id: 'T-2024-004', department: 'Public Works', amount: 89, type: 'Utility', date: '2024-01-13' },
  { id: 'T-2024-005', department: 'Property Assessment', amount: 500, type: 'Permit', date: '2024-01-13' },
];

const quickActions = [
  { title: 'Payment Processing', status: 'Online', variant: 'default' as const },
  { title: 'System Sync', status: 'Active', variant: 'default' as const },
  { title: 'Notifications', status: 'Maintenance', variant: 'secondary' as const },
  { title: 'Data Backup', status: 'Complete', variant: 'default' as const },
];

const chartConfig = {
  revenue: { label: "Revenue", color: "hsl(var(--primary))" },
  collection: { label: "Collection Rate", color: "hsl(var(--secondary))" },
  department: { label: "Department", color: "hsl(var(--accent))" },
};

const MunicipalDashboard = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Municipal Dashboard</h1>
        <ReportBuilder>
          <Button variant="outline" className="flex items-center gap-2">
            <FileBarChart className="h-4 w-4" />
            Create Report
          </Button>
        </ReportBuilder>
      </div>

      {/* Main Dashboard Grid - 3x2 Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Section 1: Revenue Overview */}
        <Card className="h-[400px]">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Revenue Overview</CardTitle>
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-2xl font-bold">${(revenueMetrics.total / 1000000).toFixed(1)}M</div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">+{revenueMetrics.growth}%</div>
                <p className="text-sm text-muted-foreground">Growth Rate</p>
              </div>
            </div>
            <ChartContainer config={chartConfig} className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary))" 
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Section 2: Collection Performance */}
        <Card className="h-[400px]">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Collection Performance</CardTitle>
              <Target className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-2xl font-bold">{collectionMetrics.rate}%</div>
                <p className="text-sm text-muted-foreground">Collection Rate</p>
              </div>
              <div>
                <div className="text-2xl font-bold">{collectionMetrics.totalBills.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">Bills Processed</p>
              </div>
            </div>
            <ChartContainer config={chartConfig} className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis domain={[85, 100]} fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="collection" 
                    fill="hsl(var(--secondary))" 
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Section 3: Department Breakdown */}
        <Card className="h-[400px]">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Department Breakdown</CardTitle>
              <Building2 className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <ChartContainer config={chartConfig} className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentBreakdown} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis type="number" tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} fontSize={12} />
                  <YAxis type="category" dataKey="department" width={120} fontSize={11} />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value) => [`$${(Number(value) / 1000000).toFixed(1)}M`, 'Revenue']}
                  />
                  <Bar 
                    dataKey="revenue" 
                    fill="hsl(var(--accent))" 
                    radius={[0, 2, 2, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Section 4: Payment Analytics */}
        <Card className="h-[400px]">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Payment Analytics</CardTitle>
              <CreditCard className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="flex items-center justify-center mb-4">
              <ChartContainer config={chartConfig} className="h-[200px] w-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentAnalytics}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      dataKey="percentage"
                    >
                      {paymentAnalytics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      formatter={(value) => [`${value}%`, 'Share']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            <div className="space-y-2">
              {paymentAnalytics.map((method) => (
                <div key={method.method} className="flex items-center justify-between text-sm">
                  <span>{method.method}</span>
                  <span className="font-medium">{method.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Section 5: Recent Transactions */}
        <Card className="h-[400px]">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
              <Activity className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="space-y-3 overflow-y-auto h-[320px]">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{transaction.department}</p>
                    <p className="text-xs text-muted-foreground">{transaction.type} • {transaction.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">${transaction.amount}</p>
                    <p className="text-xs text-muted-foreground">{transaction.id}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Section 6: Quick Actions & Alerts */}
        <Card className="h-[400px]">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">System Status & Alerts</CardTitle>
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="space-y-4">
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="font-medium text-sm">Urgent Alert</span>
                </div>
                <p className="text-sm text-muted-foreground">{collectionMetrics.overdue} bills are overdue</p>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-sm">System Status</h4>
                {quickActions.map((action) => (
                  <div key={action.title} className="flex items-center justify-between">
                    <span className="text-sm">{action.title}</span>
                    <Badge variant={action.variant}>{action.status}</Badge>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold text-primary">98.5%</div>
                    <p className="text-xs text-muted-foreground">Uptime</p>
                  </div>
                  <div>
                    <div className="text-xl font-bold">4.2s</div>
                    <p className="text-xs text-muted-foreground">Avg Response</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MunicipalDashboard;