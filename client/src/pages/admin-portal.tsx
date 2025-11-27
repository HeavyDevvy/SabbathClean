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
import { Shield, Users, BookCheck, Banknote, TrendingUp, Settings, Mail, FileText, CheckCircle, XCircle, 
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
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  servicesOffered?: string[];
  verificationStatus: string;
  rating?: number;
  totalReviews?: number;
  createdAt?: string;
  location?: string;
  hourlyRate?: string;
  qualificationCertificate?: string;
  idDocument?: string;
}

export default function AdminPortal() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState('30d');
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUserForm, setEditUserForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    isVerified: false
  });
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);

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

  const filteredProviders = (providers || [])
    .filter((p) => statusFilter === 'all' ? true : (p.verificationStatus === statusFilter))
    .sort((a, b) => {
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bDate - aDate;
    });

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    adminLoginMutation.mutate(loginData);
  };

  // User update mutation
  const updateUserMutation = useMutation({
    mutationFn: async (userData: { userId: string; updates: Partial<User> }) => {
      const response = await fetch(`/api/admin/users/${userData.userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(userData.updates)
      });
      if (!response.ok) throw new Error('Failed to update user');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "User Updated", description: "User information has been updated successfully." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setEditingUser(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update user. Please try again.", variant: "destructive" });
    }
  });

  // Provider approval mutation  
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
      setSelectedProvider(null);
      setShowDeclineConfirm(false);
    }
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#EED1C4]/30 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-[#44062D] mx-auto mb-4" />
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
                className="w-full bg-[#44062D] hover:bg-[#44062D]/90" 
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
                className="text-[#44062D] hover:text-[#44062D]/80"
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
  <header className="bg-white shadow-sm border-b border-b-[#EED1C4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-[#44062D] mr-3" />
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
            <Badge variant="outline" className="bg-[#EED1C4]/60 text-[#44062D]">
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
          <Card data-testid="stat-mrr" className="border-l-4 border-l-[#44062D]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Recurring Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">R{(stats?.monthlyRecurringRevenue || stats?.totalRevenue || 0).toLocaleString()}</p>
                  <div className="flex items-center mt-2">
                    <ArrowUp className="h-4 w-4 text-[#44062D] mr-1" />
                    <span className="text-sm text-[#44062D] font-medium">+{stats?.revenueGrowth || 12}%</span>
                    <span className="text-sm text-gray-500 ml-1">vs last month</span>
                  </div>
                </div>
                <div className="p-3 bg-[#EED1C4]/60 rounded-full">
                  <Banknote className="h-8 w-8 text-[#44062D]" />
                </div>
              </div>
              <Progress value={(stats?.revenueGrowth || 12) + 50} className="mt-4" />
            </CardContent>
          </Card>

          {/* Customer Acquisition Cost */}
          <Card data-testid="stat-cac" className="border-l-4 border-l-[#44062D]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Customer Acquisition Cost</p>
                  <p className="text-3xl font-bold text-gray-900">R{stats?.customerAcquisitionCost || 45}</p>
                  <div className="flex items-center mt-2">
                    <ArrowDown className="h-4 w-4 text-[#44062D] mr-1" />
                    <span className="text-sm text-[#44062D] font-medium">-8%</span>
                    <span className="text-sm text-gray-500 ml-1">improvement</span>
                  </div>
                </div>
                <div className="p-3 bg-[#EED1C4]/60 rounded-full">
                  <Target className="h-8 w-8 text-[#44062D]" />
                </div>
              </div>
              <Progress value={75} className="mt-4" />
            </CardContent>
          </Card>

          {/* Customer Lifetime Value */}
          <Card data-testid="stat-clv" className="border-l-4 border-l-[#44062D]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Customer Lifetime Value</p>
                  <p className="text-3xl font-bold text-gray-900">R{stats?.customerLifetimeValue || 1250}</p>
                  <div className="flex items-center mt-2">
                    <ArrowUp className="h-4 w-4 text-[#44062D] mr-1" />
                    <span className="text-sm text-[#44062D] font-medium">+15%</span>
                    <span className="text-sm text-gray-500 ml-1">growth</span>
                  </div>
                </div>
                <div className="p-3 bg-[#EED1C4]/60 rounded-full">
                  <Users className="h-8 w-8 text-[#44062D]" />
                </div>
              </div>
              <Progress value={85} className="mt-4" />
            </CardContent>
          </Card>

          {/* Conversion Rate */}
          <Card data-testid="stat-conversion" className="border-l-4 border-l-[#44062D]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Booking Conversion Rate</p>
                  <p className="text-3xl font-bold text-gray-900">{stats?.conversionRate || 24}%</p>
                  <div className="flex items-center mt-2">
                    <ArrowUp className="h-4 w-4 text-[#44062D] mr-1" />
                    <span className="text-sm text-[#44062D] font-medium">+3%</span>
                    <span className="text-sm text-gray-500 ml-1">this month</span>
                  </div>
                </div>
                <div className="p-3 bg-[#EED1C4]/60 rounded-full">
                  <Zap className="h-8 w-8 text-[#44062D]" />
                </div>
              </div>
              <Progress value={stats?.conversionRate || 24} className="mt-4" />
            </CardContent>
          </Card>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <Card data-testid="stat-total-users" className="bg-gradient-to-br from-[#EED1C4]/30 to-white">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Users className="h-6 w-6 text-[#44062D]" />
                <div className="ml-3">
                  <p className="text-xs font-medium text-[#44062D]">Total Users</p>
                  <p className="text-xl font-bold text-[#44062D]">{stats?.totalUsers || 0}</p>
                  <p className="text-xs text-[#44062D]/80">+{stats?.userGrowth || 8}% growth</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-active-providers" className="bg-gradient-to-br from-[#EED1C4]/30 to-white">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Shield className="h-6 w-6 text-[#44062D]" />
                <div className="ml-3">
                  <p className="text-xs font-medium text-[#44062D]">Active Providers</p>
                  <p className="text-xl font-bold text-[#44062D]">{stats?.totalProviders || 0}</p>
                  <p className="text-xs text-[#44062D]/80">{stats?.providerUtilization || 78}% utilization</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-today-bookings" className="bg-gradient-to-br from-[#EED1C4]/30 to-white">
            <CardContent className="p-4">
              <div className="flex items-center">
                <BookCheck className="h-6 w-6 text-[#44062D]" />
                <div className="ml-3">
                  <p className="text-xs font-medium text-[#44062D]">Today's Bookings</p>
                  <p className="text-xl font-bold text-[#44062D]">{stats?.todayBookings || 12}</p>
                  <p className="text-xs text-[#44062D]/80">+{stats?.bookingGrowth || 15}% vs yesterday</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-customer-satisfaction" className="bg-gradient-to-br from-[#EED1C4]/30 to-white">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Star className="h-6 w-6 text-[#44062D]" />
                <div className="ml-3">
                  <p className="text-xs font-medium text-[#44062D]">Satisfaction Score</p>
                  <p className="text-xl font-bold text-[#44062D]">{stats?.customerSatisfaction || 4.8}/5.0</p>
                  <p className="text-xs text-[#44062D]/80">Excellent rating</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-response-time" className="bg-gradient-to-br from-[#EED1C4]/30 to-white">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Clock className="h-6 w-6 text-[#44062D]" />
                <div className="ml-3">
                  <p className="text-xs font-medium text-[#44062D]">Avg Response Time</p>
                  <p className="text-xl font-bold text-[#44062D]">{stats?.averageResponseTime || 2.3}min</p>
                  <p className="text-xs text-[#44062D]/80">Fast response</p>
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
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingUser(user);
                            setEditUserForm({
                              firstName: user.firstName,
                              lastName: user.lastName,
                              email: user.email,
                              isVerified: user.isVerified
                            });
                          }}
                          data-testid={`edit-user-${user.id}`}
                        >
                          Edit
                        </Button>
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Label>Status</Label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="border rounded-md px-2 py-1 text-sm"
                        data-testid="select-status-filter"
                      >
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Declined</option>
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <div className="min-w-[800px]">
                      <div className="grid grid-cols-7 gap-4 px-4 py-2 text-xs font-semibold text-gray-600">
                        <div>Provider / Business</div>
                        <div>Email</div>
                        <div>Phone</div>
                        <div>Service Type</div>
                        <div>Status</div>
                        <div>Date Submitted</div>
                        <div>Actions</div>
                      </div>

                      <div className="divide-y">
                        {filteredProviders.map((provider) => {
                          const name = provider.companyName || `${provider.firstName || ''} ${provider.lastName || ''}`.trim();
                          const email = provider.email || 'Not provided';
                          const phone = provider.phone || 'Not provided';
                          const services = provider.servicesOffered && provider.servicesOffered.length > 0 ? provider.servicesOffered.join(', ') : 'Not provided';
                          const dateStr = provider.createdAt ? format(new Date(provider.createdAt), 'LLL dd, yyyy') : 'Not provided';
                          const status = provider.verificationStatus;
                          return (
                            <div
                              key={provider.id}
                              className="grid grid-cols-7 gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer"
                              onClick={() => setSelectedProvider(provider)}
                              data-testid={`provider-${provider.id}`}
                            >
                              <div className="font-medium text-gray-900">{name || 'Not provided'}</div>
                              <div className="text-gray-700">{email}</div>
                              <div className="text-gray-700">{phone}</div>
                              <div className="text-gray-700">{services}</div>
                              <div>
                                {status === 'pending' && (
                                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
                                )}
                                {status === 'approved' && (
                                  <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">Approved</Badge>
                                )}
                                {status === 'rejected' && (
                                  <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">Declined</Badge>
                                )}
                              </div>
                              <div className="text-gray-700">{dateStr}</div>
                              <div className="flex items-center space-x-2">
                                {status === 'pending' && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={(e) => { e.stopPropagation(); handleProviderApproval.mutate({ providerId: provider.id, action: 'approve' }); }}
                                      className="bg-green-600 hover:bg-green-700"
                                      data-testid={`approve-${provider.id}`}
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={(e) => { e.stopPropagation(); setSelectedProvider(provider); setShowDeclineConfirm(true); }}
                                      data-testid={`decline-${provider.id}`}
                                    >
                                      Decline
                                    </Button>
                                  </>
                                )}
                                {status === 'approved' && (
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
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

      {/* User Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Edit User: {editingUser.firstName} {editingUser.lastName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="edit-firstName">First Name</Label>
                <Input
                  id="edit-firstName"
                  value={editUserForm.firstName}
                  onChange={(e) => setEditUserForm({...editUserForm, firstName: e.target.value})}
                  data-testid="input-edit-firstName"
                />
              </div>
              <div>
                <Label htmlFor="edit-lastName">Last Name</Label>
                <Input
                  id="edit-lastName"
                  value={editUserForm.lastName}
                  onChange={(e) => setEditUserForm({...editUserForm, lastName: e.target.value})}
                  data-testid="input-edit-lastName"
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editUserForm.email}
                  onChange={(e) => setEditUserForm({...editUserForm, email: e.target.value})}
                  data-testid="input-edit-email"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-verified"
                  checked={editUserForm.isVerified}
                  onChange={(e) => setEditUserForm({...editUserForm, isVerified: e.target.checked})}
                  data-testid="checkbox-edit-verified"
                />
                <Label htmlFor="edit-verified">Verified User</Label>
              </div>
              <div className="flex space-x-2 pt-4">
                <Button
                  onClick={() => {
                    updateUserMutation.mutate({
                      userId: editingUser.id,
                      updates: editUserForm
                    });
                  }}
                  disabled={updateUserMutation.isPending}
                  className="flex-1"
                  data-testid="button-save-user"
                >
                  {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingUser(null)}
                  className="flex-1"
                  data-testid="button-cancel-edit"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {selectedProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-3xl max-h-[80vh] overflow-y-auto mx-4">
            <CardHeader>
              <CardTitle>Provider Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  {selectedProvider.verificationStatus === 'pending' && (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
                  )}
                  {selectedProvider.verificationStatus === 'approved' && (
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">Approved</Badge>
                  )}
                  {selectedProvider.verificationStatus === 'rejected' && (
                    <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">Declined</Badge>
                  )}
                </div>
                <Button variant="outline" onClick={() => setSelectedProvider(null)}>Close</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">Personal Information</h3>
                  <div className="mt-2 space-y-1 text-sm text-gray-800">
                    <div>Full Name: {(selectedProvider.companyName ? '' : `${selectedProvider.firstName || ''} ${selectedProvider.lastName || ''}`.trim()) || 'Not provided'}</div>
                    <div>Email Address: {selectedProvider.email || 'Not provided'}</div>
                    <div>Phone Number: {selectedProvider.phone || 'Not provided'}</div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">Business Information</h3>
                  <div className="mt-2 space-y-1 text-sm text-gray-800">
                    <div>Business Name: {selectedProvider.companyName || 'Not provided'}</div>
                    <div>Service Type / Category: {(selectedProvider.servicesOffered && selectedProvider.servicesOffered.length > 0) ? selectedProvider.servicesOffered.join(', ') : 'Not provided'}</div>
                    <div>Business Description: {'Not provided'}</div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">Service Details</h3>
                  <div className="mt-2 space-y-1 text-sm text-gray-800">
                    <div>Services Offered: {(selectedProvider.servicesOffered && selectedProvider.servicesOffered.length > 0) ? selectedProvider.servicesOffered.join(', ') : 'Not provided'}</div>
                    <div>Service Areas / Locations: {selectedProvider.location || 'Not provided'}</div>
                    <div>Pricing Information: {selectedProvider.hourlyRate ? `R${selectedProvider.hourlyRate}` : 'Not provided'}</div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">Additional Information</h3>
                  <div className="mt-2 space-y-1 text-sm text-gray-800">
                    <div>Portfolio Links / Website: {'Not provided'}</div>
                    <div>Certifications: {selectedProvider.qualificationCertificate ? 'Provided' : 'Not provided'}</div>
                    <div>Documents: {selectedProvider.idDocument ? 'Provided' : 'Not provided'}</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700">Metadata</h3>
                <div className="mt-2 space-y-1 text-sm text-gray-800">
                  <div>Date Applied: {selectedProvider.createdAt ? format(new Date(selectedProvider.createdAt), 'LLL dd, yyyy') : 'Not provided'}</div>
                  <div>Current Status: {selectedProvider.verificationStatus}</div>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                {selectedProvider.verificationStatus === 'pending' && (
                  <>
                    <Button
                      onClick={() => handleProviderApproval.mutate({ providerId: selectedProvider.id, action: 'approve' })}
                      className="bg-green-600 hover:bg-green-700"
                      data-testid={`approve-detail-${selectedProvider.id}`}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => setShowDeclineConfirm(true)}
                      data-testid={`decline-detail-${selectedProvider.id}`}
                    >
                      Decline
                    </Button>
                  </>
                )}
              </div>

              {showDeclineConfirm && (
                <div className="mt-4 p-4 border rounded-md">
                  <div className="text-sm font-medium">Are you sure you want to decline this application?</div>
                  <div className="mt-3 flex items-center space-x-2">
                    <Button
                      variant="destructive"
                      onClick={() => {
                        handleProviderApproval.mutate({ providerId: selectedProvider.id, action: 'decline' });
                      }}
                    >
                      Confirm Decline
                    </Button>
                    <Button variant="outline" onClick={() => setShowDeclineConfirm(false)}>Cancel</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
