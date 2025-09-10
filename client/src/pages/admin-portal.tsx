import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Shield, Users, BookCheck, DollarSign, TrendingUp, Settings, Mail, FileText, CheckCircle, XCircle } from "lucide-react";
import { useLocation } from "wouter";

interface AdminStats {
  totalUsers: number;
  totalProviders: number;
  activeBookings: number;
  totalRevenue: number;
  pendingApplications: number;
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

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
      // Refetch providers
      window.location.reload();
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
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card data-testid="stat-total-users">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-total-providers">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Providers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalProviders || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-active-bookings">
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookCheck className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.activeBookings || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-total-revenue">
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">R{stats?.totalRevenue?.toLocaleString() || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-pending-applications">
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Apps</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.pendingApplications || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard" data-testid="tab-dashboard">Dashboard</TabsTrigger>
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