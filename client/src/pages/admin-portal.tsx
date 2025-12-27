import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Users, BookCheck, Banknote, TrendingUp, Settings, Mail, FileText, CheckCircle, XCircle, 
         Activity, Calendar, Clock, ArrowUp, ArrowDown, Star, Target, Zap, BarChart3, PieChart, 
         Globe, Smartphone, MessageCircle, AlertTriangle, Award, Coins, Briefcase, Eye } from "lucide-react";
import { useLocation } from "wouter";
import EnhancedHeader from "@/components/enhanced-header";
import logo from "@assets/Untitled (Logo) (2)_1763529143099.png";
import adminLoginBg from "@assets/Homepage image_1763201188830.webp";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { serviceConfigs } from "@/config/service-configs";

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
  // Legacy/mem fields (kept for compatibility)
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  servicesOffered?: string[];
  location?: string;
  hourlyRate?: string;
  qualificationCertificate?: string;
  idDocument?: string;
  proofOfAddress?: string;
  bio?: string;
  experience?: string;
  profileImage?: string;
  rating?: number;
  totalReviews?: number;
  // Prisma/Vercel API fields
  businessName?: string;
  category?: string;
  verificationStatus?: string;
  verificationStatusLabel?: string;
  isVerified?: boolean;
  createdAt?: string;
  userEmail?: string;
  userPhoneNumber?: string;
  userFirstName?: string;
  userLastName?: string;
  bankingDetails?: {
    bankName?: string;
    accountType?: string;
    accountNumber?: string;
    branchCode?: string;
  };
}

export default function AdminPortal() {
  const [loc, setLocation] = useLocation();
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
  const isDev = !!(import.meta as any).env?.DEV;
  const isDebug = isDev && typeof window !== "undefined" && new URLSearchParams(window.location.search).get("debug") === "1";
  const [providersStatusCode, setProvidersStatusCode] = useState<number | null>(null);
  const [providersFirstObj, setProvidersFirstObj] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUserForm, setEditUserForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    isVerified: false
  });
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);
  const [isPlatformConfigureOpen, setIsPlatformConfigureOpen] = useState(false);
  const [berryStarsEnabledTemp, setBerryStarsEnabledTemp] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem('platformSettings');
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed.berryStarsEnabled !== false;
    } catch {
      return true;
    }
  });
  const [serviceOverrides, setServiceOverrides] = useState<Record<string, any>>(() => {
    try {
      const raw = localStorage.getItem('serviceConfigOverrides');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [newServiceForm, setNewServiceForm] = useState<any>({ id: "", title: "", basePrice: 0, steps: 4, enabled: true });

  const saveOverrides = (next: Record<string, any>) => {
    setServiceOverrides(next);
    localStorage.setItem('serviceConfigOverrides', JSON.stringify(next));
    toast({ title: "Services updated", description: "Changes are now active across the app." });
  };

  const normalizeStatus = (provider: Provider) => {
    const vs = (provider as any)?.verificationStatus;
    if (typeof vs === "string" && vs.length > 0) {
      const s = vs.toLowerCase();
      if (s === "approved") return "APPROVED";
      if (s === "pending") return "PENDING";
      if (s === "rejected" || s === "declined") return "REJECTED";
      return s.toUpperCase();
    }
    if ((provider as any)?.isVerified === true) return "APPROVED";
    return "PENDING";
  };

  const getDisplayName = (p: Provider) => {
    const company = (p as any)?.companyName || (p as any)?.businessName;
    if (company && String(company).trim().length > 0) return String(company).trim();

    const fn = (p as any)?.firstName || (p as any)?.userFirstName || "";
    const ln = (p as any)?.lastName || (p as any)?.userLastName || "";
    const full = `${String(fn).trim()} ${String(ln).trim()}`.trim();
    if (full.length > 0) return full;

    const email = (p as any)?.userEmail || (p as any)?.email || "";
    return email || "Not provided";
  };

  const getEmail = (p: Provider) => {
    const email = (p as any)?.userEmail || (p as any)?.email;
    return email ? String(email) : "Not provided";
  };

  const getPhone = (p: Provider) => {
    const phone = (p as any)?.userPhoneNumber || (p as any)?.phone;
    const val = typeof phone === "string" ? phone.trim() : phone;
    return val && String(val).trim().length > 0 ? String(val) : "Not provided";
  };

  const getServiceType = (p: Provider) => {
    const servicesOffered = (p as any)?.servicesOffered;
    if (Array.isArray(servicesOffered)) return servicesOffered.join(", ");
    if (typeof servicesOffered === "string" && servicesOffered.length > 0) return servicesOffered;
    return "Not provided";
  };

  const getDateSubmitted = (p: Provider) => {
    const d = (p as any)?.createdAt;
    return d ? format(new Date(d), 'LLL dd, yyyy') : 'Not provided';
  };

  const getProfileImage = (p: Provider) => {
    return p.profileImage || undefined;
  };

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
      try { console.log('📡 Fetching users...'); } catch {}
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const json = await response.json();
      try { console.log('✅ Users fetched:', Array.isArray(json) ? json.length : 0, 'total'); } catch {}
      return json;
    }
  });

  // Fetch providers
  const { data: providers } = useQuery<Provider[]>({
    queryKey: ['/api/admin/providers'],
    enabled: isAuthenticated,
    queryFn: async () => {
      try { console.log('📡 Fetching providers...'); } catch {}
      const response = await fetch('/api/admin/providers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch providers');
      }
      const json = await response.json();
      try {
        console.log('✅ Providers fetched:', Array.isArray(json) ? json.length : 0, 'items');
        if (Array.isArray(json) && json.length > 0) {
          console.log('Sample provider:', {
            firstName: (json[0] as any).firstName,
            lastName: (json[0] as any).lastName,
            email: (json[0] as any).email,
            phone: (json[0] as any).phone
          });
        }
      } catch {}
      return json;
    }
  });

  useEffect(() => {
    if (isAuthenticated && isDebug) {
      (async () => {
        try {
          const res = await fetch('/api/admin/providers', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
          });
          setProvidersStatusCode(res.status);
          const j = await res.json().catch(() => null);
          let arr: any[] = [];
          if (Array.isArray(j)) arr = j;
          else if (j?.providers && Array.isArray(j.providers)) arr = j.providers;
          else if (j?.data?.providers && Array.isArray(j.data.providers)) arr = j.data.providers;
          setProvidersFirstObj(arr[0] || null);
        } catch {
          setProvidersStatusCode(null);
          setProvidersFirstObj(null);
        }
      })();
    }
  }, [isAuthenticated, isDebug]);

  const filteredProviders = (providers || [])
    .filter((p) => {
      if (statusFilter === 'all') return true;
      const st = normalizeStatus(p);
      return st === statusFilter.toUpperCase();
    })
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
    mutationFn: async ({ providerId, action }: { providerId: string; action: "approve" | "decline" }) => {
      const response = await fetch(`/api/admin/providers/${providerId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error("Failed to process application");
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

  const handleApprove = async (providerId: string) => {
    const ok = typeof window !== 'undefined' ? window.confirm('Approve this provider? They will gain access to the Provider Hub.') : true;
    if (!ok) return;
    try {
      console.log('📤 Approving provider:', providerId);
      const action = "approve";
      const response = await fetch(`/api/admin/providers/${providerId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });
      if (!response.ok) {
        let msg = `Approval failed (${response.status})`;
        try { const err = await response.json(); msg = err?.message || msg; } catch {}
        throw new Error(msg);
      }
      console.log('✅ Provider approved');
      queryClient.invalidateQueries({ queryKey: ['/api/admin/providers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({ title: "Provider Approved", description: "Provider now has access to the Provider Hub." });
    } catch (error: any) {
      console.error('❌ Approval error:', error);
      toast({ title: "Approval failed", description: error?.message || 'Approval failed', variant: "destructive" });
    }
  };

  const handleDecline = async (providerId: string) => {
    const reason = typeof window !== 'undefined' ? window.prompt('Decline this provider? Optionally enter a reason:') : '';
    if (reason === null) return;
    try {
      console.log('📤 Declining provider:', providerId);
      const action = "decline";
      const response = await fetch(`/api/admin/providers/${providerId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });
      if (!response.ok) {
        let msg = `Decline failed (${response.status})`;
        try { const err = await response.json(); msg = err?.message || msg; } catch {}
        throw new Error(msg);
      }
      console.log('✅ Provider declined');
      queryClient.invalidateQueries({ queryKey: ['/api/admin/providers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({ title: "Provider Declined", description: "Provider application has been declined." });
    } catch (error: any) {
      console.error('❌ Decline error:', error);
      toast({ title: "Decline failed", description: error?.message || 'Decline failed', variant: "destructive" });
    }
  };
  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen relative"
        style={{
          backgroundImage: `url(${adminLoginBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-white/60" />
        <div className="relative min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <img src={logo} alt="Berry Events" className="h-16 w-16 mx-auto mb-4 object-contain" />
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EnhancedHeader mode="admin" onBookingClick={() => setLocation('/services')} />
      <div className="px-4 sm:px-6 lg:px-8 py-2 text-xs text-gray-500">
        Build: {(import.meta as any).env?.MODE} - {new Date().toISOString()}
      </div>

      <Dialog open={!!selectedProvider} onOpenChange={(open) => !open && setSelectedProvider(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Provider Details</DialogTitle>
          </DialogHeader>
          
          {selectedProvider && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-4">Personal Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={getProfileImage(selectedProvider)} />
                      <AvatarFallback>{selectedProvider.firstName?.[0]}{selectedProvider.lastName?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-lg">{getDisplayName(selectedProvider)}</div>
                      <div className="text-gray-500">{getEmail(selectedProvider)}</div>
                      <div className="text-gray-500">{getPhone(selectedProvider)}</div>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <div className="text-sm font-medium text-gray-500">Address</div>
                    <div>{selectedProvider.location}</div>
                  </div>

                  <div className="pt-2">
                    <div className="text-sm font-medium text-gray-500">Bio</div>
                    <div className="text-sm">{selectedProvider.bio || "No bio provided"}</div>
                  </div>

                  <div className="pt-2">
                    <div className="text-sm font-medium text-gray-500">Experience</div>
                    <div className="text-sm">{selectedProvider.experience || "Not specified"}</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-4">Documents & Verification</h3>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">ID Document</span>
                      {selectedProvider.idDocument ? (
                         <Badge className="bg-green-100 text-green-800">Uploaded</Badge>
                      ) : (
                         <Badge variant="outline" className="text-yellow-600 border-yellow-200">Missing</Badge>
                      )}
                    </div>
                    {selectedProvider.idDocument && (
                       selectedProvider.idDocument.startsWith('data:image') ? (
                        <div className="mt-2">
                          <img src={selectedProvider.idDocument} alt="ID Document" className="max-h-40 rounded border" />
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" className="w-full mt-2" onClick={() => window.open(selectedProvider.idDocument, '_blank')}>
                          <Eye className="h-4 w-4 mr-2" /> View Document
                        </Button>
                      )
                    )}
                  </div>

                  <div className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Proof of Address</span>
                      {selectedProvider.proofOfAddress ? (
                         <Badge className="bg-green-100 text-green-800">Uploaded</Badge>
                      ) : (
                         <Badge variant="outline" className="text-yellow-600 border-yellow-200">Missing</Badge>
                      )}
                    </div>
                    {selectedProvider.proofOfAddress && (
                       selectedProvider.proofOfAddress.startsWith('data:image') ? (
                        <div className="mt-2">
                          <img src={selectedProvider.proofOfAddress} alt="Proof of Address" className="max-h-40 rounded border" />
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" className="w-full mt-2" onClick={() => window.open(selectedProvider.proofOfAddress, '_blank')}>
                          <Eye className="h-4 w-4 mr-2" /> View Document
                        </Button>
                      )
                    )}
                  </div>

                  <div className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Qualification / Certificate</span>
                      {selectedProvider.qualificationCertificate ? (
                         <Badge className="bg-green-100 text-green-800">Uploaded</Badge>
                      ) : (
                         <Badge variant="outline" className="text-yellow-600 border-yellow-200">Missing</Badge>
                      )}
                    </div>
                    {selectedProvider.qualificationCertificate && (
                       selectedProvider.qualificationCertificate.startsWith('data:image') ? (
                        <div className="mt-2">
                          <img src={selectedProvider.qualificationCertificate} alt="Certificate" className="max-h-40 rounded border" />
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" className="w-full mt-2" onClick={() => window.open(selectedProvider.qualificationCertificate, '_blank')}>
                          <Eye className="h-4 w-4 mr-2" /> View Document
                        </Button>
                      )
                    )}
                  </div>
                  
                  <div className="pt-4 border-t">
                     <h4 className="font-medium mb-2">Banking Details</h4>
                     {selectedProvider.bankingDetails ? (
                       <div className="text-sm space-y-1">
                         <div className="grid grid-cols-2">
                           <span className="text-gray-500">Bank:</span>
                           <span>{selectedProvider.bankingDetails.bankName}</span>
                         </div>
                         <div className="grid grid-cols-2">
                           <span className="text-gray-500">Account Type:</span>
                           <span>{selectedProvider.bankingDetails.accountType}</span>
                         </div>
                         <div className="grid grid-cols-2">
                           <span className="text-gray-500">Account Number:</span>
                           <span>{selectedProvider.bankingDetails.accountNumber}</span>
                         </div>
                         <div className="grid grid-cols-2">
                           <span className="text-gray-500">Branch Code:</span>
                           <span>{selectedProvider.bankingDetails.branchCode}</span>
                         </div>
                       </div>
                     ) : (
                       <div className="text-sm text-gray-500 italic">No banking details provided</div>
                     )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setSelectedProvider(null)}>Close</Button>
            {selectedProvider && normalizeStatus(selectedProvider) === 'PENDING' && (
              <>
                <Button 
                  variant="destructive" 
                  onClick={() => { 
                    handleDecline(selectedProvider.id);
                    setSelectedProvider(null);
                  }}
                >
                  Decline Application
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => { 
                    handleApprove(selectedProvider.id);
                    setSelectedProvider(null);
                  }}
                >
                  Approve Application
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Main Content Tabs */}
        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
            <TabsTrigger value="providers" data-testid="tab-providers">Providers</TabsTrigger>
            <TabsTrigger value="bookings" data-testid="tab-bookings">Bookings</TabsTrigger>
            <TabsTrigger value="communications" data-testid="tab-communications">Communications</TabsTrigger>
            <TabsTrigger value="services" data-testid="tab-services">Services</TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <div className="mb-2 flex justify-between items-center">
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                    Revenue & Bookings Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Line
                      data={{
                        labels: Array.from({ length: 12 }, (_, i) => format(subDays(new Date(), 30 - i * 3), 'LLL dd')),
                        datasets: [
                          {
                            label: 'Revenue (R)',
                            data: Array.from({ length: 12 }, () => Math.floor(Math.random() * 10000) + 5000),
                            borderColor: '#44062D',
                            backgroundColor: 'rgba(68, 6, 45, 0.1)',
                            tension: 0.3,
                            fill: true
                          },
                          {
                            label: 'Bookings',
                            data: Array.from({ length: 12 }, () => Math.floor(Math.random() * 100) + 20),
                            borderColor: '#C56B86',
                            backgroundColor: 'rgba(197, 107, 134, 0.1)',
                            tension: 0.3,
                            fill: true
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom'
                          }
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2 text-purple-600" />
                    Booking Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Doughnut
                      data={{
                        labels: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
                        datasets: [{
                          data: [30, 45, 20, 5],
                          backgroundColor: ['#F59E0B', '#10B981', '#3B82F6', '#EF4444'],
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                    Top Services by Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Bar
                      data={{
                        labels: ['House Cleaning', 'Plumbing', 'Electrical', 'Garden Care', 'Chef Services'],
                        datasets: [{
                          label: 'Revenue (R)',
                          data: [12500, 9800, 8500, 7800, 7200],
                          backgroundColor: '#44062D'
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false
                          }
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="p-6">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center">
                    <Award className="h-5 w-5 mr-2 text-green-600" />
                    Top Performing Providers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: "John M.", jobs: 42, rating: 4.8, earnings: 12500 },
                      { name: "Sarah K.", jobs: 38, rating: 4.7, earnings: 11800 },
                      { name: "Mike T.", jobs: 35, rating: 4.6, earnings: 10900 }
                    ].map((provider, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div>
                          <p className="font-medium text-gray-900">{provider.name}</p>
                          <p className="text-xs text-gray-500">{provider.jobs} jobs · {provider.rating}★</p>
                        </div>
                        <div className="text-sm font-semibold text-[#44062D]">R{provider.earnings}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

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
          </TabsContent>

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
                  {(() => {
                    const providerUserIds = new Set(
                      (providers || [])
                        .map((p: any) => (p?.user?.id || p?.userId) as string)
                        .filter((id: any) => typeof id === "string" && id.length > 0)
                    );
                    const providerEmails = new Set(
                      (providers || [])
                        .map((p: any) => (p?.email || p?.userEmail || "") as string)
                        .map((e: string) => e ? e.toLowerCase() : "")
                        .filter((e) => e.length > 0)
                    );
                    const customersOnly = (users || []).filter((u) => {
                      const byUserId = providerUserIds.has(u.id);
                      const byEmail = providerEmails.has((u.email || "").toLowerCase());
                      const role = String((u as any).role || "").toLowerCase();
                      const type = String((u as any).type || "").toLowerCase();
                      const isProviderFlag = u.isProvider === true || role === "provider" || type === "provider";
                      return !byUserId && !byEmail && !isProviderFlag;
                    });
                    return (
                      <>
                        {isDebug && (
                          <div className="rounded-md border p-3 text-xs space-y-2">
                            <div>URL: /api/admin/users</div>
                            <div>Users loaded: {Array.isArray(users) ? users.length : 0}</div>
                            <div>CustomersOnly: {customersOnly.length}</div>
                            <div>First user keys: {Array.isArray(users) && users.length > 0 ? Object.keys(users[0] as any).join(', ') : 'none'}</div>
                          </div>
                        )}
                        {isDebug && Array.isArray(users) && users.length > 0 && (() => {
                          try {
                            users.forEach((u) => {
                              const byUserId = providerUserIds.has(u.id);
                              const byEmail = providerEmails.has((u.email || "").toLowerCase());
                              const role = String((u as any).role || "").toLowerCase();
                              const type = String((u as any).type || "").toLowerCase();
                              const isProviderFlag = u.isProvider === true || role === "provider" || type === "provider";
                              if (byUserId || byEmail || isProviderFlag) {
                                console.log('🚫 Filtering out provider:', u.email);
                              }
                            });
                            console.log('Provider IDs:', Array.from(providerUserIds));
                          } catch {}
                        })()}
                        {customersOnly.map((user) => (
                          <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`user-${user.id}`}>
                            <div>
                              <p className="font-medium">{user.firstName} {user.lastName}</p>
                              <p className="text-sm text-gray-600">{user.email}</p>
                              <p className="text-xs text-gray-500">
                                Customer | {user.isVerified ? ' Verified' : ' Unverified'}
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
                      </>
                    );
                  })()}
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

                {isDebug && (
                  <div className="rounded-md border p-3 text-xs space-y-2">
                    <div>URL: /api/admin/providers</div>
                    <div>Status: {providersStatusCode ?? 'n/a'}</div>
                    <div>Providers loaded: {Array.isArray(providers) ? providers.length : 0}</div>
                    <div>First provider keys: {Array.isArray(providers) && providers.length > 0 ? Object.keys(providers[0] as any).join(', ') : 'none'}</div>
                    {Array.isArray(providers) && providers.length > 0 && (
                      <div>First provider: {(providers[0] as any).firstName}, {(providers[0] as any).email}, {(providers[0] as any).phone}</div>
                    )}
                    <pre className="bg-gray-100 p-2 rounded overflow-x-auto">{providersFirstObj ? JSON.stringify(providersFirstObj, null, 2) : 'no provider object'}</pre>
                  </div>
                )}

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
                          const providerName = getDisplayName(provider);
                          const email = getEmail(provider);
                          const phone = getPhone(provider);
                          const services = getServiceType(provider);
                          const dateStr = getDateSubmitted(provider);
                          const statusUpper = normalizeStatus(provider);
                          const providerId = provider.id;
                          return (
                            <div
                              key={provider.id}
                              className="grid grid-cols-7 gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer"
                              onClick={() => setSelectedProvider(provider)}
                              data-testid={`provider-${provider.id}`}
                            >
                              <div className="font-medium text-gray-900">{providerName || 'Not provided'}</div>
                              <div className="text-gray-700">{email}</div>
                              <div className="text-gray-700">{phone}</div>
                              <div className="text-gray-700">{services}</div>
                              <div>
                                {statusUpper === 'PENDING' && (
                                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
                                )}
                                {statusUpper === 'APPROVED' && (
                                  <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">Approved</Badge>
                                )}
                                {statusUpper === 'REJECTED' && (
                                  <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">Declined</Badge>
                                )}
                                {!statusUpper && (
                                  <span className="text-gray-700">Not provided</span>
                                )}
                              </div>
                            <div className="text-gray-700">{dateStr}</div>
                            <div className="flex items-center space-x-2">
                              {/* Document View Button */}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedProvider(provider);
                                }}
                                data-testid={`view-docs-${provider.id}`}
                              >
                                View Details & Docs
                              </Button>
                              
                              {statusUpper === 'PENDING' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={(e) => { e.stopPropagation(); handleApprove(providerId); }}
                                    className="bg-green-600 hover:bg-green-700"
                                    data-testid={`approve-${provider.id}`}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={(e) => { e.stopPropagation(); handleDecline(providerId); }}
                                    data-testid={`decline-${provider.id}`}
                                  >
                                    Decline
                                  </Button>
                                </>
                              )}
                              {statusUpper === 'APPROVED' && (
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
                      <Button 
                        className="mt-2" 
                        size="sm" 
                        data-testid="button-platform-settings"
                        onClick={() => {
                          try {
                            const raw = localStorage.getItem('platformSettings');
                            const parsed = raw ? JSON.parse(raw) : {};
                            setBerryStarsEnabledTemp(parsed.berryStarsEnabled !== false);
                          } catch {
                            setBerryStarsEnabledTemp(true);
                          }
                          setIsPlatformConfigureOpen(true);
                        }}
                      >
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

          {isPlatformConfigureOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md mx-4">
                <CardHeader>
                  <CardTitle>Configure Platform Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Berry Stars</Label>
                      <p className="text-xs text-gray-600">Enable / Disable Berry Stars section on homepage</p>
                    </div>
                    <Switch
                      checked={berryStarsEnabledTemp}
                      onCheckedChange={(v) => setBerryStarsEnabledTemp(!!v)}
                      data-testid="switch-berry-stars"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => {
                        try {
                          const raw = localStorage.getItem('platformSettings');
                          const parsed = raw ? JSON.parse(raw) : {};
                          const next = { ...parsed, berryStarsEnabled: berryStarsEnabledTemp };
                          localStorage.setItem('platformSettings', JSON.stringify(next));
                          toast({ title: "Platform settings saved" });
                        } catch {}
                        setIsPlatformConfigureOpen(false);
                      }}
                      data-testid="button-save-platform-settings"
                    >
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsPlatformConfigureOpen(false)}
                      data-testid="button-cancel-platform-settings"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Services Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-gray-600">Enable/disable services and edit pricing/add-ons</p>
                  <Button size="sm" onClick={() => setEditingServiceId("__new__")} data-testid="button-add-service">Add New Service</Button>
                </div>
                <div className="overflow-x-auto">
                  <div className="min-w-[900px]">
                    <div className="grid grid-cols-6 gap-4 px-4 py-2 text-xs font-semibold text-gray-600">
                      <div>Service</div>
                      <div>Enabled</div>
                      <div>Hourly Rate</div>
                      <div>Add-ons</div>
                      <div>Min Hours</div>
                      <div>Actions</div>
                    </div>
                    <div className="divide-y">
                      {Object.entries(serviceConfigs).map(([id, cfg]) => {
                        const override = serviceOverrides[id] || {};
                        const enabled = override.enabled !== undefined ? override.enabled : (cfg.enabled !== false);
                        const hourly = override.basePrice ?? cfg.basePrice;
                        const minHours = override.minHours ?? cfg.minHours ?? 1;
                        const addonsCount = (override.addOns ?? cfg.addOns ?? []).length;
                        return (
                          <div key={id} className="grid grid-cols-6 gap-4 px-4 py-3 items-center">
                            <div className="font-medium text-gray-900">{cfg.title}</div>
                            <div>
                              <Switch
                                checked={enabled}
                                onCheckedChange={(val) => {
                                  const next = { ...serviceOverrides, [id]: { ...override, enabled: !!val } };
                                  saveOverrides(next);
                                }}
                                data-testid={`toggle-${id}`}
                              />
                            </div>
                            <div>
                              <Input
                                type="number"
                                value={hourly}
                                onChange={(e) => {
                                  const next = { ...serviceOverrides, [id]: { ...override, basePrice: Number(e.target.value) } };
                                  setServiceOverrides(next);
                                }}
                                onBlur={() => saveOverrides(serviceOverrides)}
                                className="w-28"
                                data-testid={`input-hourly-${id}`}
                              />
                            </div>
                            <div>{addonsCount}</div>
                            <div>
                              <Input
                                type="number"
                                value={minHours}
                                onChange={(e) => {
                                  const next = { ...serviceOverrides, [id]: { ...override, minHours: Number(e.target.value) } };
                                  setServiceOverrides(next);
                                }}
                                onBlur={() => saveOverrides(serviceOverrides)}
                                className="w-20"
                                data-testid={`input-minhours-${id}`}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline" onClick={() => setEditingServiceId(id)} data-testid={`edit-${id}`}>Edit</Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {editingServiceId && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <Card className="w-full max-w-2xl mx-4">
                  <CardHeader>
                    <CardTitle>{editingServiceId === "__new__" ? "Add New Service" : `Edit Service: ${serviceConfigs[editingServiceId]?.title || editingServiceId}`}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {editingServiceId === "__new__" ? (
                      <>
                        <div>
                          <Label htmlFor="new-id">Service ID</Label>
                          <Input id="new-id" value={newServiceForm.id} onChange={(e) => setNewServiceForm({ ...newServiceForm, id: e.target.value })} />
                        </div>
                        <div>
                          <Label htmlFor="new-title">Title</Label>
                          <Input id="new-title" value={newServiceForm.title} onChange={(e) => setNewServiceForm({ ...newServiceForm, title: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="new-price">Base Price</Label>
                            <Input id="new-price" type="number" value={newServiceForm.basePrice} onChange={(e) => setNewServiceForm({ ...newServiceForm, basePrice: Number(e.target.value) })} />
                          </div>
                          <div>
                            <Label htmlFor="new-steps">Booking Steps</Label>
                            <Input id="new-steps" type="number" value={newServiceForm.steps} onChange={(e) => setNewServiceForm({ ...newServiceForm, steps: Number(e.target.value) })} />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="new-desc">Description</Label>
                          <Input id="new-desc" value={newServiceForm.description || ""} onChange={(e) => setNewServiceForm({ ...newServiceForm, description: e.target.value })} />
                        </div>
                      </>
                    ) : (
                      <>
                        {(() => {
                          const id = editingServiceId as string;
                          const override = serviceOverrides[id] || {};
                          const cfg = serviceConfigs[id];
                          const title = override.title ?? cfg?.title ?? id;
                          const basePrice = override.basePrice ?? cfg?.basePrice ?? 0;
                          const description = override.description ?? cfg?.description ?? "";
                          const addOns = override.addOns ?? cfg?.addOns ?? [];
                          return (
                            <>
                              <div>
                                <Label htmlFor="edit-title">Title</Label>
                                <Input id="edit-title" value={title} onChange={(e) => setServiceOverrides({ ...serviceOverrides, [id]: { ...override, title: e.target.value } })} onBlur={() => saveOverrides(serviceOverrides)} />
                              </div>
                              <div>
                                <Label htmlFor="edit-desc">Description</Label>
                                <Input id="edit-desc" value={description} onChange={(e) => setServiceOverrides({ ...serviceOverrides, [id]: { ...override, description: e.target.value } })} onBlur={() => saveOverrides(serviceOverrides)} />
                              </div>
                              <div>
                                <Label htmlFor="edit-price">Base Price</Label>
                                <Input id="edit-price" type="number" value={basePrice} onChange={(e) => setServiceOverrides({ ...serviceOverrides, [id]: { ...override, basePrice: Number(e.target.value) } })} onBlur={() => saveOverrides(serviceOverrides)} />
                              </div>
                              <div>
                                <Label>Add-ons (JSON)</Label>
                                <textarea
                                  className="w-full border rounded-md p-2 text-sm"
                                  rows={5}
                                  value={JSON.stringify(addOns, null, 2)}
                                  onChange={(e) => {
                                    try {
                                      const parsed = JSON.parse(e.target.value);
                                      setServiceOverrides({ ...serviceOverrides, [id]: { ...override, addOns: parsed } });
                                    } catch {}
                                  }}
                                  onBlur={() => saveOverrides(serviceOverrides)}
                                />
                              </div>
                            </>
                          );
                        })()}
                      </>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => {
                          if (editingServiceId === "__new__") {
                            if (!newServiceForm.id) {
                              toast({ title: "Service ID required", variant: "destructive" });
                              return;
                            }
                            const next = { ...serviceOverrides, [newServiceForm.id]: { ...newServiceForm } };
                            saveOverrides(next);
                          } else {
                            saveOverrides(serviceOverrides);
                          }
                          setEditingServiceId(null);
                        }}
                        data-testid="button-save-service"
                      >Save</Button>
                      <Button variant="outline" onClick={() => { setEditingServiceId(null); }} data-testid="button-cancel-service">Cancel</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
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
                  {normalizeStatus(selectedProvider) === 'PENDING' && (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
                  )}
                  {normalizeStatus(selectedProvider) === 'APPROVED' && (
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">Approved</Badge>
                  )}
                  {normalizeStatus(selectedProvider) === 'REJECTED' && (
                    <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">Declined</Badge>
                  )}
                </div>
                <Button variant="outline" onClick={() => setSelectedProvider(null)}>Close</Button>
              </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700">Personal Information</h3>
                    <div className="mt-2 space-y-1 text-sm text-gray-800">
                      <div>Full Name: {getDisplayName(selectedProvider)}</div>
                      <div>Email Address: {getEmail(selectedProvider)}</div>
                      <div>Phone Number: {getPhone(selectedProvider)}</div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700">Business Information</h3>
                    <div className="mt-2 space-y-1 text-sm text-gray-800">
                    <div>Business Name: {(selectedProvider as any).companyName || 'Individual'}</div>
                    <div>Service Type / Category: {getServiceType(selectedProvider)}</div>
                    <div>Business Description: {(selectedProvider as any).bio || 'Not provided'}</div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">Service Details</h3>
                  <div className="mt-2 space-y-1 text-sm text-gray-800">
                    <div>Services Offered: {Array.isArray((selectedProvider as any)?.servicesOffered) ? (selectedProvider as any).servicesOffered.join(', ') : (selectedProvider as any)?.servicesOffered || 'Not provided'}</div>
                    <div>Service Areas / Locations: {(selectedProvider as any).location || 'Not provided'}</div>
                    <div>Pricing Information: {(selectedProvider as any).hourlyRate ? `R${(selectedProvider as any).hourlyRate}` : 'Not provided'}</div>
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
                  <div>Date Applied: {(selectedProvider as any).createdAt ? format(new Date((selectedProvider as any).createdAt), 'LLL dd, yyyy') : 'Not provided'}</div>
                  <div>Current Status: {normalizeStatus(selectedProvider) || 'Not provided'}</div>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                {normalizeStatus(selectedProvider) === 'PENDING' && (
                  <>
                    <Button
                      onClick={() => handleApprove(selectedProvider.id)}
                      className="bg-green-600 hover:bg-green-700"
                      data-testid={`approve-detail-${selectedProvider.id}`}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDecline(selectedProvider.id)}
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
