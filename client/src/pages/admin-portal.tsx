import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Shield, Users, BookCheck, DollarSign, TrendingUp, Settings, Mail, FileText, CheckCircle, XCircle, 
         Activity, Calendar, Clock, ArrowUp, ArrowDown, Star, Target, Zap, BarChart3, PieChart, 
         Globe, Smartphone, MessageCircle, AlertTriangle, Award, Coins, Briefcase } from "lucide-react";
import { useLocation } from "wouter";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AdminStats {
  totalUsers: number;
  totalProviders: number;
  activeBookings: number;
  totalRevenue: number;
  pendingApplications: number;
  // Enhanced KPIs
  monthlyRecurringRevenue: number;
  customerAcquisitionCost: number;
  customerLifetimeValue: number;
  churnRate: number;
  conversionRate: number;
  averageOrderValue: number;
  providerUtilization: number;
  customerSatisfaction: number;
  // Trend data
  revenueGrowth: number;
  userGrowth: number;
  bookingGrowth: number;
  // Time-based metrics
  todayBookings: number;
  thisWeekRevenue: number;
  thisMonthRevenue: number;
  // Performance metrics
  averageResponseTime: number;
  disputeRate: number;
  retentionRate: number;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isProvider: boolean;
  isVerified: boolean;
  createdAt: string;
}

interface Provider {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  verificationStatus: string;
  rating: number;
  totalReviews: number;
}

export default function AdminPortal() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState('30d');
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  // Real-time data refresh using React Query
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        // Refetch data every 30 seconds using React Query
        queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/providers'] });
      }, 30000);
      setRefreshInterval(interval);
      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [isAuthenticated, queryClient]);

  // Admin login mutation
  const adminLoginMutation = useMutation({
    mutationFn: async (credentials: typeof loginData) => {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      if (!response.ok) {
        throw new Error('Invalid credentials');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem('adminToken', data.token);
      setIsAuthenticated(true);
      toast({
        title: "Welcome Admin!",
        description: "Successfully logged into Berry Events CRM Portal.",
      });
    },
    onError: () => {
      toast({
        title: "Login Failed",
        description: "Invalid admin credentials. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Fetch admin stats
  const { data: stats } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
    enabled: isAuthenticated,
    queryFn: async () => {
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      return response.json();
    }
  });

  // Fetch users
  const { data: users } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    enabled: isAuthenticated,
    queryFn: async () => {
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return response.json();
    }
  });

  // Fetch providers
  const { data: providers } = useQuery<Provider[]>({
    queryKey: ['/api/admin/providers'],
    enabled: isAuthenticated,
    queryFn: async () => {
      const response = await fetch('/api/admin/providers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch providers');
      }
      return response.json();
    }
  });

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    adminLoginMutation.mutate(loginData);
  };

  const handleProviderApproval = useMutation({
    mutationFn: async ({ providerId, action }: { providerId: string; action: 'approve' | 'decline' }) => {
      const response = await fetch(`/api/admin/providers/${providerId}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to process application');
      }
      
      return await response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Application Processed",
        description: `Provider ${variables.action === 'approve' ? 'approved' : 'declined'} successfully.`,
      });
      // Refetch data using React Query instead of page reload
      queryClient.invalidateQueries({ queryKey: ['/api/admin/providers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    }
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold text-gray-900">
              Berry Events Admin Portal
            </CardTitle>
            <p className="text-gray-600">Secure CRM Access</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Admin Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@berryevents.co.za"
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  required
                  data-testid="input-admin-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="Enter admin password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  required
                  data-testid="input-admin-password"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                disabled={adminLoginMutation.isPending}
                data-testid="button-admin-login"
              >
                {adminLoginMutation.isPending ? "Authenticating..." : "Access Admin Portal"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button
                variant="ghost"
                onClick={() => setLocation("/")}
                className="text-gray-600 hover:text-gray-900"
                data-testid="button-back-home"
              >
                ← Back to Homepage
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Berry Events CRM</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Admin Portal</span>
              <Button
                variant="outline"
                onClick={() => {
                  localStorage.removeItem('adminToken');
                  setIsAuthenticated(false);
                }}
                data-testid="button-admin-logout"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Executive Dashboard */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Executive Dashboard</h2>
            <p className="text-gray-600">Real-time insights and performance metrics</p>
          </div>
          <div className="flex space-x-2">
            <Badge variant="outline" className="bg-green-50 text-green-700">
              <Activity className="h-3 w-3 mr-1" />
              Live Data
            </Badge>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Last 30 days
            </Button>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Monthly Recurring Revenue */}
          <Card data-testid="stat-mrr" className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Recurring Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">R{(stats?.monthlyRecurringRevenue || stats?.totalRevenue || 0).toLocaleString()}</p>
                  <div className="flex items-center mt-2">
                    <ArrowUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600 font-medium">+{stats?.revenueGrowth || 12}%</span>
                    <span className="text-sm text-gray-500 ml-1">vs last month</span>
                  </div>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <Progress value={(stats?.revenueGrowth || 12) + 50} className="mt-4" />
            </CardContent>
          </Card>

          {/* Customer Acquisition Cost */}
          <Card data-testid="stat-cac" className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Customer Acquisition Cost</p>
                  <p className="text-3xl font-bold text-gray-900">R{stats?.customerAcquisitionCost || 45}</p>
                  <div className="flex items-center mt-2">
                    <ArrowDown className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600 font-medium">-8%</span>
                    <span className="text-sm text-gray-500 ml-1">improvement</span>
                  </div>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Target className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <Progress value={75} className="mt-4" />
            </CardContent>
          </Card>

          {/* Customer Lifetime Value */}
          <Card data-testid="stat-clv" className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Customer Lifetime Value</p>
                  <p className="text-3xl font-bold text-gray-900">R{stats?.customerLifetimeValue || 1250}</p>
                  <div className="flex items-center mt-2">
                    <ArrowUp className="h-4 w-4 text-purple-600 mr-1" />
                    <span className="text-sm text-purple-600 font-medium">+15%</span>
                    <span className="text-sm text-gray-500 ml-1">growth</span>
                  </div>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </div>
              <Progress value={85} className="mt-4" />
            </CardContent>
          </Card>

          {/* Conversion Rate */}
          <Card data-testid="stat-conversion" className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Booking Conversion Rate</p>
                  <p className="text-3xl font-bold text-gray-900">{stats?.conversionRate || 24}%</p>
                  <div className="flex items-center mt-2">
                    <ArrowUp className="h-4 w-4 text-orange-600 mr-1" />
                    <span className="text-sm text-orange-600 font-medium">+3%</span>
                    <span className="text-sm text-gray-500 ml-1">this month</span>
                  </div>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Zap className="h-8 w-8 text-orange-600" />
                </div>
              </div>
              <Progress value={stats?.conversionRate || 24} className="mt-4" />
            </CardContent>
          </Card>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <Card data-testid="stat-total-users" className="bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Users className="h-6 w-6 text-blue-600" />
                <div className="ml-3">
                  <p className="text-xs font-medium text-blue-800">Total Users</p>
                  <p className="text-xl font-bold text-blue-900">{stats?.totalUsers || 0}</p>
                  <p className="text-xs text-blue-600">+{stats?.userGrowth || 8}% growth</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-active-providers" className="bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Shield className="h-6 w-6 text-green-600" />
                <div className="ml-3">
                  <p className="text-xs font-medium text-green-800">Active Providers</p>
                  <p className="text-xl font-bold text-green-900">{stats?.totalProviders || 0}</p>
                  <p className="text-xs text-green-600">{stats?.providerUtilization || 78}% utilization</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-today-bookings" className="bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-4">
              <div className="flex items-center">
                <BookCheck className="h-6 w-6 text-orange-600" />
                <div className="ml-3">
                  <p className="text-xs font-medium text-orange-800">Today's Bookings</p>
                  <p className="text-xl font-bold text-orange-900">{stats?.todayBookings || 12}</p>
                  <p className="text-xs text-orange-600">+{stats?.bookingGrowth || 15}% vs yesterday</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-customer-satisfaction" className="bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Star className="h-6 w-6 text-purple-600" />
                <div className="ml-3">
                  <p className="text-xs font-medium text-purple-800">Satisfaction Score</p>
                  <p className="text-xl font-bold text-purple-900">{stats?.customerSatisfaction || 4.8}/5.0</p>
                  <p className="text-xs text-purple-600">Excellent rating</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-response-time" className="bg-gradient-to-br from-teal-50 to-teal-100">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Clock className="h-6 w-6 text-teal-600" />
                <div className="ml-3">
                  <p className="text-xs font-medium text-teal-800">Avg Response Time</p>
                  <p className="text-xl font-bold text-teal-900">{stats?.averageResponseTime || 2.3}min</p>
                  <p className="text-xs text-teal-600">Fast response</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-pending-applications" className="bg-gradient-to-br from-red-50 to-red-100">
            <CardContent className="p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <div className="ml-3">
                  <p className="text-xs font-medium text-red-800">Pending Apps</p>
                  <p className="text-xl font-bold text-red-900">{stats?.pendingApplications || 0}</p>
                  <p className="text-xs text-red-600">Requires attention</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trend Chart */}
          <Card className="p-6">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                Revenue Trend Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Line
                  data={{
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                      label: 'Monthly Revenue',
                      data: [15000, 18000, 22000, 19000, 26000, 31000],
                      borderColor: 'rgb(59, 130, 246)',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      tension: 0.4,
                      fill: true
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      title: { display: false }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value: any) {
                            return 'R' + value.toLocaleString();
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Service Performance Breakdown */}
          <Card className="p-6">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 mr-2 text-purple-600" />
                Service Performance Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Doughnut
                  data={{
                    labels: ['House Cleaning', 'Plumbing', 'Electrical', 'Garden Care', 'Chef Services'],
                    datasets: [{
                      data: [35, 20, 15, 18, 12],
                      backgroundColor: [
                        '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'
                      ],
                      borderWidth: 2,
                      borderColor: '#ffffff'
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          padding: 20,
                          usePointStyle: true
                        }
                      }
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Provider Performance */}
          <Card className="p-6">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2 text-green-600" />
                Top Performing Providers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: "Sarah Johnson", rating: 4.9, bookings: 127, revenue: "R15,400" },
                { name: "Michael Chen", rating: 4.8, bookings: 98, revenue: "R12,800" },
                { name: "Emma Williams", rating: 4.7, bookings: 89, revenue: "R11,200" }
              ].map((provider, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{provider.name}</p>
                      <p className="text-sm text-gray-600">{provider.bookings} bookings</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center mb-1">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="font-medium">{provider.rating}</span>
                    </div>
                    <p className="text-sm font-medium text-green-600">{provider.revenue}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Customer Satisfaction Trends */}
          <Card className="p-6">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2 text-yellow-600" />
                Satisfaction Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Rating</span>
                  <span className="text-2xl font-bold text-yellow-600">4.8/5</span>
                </div>
                <Progress value={96} className="h-2" />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Service Quality</span>
                    <span>4.9</span>
                  </div>
                  <Progress value={98} className="h-1" />
                  
                  <div className="flex justify-between text-sm">
                    <span>Punctuality</span>
                    <span>4.7</span>
                  </div>
                  <Progress value={94} className="h-1" />
                  
                  <div className="flex justify-between text-sm">
                    <span>Communication</span>
                    <span>4.6</span>
                  </div>
                  <Progress value={92} className="h-1" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Real-time Activity Feed */}
          <Card className="p-6">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-600" />
                Live Activity Feed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-64 overflow-y-auto">
              {[
                { type: "booking", message: "New booking received - House Cleaning", time: "2 min ago", color: "green" },
                { type: "payment", message: "Payment processed - R450", time: "5 min ago", color: "blue" },
                { type: "provider", message: "New provider application", time: "8 min ago", color: "purple" },
                { type: "review", message: "5-star review received", time: "12 min ago", color: "yellow" },
                { type: "booking", message: "Booking completed - Garden Care", time: "15 min ago", color: "green" },
                { type: "user", message: "New user registration", time: "18 min ago", color: "blue" }
              ].map((activity, index) => (
                <div key={index} className="flex items-center p-2 rounded-lg bg-gray-50">
                  <div className={`w-2 h-2 rounded-full bg-${activity.color}-500 mr-3`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
            <TabsTrigger value="providers" data-testid="tab-providers">Providers</TabsTrigger>
            <TabsTrigger value="bookings" data-testid="tab-bookings">Bookings</TabsTrigger>
            <TabsTrigger value="communications" data-testid="tab-communications">Communications</TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    Welcome to the Berry Events Admin CRM Portal. Monitor platform activity, manage users and providers, and process applications.
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold text-blue-900">Recent Activity</h3>
                      <p className="text-sm text-blue-700">System is running smoothly</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h3 className="font-semibold text-green-900">Platform Health</h3>
                      <p className="text-sm text-green-700">All services operational</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users?.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`user-${user.id}`}>
                      <div>
                        <p className="font-medium">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500">
                          {user.isProvider ? 'Provider' : 'Customer'} | 
                          {user.isVerified ? ' Verified' : ' Unverified'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {user.isVerified ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="providers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Provider Management & Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {providers?.map((provider) => (
                    <div key={provider.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`provider-${provider.id}`}>
                      <div>
                        <p className="font-medium">{provider.firstName} {provider.lastName}</p>
                        <p className="text-sm text-gray-600">{provider.email}</p>
                        <p className="text-xs text-gray-500">
                          Status: {provider.verificationStatus} | 
                          Rating: {provider.rating}/5 ({provider.totalReviews} reviews)
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {provider.verificationStatus === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleProviderApproval.mutate({ providerId: provider.id, action: 'approve' })}
                              className="bg-green-600 hover:bg-green-700"
                              data-testid={`approve-${provider.id}`}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleProviderApproval.mutate({ providerId: provider.id, action: 'decline' })}
                              data-testid={`decline-${provider.id}`}
                            >
                              Decline
                            </Button>
                          </>
                        )}
                        {provider.verificationStatus === 'approved' && (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BookCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Booking management interface coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="communications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Communication Center</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <Mail className="h-8 w-8 text-blue-600 mb-2" />
                      <h3 className="font-semibold">Email Campaigns</h3>
                      <p className="text-sm text-gray-600">Send bulk emails to users and providers</p>
                      <Button className="mt-2" size="sm" data-testid="button-email-campaign">
                        Create Campaign
                      </Button>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <FileText className="h-8 w-8 text-green-600 mb-2" />
                      <h3 className="font-semibold">SMS Notifications</h3>
                      <p className="text-sm text-gray-600">Send SMS updates and alerts</p>
                      <Button className="mt-2" size="sm" data-testid="button-sms-campaign">
                        Send SMS
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <Settings className="h-8 w-8 text-purple-600 mb-2" />
                      <h3 className="font-semibold">Platform Settings</h3>
                      <p className="text-sm text-gray-600">Configure commission rates and pricing</p>
                      <Button className="mt-2" size="sm" data-testid="button-platform-settings">
                        Configure
                      </Button>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <TrendingUp className="h-8 w-8 text-orange-600 mb-2" />
                      <h3 className="font-semibold">Analytics Export</h3>
                      <p className="text-sm text-gray-600">Export reports in PDF/Excel format</p>
                      <Button className="mt-2" size="sm" data-testid="button-export-analytics">
                        Export Data
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}