import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { lazy, Suspense } from "react";
const TrainingCenter = lazy(() => import("@/components/training-center"));
const ProviderLiveTracking = lazy(() => import("@/components/provider-live-tracking"));
import { ChatDialog } from "@/components/chat-dialog";
import { 
  User,
  Calendar,
  Banknote,
  Star,
  TrendingUp,
  Settings,
  Bell,
  Award,
  GraduationCap,
  Shield,
  BarChart3,
  MapPin,
  Clock,
  Navigation,
  MessageCircle
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import berryLogo from "@assets/berry-logo.png";

interface ProviderPortalProps {
  providerId: string;
  providerType: 'individual' | 'company';
  isAdmin?: boolean;
}

interface ProviderData {
  id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  userId?: string;
  rating?: number;
  servicesOffered?: string[];
  profileImage?: string;
  idDocument?: string;
  qualificationCertificate?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface SocialScoreData {
  score: number;
  queueBonus: number;
  trainingBonus: number;
  tier: string;
}

interface EarningsData {
  totalEarnings: number;
  pendingPayouts: number;
  completedJobs: number;
}

export default function ProviderPortal({ 
  providerId, 
  providerType = 'individual',
  isAdmin = false 
}: ProviderPortalProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [chatBooking, setChatBooking] = useState<any>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: providerData, isLoading } = useQuery<ProviderData>({
    queryKey: [`/api/providers/${providerId}`],
    retry: false,
  });

  const { data: bookings = [] } = useQuery<any[]>({
    queryKey: [`/api/providers/${providerId}/bookings?status=pending-provider,accepted`],
    retry: false,
  });

  const { data: pastBookings = [] } = useQuery<any[]>({
    queryKey: [`/api/providers/${providerId}/bookings?status=declined,completed,cancelled`],
    retry: false,
  });


  const { data: earnings } = useQuery<EarningsData>({
    queryKey: [`/api/providers/${providerId}/earnings`],
    retry: false,
  });

  const { data: socialScore } = useQuery<SocialScoreData>({
    queryKey: [`/api/providers/${providerId}/social-score`],
    retry: false,
  });

  const { data: referral } = useQuery<{ code: string}>({
    queryKey: [`/api/providers/${providerId}/referral-code`],
    retry: false,
  });

  // Provide safe defaults for data
  const provider: ProviderData = providerData || { name: 'Service Provider', firstName: 'Service', lastName: 'Provider' };
  const providerEarnings: EarningsData = earnings || { totalEarnings: 0, pendingPayouts: 0, completedJobs: 0 };
  const score: SocialScoreData = socialScore || { score: 0, queueBonus: 0, trainingBonus: 0, tier: 'Bronze' };
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const pastStatuses = new Set(["declined","completed","cancelled"]);
  const getDateTime = (b: any) => {
    const d = new Date(b?.scheduledDate);
    const t = (b?.scheduledTime || '').trim();
    if (t && !isNaN(d.getTime())) {
      const parts = t.split(":");
      const hh = parseInt(parts[0] || "0", 10);
      const mm = parseInt(parts[1] || "0", 10);
      d.setHours(hh, mm, 0, 0);
    }
    return d;
  };
  const activeBookingsDisplay = (bookings || []).filter((b: any) => {
    const dt = getDateTime(b);
    return !isNaN(dt.getTime()) && dt >= now && !pastStatuses.has(b?.status);
  });
  const pastBookingsDisplay = [
    ...(pastBookings || []),
    ...(bookings || []).filter((b: any) => {
      const dt = getDateTime(b);
      if (isNaN(dt.getTime())) return pastStatuses.has(b?.status);
      return dt < now || pastStatuses.has(b?.status);
    })
  ];
  const weeklyBookingsCount = [...activeBookingsDisplay, ...pastBookingsDisplay].filter((b: any) => {
    const d = new Date(b?.scheduledDate);
    return !isNaN(d.getTime()) && d >= sevenDaysAgo;
  }).length;
  const providerRating = provider.rating ? Number(provider.rating) : 0;
  const profileImageSrcRaw = (provider as any)?.profileImageUrl || (provider as any)?.profileImage || (provider as any)?.avatarUrl || (provider as any)?.photoUrl || (user as any)?.profileImage || '';
  const imageVersionRaw = provider.updatedAt || provider.createdAt || (user as any)?.updatedAt || '';
  const profileImageSrc = typeof profileImageSrcRaw === 'string' ? profileImageSrcRaw : '';
  const ver = imageVersionRaw ? new Date(imageVersionRaw as any).getTime() : Date.now();
  const srcWithVer = profileImageSrc ? `${profileImageSrc}${profileImageSrc.includes('?') ? '&' : '?'}v=${ver}` : '';
  const successfulStatuses = new Set(["completed","fulfilled"]);
  const failedStatuses = new Set(["declined","cancelled","failed"]);
  const isPast = (b: any) => {
    const dt = getDateTime(b);
    return !isNaN(dt.getTime()) && dt < now;
  };
  const allProviderBookings = [...(bookings || []), ...(pastBookings || [])];
  const eligibleRaw = allProviderBookings.filter((b: any) => {
    const status = String(b.status || '').toLowerCase();
    if (failedStatuses.has(status)) return false;
    const fulfilled = successfulStatuses.has(status);
    const past = isPast(b);
    const rawAmt = (b as any).totalAmount ?? (b as any).totalPrice ?? 0;
    const amt = typeof rawAmt === 'string' ? parseFloat(rawAmt) : Number(rawAmt) || 0;
    return (past || fulfilled) && amt > 0;
  });
  const seenIds = new Set<string>();
  const eligibleForEarnings = eligibleRaw.filter((b: any) => {
    const id = String(b.id || '');
    if (!id || seenIds.has(id)) return false;
    seenIds.add(id);
    return true;
  });
  const computedTotalEarnings = Math.round(eligibleForEarnings.reduce((sum: number, b: any) => {
    const raw = (b as any).totalAmount ?? (b as any).totalPrice ?? 0;
    const amt = typeof raw === 'string' ? parseFloat(raw) : Number(raw) || 0;
    return sum + (amt * 0.85);
  }, 0) * 100) / 100;
  const computedCompletedJobs = eligibleForEarnings.length;
  const computedPendingPayouts = Math.round(eligibleForEarnings.filter((b: any) => String((b as any).paymentStatus) !== 'paid').reduce((sum: number, b: any) => {
    const raw = (b as any).totalAmount ?? (b as any).totalPrice ?? 0;
    const amt = typeof raw === 'string' ? parseFloat(raw) : Number(raw) || 0;
    return sum + (amt * 0.85);
  }, 0) * 100) / 100;

  const formatRelativeDate = (d: Date) => {
    const today = new Date();
    const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    if (dateOnly.getTime() === new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) return 'Today';
    if (dateOnly.getTime() === yesterday.getTime()) return 'Yesterday';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const { data: reviewsData } = useQuery<any>({
    queryKey: [`/api/providers/${providerId}/customer-reviews?page=1&limit=10`],
    retry: false,
  });
  const providerReviews = Array.isArray(reviewsData?.reviews) ? reviewsData.reviews : ([] as any[]);
  const reviewsCount = providerReviews.length;
  const reviewsAverage = reviewsCount > 0 ? Math.round((providerReviews.reduce((sum: number, r: any) => sum + (Number(r.rating) || 0), 0) / reviewsCount) * 10) / 10 : 0;
  const recentEvents = (
    [
      ...allProviderBookings
        .filter((b: any) => String(b.status) === 'accepted')
        .map((b: any) => ({ type: 'Booking accepted', ts: new Date(b.updatedAt || b.createdAt || b.scheduledDate), id: b.id })),
      ...allProviderBookings
        .filter((b: any) => String(b.status) === 'completed')
        .map((b: any) => ({ type: 'Booking completed', ts: new Date(b.updatedAt || b.createdAt || b.scheduledDate), id: b.id })),
      ...eligibleForEarnings.map((b: any) => ({ type: 'Earnings updated', ts: new Date(b.updatedAt || b.createdAt || b.scheduledDate), id: b.id })),
      ...providerReviews.map((r: any) => ({ type: 'Rating received', ts: new Date(r.createdAt), id: r.id })),
    ] as { type: string; ts: Date; id: string }[]
  )
    .filter((e) => !isNaN(e.ts.getTime()))
    .sort((a, b) => b.ts.getTime() - a.ts.getTime())
    .slice(0, 6);
  const formatDate = (d: Date) => {
    try {
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return d.toISOString().slice(0, 10);
    }
  };
  const documents: { name: string; url: string }[] = [
    ...((provider as any)?.idDocument ? [{ name: "ID Document", url: (provider as any).idDocument }] : []),
    ...((provider as any)?.qualificationCertificate ? [{ name: "Qualification Certificate", url: (provider as any).qualificationCertificate }] : [])
  ];

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            {srcWithVer ? (
              <AvatarImage src={srcWithVer} alt="Profile" />
            ) : null}
            <AvatarFallback className="bg-[#EED1C4]/40 text-[#44062D]">
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-[#44062D] tracking-tight">
              {isAdmin ? 'Admin Portal' : 'Service Provider Portal'}
            </h1>
            <p className="text-[#44062D]/70">
              {provider.name || `${provider.firstName || ''} ${provider.lastName || ''}`.trim() || 'Service Provider'} • {providerType === 'company' ? 'Company' : 'Individual'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Social Score Badge */}
          <Card className="bg-[#EED1C4]/40 border-[#EED1C4]/60">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-[#44062D]" />
                <div>
                  <div className="text-xs text-[#44062D]/70">Social Score</div>
                  <div className="font-bold text-[#44062D]">
                    {score.score}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#EED1C4]/40 border-[#EED1C4]/60">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <Award className="h-4 w-4 text-[#44062D]" />
                <div>
                  <div className="text-xs text-[#44062D]/70">Referral Code</div>
                  <div className="font-bold text-[#44062D]">
                    {referral?.code || '----'}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => referral?.code && navigator.clipboard.writeText(referral.code)}
                  data-testid="button-copy-referral"
                >
                  Copy
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>


      {/* Main Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          <TabsTrigger value="dashboard" className="py-2 text-sm">Dashboard</TabsTrigger>
          <TabsTrigger value="bookings" className="py-2 text-sm">Bookings</TabsTrigger>
          <TabsTrigger value="past" className="py-2 text-sm">Past Bookings</TabsTrigger>
          <TabsTrigger value="tracking" className="py-2 text-sm">
            <Navigation className="h-4 w-4 mr-2" />
            Live Tracking
          </TabsTrigger>
          <TabsTrigger value="earnings" className="py-2 text-sm">Earnings</TabsTrigger>
          <TabsTrigger value="training" className="py-2 text-sm">
            <GraduationCap className="h-4 w-4 mr-2" />
            Training Center
          </TabsTrigger>
          <TabsTrigger value="profile" className="py-2 text-sm">Profile</TabsTrigger>
          <TabsTrigger value="settings" className="py-2 text-sm">Settings</TabsTrigger>
        </TabsList>

        {/* Dashboard */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-[#EED1C4]/60">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-[#44062D]" />
                  <div>
                    <div className="text-sm text-[#44062D]/70">This Week</div>
                    <div className="text-xl font-bold">{weeklyBookingsCount} Bookings</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#EED1C4]/60">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Banknote className="h-5 w-5 text-[#44062D]" />
                  <div>
                    <div className="text-sm text-[#44062D]/70">Earnings (ZAR)</div>
                    <div className="text-xl font-bold">R{computedTotalEarnings.toFixed(2)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#EED1C4]/60">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-[#44062D]" />
                  <div>
                    <div className="text-sm text-[#44062D]/70">Rating</div>
                    <div className="text-xl font-bold">{reviewsCount > 0 ? reviewsAverage.toFixed(1) : 'N/A'}</div>
                    <div className="text-xs text-[#44062D]/70">{reviewsCount} review{reviewsCount === 1 ? '' : 's'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#EED1C4]/60">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-[#44062D]" />
                  <div>
                    <div className="text-sm text-[#44062D]/70">Queue Priority</div>
                    <div className="text-xl font-bold text-[#44062D]">
                      +{score.queueBonus}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-[#EED1C4]/60">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {recentEvents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>No recent activity</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentEvents.map((ev) => (
                      <div key={ev.type + ev.id} className="flex items-center justify-between p-3 bg-[#EED1C4]/20 rounded">
                        <div className="font-medium text-[#44062D]">{ev.type}</div>
                        <div className="text-xs text-[#44062D]/70">{formatRelativeDate(ev.ts)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-[#EED1C4]/60">
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {providerReviews.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Star className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>No reviews yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {providerReviews.slice(0, 5).map((rev: any) => (
                      <div key={rev.id} className="p-3 border rounded">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-[#44062D]">
                            <Star className="h-4 w-4" />
                            <span className="font-semibold">{Number(rev.rating).toFixed(1)}</span>
                          </div>
                          <div className="text-xs text-[#44062D]/70">{formatRelativeDate(new Date(rev.createdAt))}</div>
                        </div>
                        <div className="text-sm text-[#44062D]/80 mt-1">
                          {rev.customer ? `${rev.customer.firstName} ${rev.customer.lastName}` : 'Customer'}
                        </div>
                        {rev.comment && (
                          <div className="text-sm text-[#44062D]/70 mt-1">{rev.comment}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Training Impact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Training Impact on Your Business
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-[#EED1C4]/30 rounded-lg">
                  <Shield className="h-8 w-8 text-[#44062D] mx-auto mb-2" />
                  <div className="text-2xl font-bold text-[#44062D]">+{score.trainingBonus}</div>
                  <div className="text-sm text-[#44062D]/70">Social Score Bonus</div>
                  <div className="text-xs text-[#44062D]/60 mt-1">From completed training</div>
                </div>
                
                <div className="text-center p-4 bg-[#EED1C4]/30 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-[#44062D] mx-auto mb-2" />
                  <div className="text-2xl font-bold text-[#44062D]">+{score.queueBonus}%</div>
                  <div className="text-sm text-[#44062D]/70">Queue Priority</div>
                  <div className="text-xs text-[#44062D]/60 mt-1">Higher booking chances</div>
                </div>
                
                <div className="text-center p-4 bg-[#EED1C4]/30 rounded-lg">
                  <Award className="h-8 w-8 text-[#44062D] mx-auto mb-2" />
                  <div className="text-2xl font-bold text-[#44062D]">{score.tier}</div>
                  <div className="text-sm text-[#44062D]/70">Provider Tier</div>
                  <div className="text-xs text-[#44062D]/60 mt-1">Based on training & performance</div>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-[#EED1C4]/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-[#44062D]">Continue Your Training Journey</h4>
                    <p className="text-sm text-[#44062D]/70">Complete more modules to boost your social score and earnings</p>
                  </div>
                  <Button onClick={() => setActiveTab('training')}>
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Open Training Center
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          
        </TabsContent>

        {/* Live Tracking */}
        <TabsContent value="tracking" className="space-y-6">
          <Suspense fallback={<div className="p-4">Loading live tracking...</div>}>
            <ProviderLiveTracking providerId={providerId} />
          </Suspense>
        </TabsContent>

        {/* Training Center */}
        <TabsContent value="training" className="space-y-6">
          <Suspense fallback={<div className="p-4">Loading training center...</div>}>
            <TrainingCenter 
              providerId={providerId}
              providerType={providerType}
              isAdmin={isAdmin}
            />
          </Suspense>
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {activeBookingsDisplay.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No bookings yet</p>
                  <p className="text-sm mt-1">Your confirmed bookings will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeBookingsDisplay.map((booking: any) => (
                    <div key={booking.id} className="border rounded-lg p-4 hover:bg-[#EED1C4]/20 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{booking.serviceType}</h3>
                          <p className="text-sm text-[#44062D]/70">Booking {(booking.bookingNumber || '').replace(/-\d+$/, '') || booking.bookingNumber}</p>
                        </div>
                        <Badge 
                          className={'bg-[#EED1C4]/40 text-[#44062D]'}
                        >
                          {booking.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                        <div className="flex items-center text-[#44062D]/70">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDate(new Date(booking.scheduledDate))}
                        </div>
                        <div className="flex items-center text-[#44062D]/70">
                          <Clock className="h-4 w-4 mr-2" />
                          {booking.scheduledTime}
                        </div>
                        <div className="flex items-center text-[#44062D]/70">
                          <MapPin className="h-4 w-4 mr-2" />
                          {booking.address}
                        </div>
                        <div className="flex items-center text-[#44062D]/70">
                          <User className="h-4 w-4 mr-2" />
                          {booking.customerName || 'Customer'}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="text-lg font-semibold text-[#44062D]">
                          R{parseFloat(booking.totalPrice || '0').toFixed(2)}
                        </div>
                        <div className="flex items-center gap-2">
                          {booking.status === 'pending-provider' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    await fetch(`/api/bookings/${booking.id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'accepted' }) });
                                    await apiRequest('POST', '/api/conversations', { bookingId: booking.id, customerId: booking.customerId, providerId });
                                    setChatBooking({
                                      id: booking.id,
                                      bookingNumber: booking.bookingNumber,
                                      customerId: booking.customerId,
                                      providerId: providerId,
                                      customerName: booking.customerName || 'Customer',
                                      providerName: providerData?.firstName && providerData?.lastName ? `${providerData.firstName} ${providerData.lastName}` : 'Provider'
                                    });
                                  } finally {
                                    queryClient.invalidateQueries({ queryKey: [`/api/providers/${providerId}/bookings?status=pending-provider,accepted`] });
                                  }
                                }}
                                data-testid={`button-accept-${booking.id}`}
                              >
                                Accept
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    await fetch(`/api/bookings/${booking.id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'declined' }) });
                                  } finally {
                                    queryClient.invalidateQueries({ queryKey: [`/api/providers/${providerId}/bookings?status=pending-provider,accepted`] });
                                    queryClient.invalidateQueries({ queryKey: [`/api/providers/${providerId}/bookings?status=declined,completed,cancelled`] });
                                  }
                                }}
                                data-testid={`button-decline-${booking.id}`}
                              >
                                Decline
                              </Button>
                            </>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setChatBooking({
                              id: booking.id,
                              bookingNumber: booking.bookingNumber,
                              customerId: booking.customerId,
                              providerId: providerId,
                              customerName: booking.customerName || 'Customer',
                              providerName: providerData?.firstName && providerData?.lastName 
                                ? `${providerData.firstName} ${providerData.lastName}`
                                : 'Provider'
                            })}
                            data-testid={`button-chat-${booking.id}`}
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Chat with Customer
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Past Bookings Tab */}
        <TabsContent value="past" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Past Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {pastBookingsDisplay.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No past bookings</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pastBookingsDisplay.map((booking: any) => (
                    <div key={booking.id} className="border rounded-lg p-4 hover:bg-[#EED1C4]/20 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{booking.serviceType}</h3>
                          <p className="text-sm text-[#44062D]/70">Booking {booking.bookingNumber || `#${booking.id.slice(0, 8)}`}</p>
                        </div>
                        <Badge className={'bg-[#EED1C4]/40 text-[#44062D]'}>{booking.status}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                        <div className="flex items-center text-[#44062D]/70">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDate(new Date(booking.scheduledDate))}
                        </div>
                        <div className="flex items-center text-[#44062D]/70">
                          <Clock className="h-4 w-4 mr-2" />
                          {booking.scheduledTime}
                        </div>
                        <div className="flex items-center text-[#44062D]/70">
                          <MapPin className="h-4 w-4 mr-2" />
                          {booking.address}
                        </div>
                        <div className="flex items-center text-[#44062D]/70">
                          <User className="h-4 w-4 mr-2" />
                          {booking.customerName || 'Customer'}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="text-lg font-semibold text-[#44062D]">
                          R{parseFloat(booking.totalPrice || '0').toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Earnings & Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border">
                  <div className="text-sm text-[#44062D]/70">Total Earned</div>
                  <div className="text-2xl font-bold text-[#44062D]">R{computedTotalEarnings.toFixed(2)}</div>
                </div>
                <div className="p-4 rounded-lg border">
                  <div className="text-sm text-[#44062D]/70">Pending Payouts</div>
                  <div className="text-2xl font-bold text-[#44062D]">R{computedPendingPayouts.toFixed(2)}</div>
                </div>
                <div className="p-4 rounded-lg border">
                  <div className="text-sm text-[#44062D]/70">Completed Jobs</div>
                  <div className="text-2xl font-bold text-[#44062D]">{computedCompletedJobs}</div>
                </div>
              </div>
              {eligibleForEarnings.length === 0 ? (
                <div className="text-center py-6 text-gray-500">No qualifying past bookings</div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-[#44062D]/70">Name / Business</div>
                  <div className="text-sm font-medium text-[#44062D]">{provider.name || `${provider.firstName || ''} ${provider.lastName || ''}`.trim() || 'Not provided'}</div>
                </div>
                <div>
                  <div className="text-xs text-[#44062D]/70">Email</div>
                  <div className="text-sm font-medium text-[#44062D]">{provider.email || 'Not provided'}</div>
                </div>
                <div>
                  <div className="text-xs text-[#44062D]/70">Phone</div>
                  <div className="text-sm font-medium text-[#44062D]">{(provider as any).phone || 'Not provided'}</div>
                </div>
                <div>
                  <div className="text-xs text-[#44062D]/70">Service Categories</div>
                  <div className="text-sm font-medium text-[#44062D]">{provider.servicesOffered?.length ? provider.servicesOffered.join(', ') : 'Not provided'}</div>
                </div>
                <div>
                  <div className="text-xs text-[#44062D]/70">Service Area / Location</div>
                  <div className="text-sm font-medium text-[#44062D]">{(provider as any).location || 'Not provided'}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-xs text-[#44062D]/70">Description / Bio</div>
                  <div className="text-sm font-medium text-[#44062D]">{(provider as any).description || 'Not provided'}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No documents on file</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc, idx) => {
                    const filename = doc.url.split('/').pop() || doc.name;
                    const ext = filename.split('.').pop()?.toLowerCase() || '';
                    const type = ext === 'pdf' ? 'PDF' : ['jpg','jpeg','png','webp'].includes(ext) ? 'Image' : 'File';
                    const uploaded = (provider.updatedAt || provider.createdAt) ? formatDate(new Date((provider.updatedAt || provider.createdAt) as any)) : 'Unknown';
                    return (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{doc.name}</div>
                          <div className="text-xs text-gray-600">{type} • Uploaded {uploaded}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button asChild variant="outline" size="sm">
                            <a href={doc.url} target="_blank" rel="noopener noreferrer">View</a>
                          </Button>
                          <Button asChild variant="outline" size="sm">
                            <a href={doc.url} download>Download</a>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="text-sm font-semibold text-[#44062D]">Update Profile Picture</div>
                <div className="flex items-center gap-3 mt-2">
                  <Button variant="outline" size="sm" onClick={async () => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = async () => {
                      const file = input.files?.[0];
                      if (!file) return;
                      if (!/^image\//.test(file.type) || file.size > 5 * 1024 * 1024) { alert('Please upload an image <5MB'); return; }
                      const form = new FormData();
                      form.append('providerId', providerId);
                      form.append('file', file);
                      await fetch('/api/providers/profile-image', { method: 'POST', body: form });
                      alert('Profile picture updated');
                    };
                    input.click();
                  }}>Upload Image</Button>
                  <Button variant="outline" size="sm" onClick={() => alert('Camera capture not available in this preview')}>Take Photo</Button>
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-[#44062D]">Update Banking Details</div>
                <Button variant="outline" size="sm" className="mt-2" onClick={async () => {
                  const payload = { providerId, bankingDetails: { accountHolder: 'Example', bankName: 'Bank', accountNumber: '000123', branchCode: '000', accountType: 'Cheque' }, documentUploaded: true };
                  await fetch('/api/providers/banking-update-request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                  alert('Banking details update request submitted for approval');
                }}>Submit Banking Update</Button>
              </div>

              <div>
                <div className="text-sm font-semibold text-[#44062D]">Hide Profile</div>
                <div className="flex items-center gap-2 mt-2">
                  <Button variant="outline" size="sm" onClick={async () => { await fetch('/api/providers/visibility', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ providerId, hidden: true }) }); alert('Profile hidden'); }}>Hide</Button>
                  <Button variant="outline" size="sm" onClick={async () => { await fetch('/api/providers/visibility', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ providerId, hidden: false }) }); alert('Profile visible'); }}>Unhide</Button>
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-[#44062D]">Cancel as a Service Provider</div>
                <Button variant="destructive" size="sm" className="mt-2" onClick={async () => { if (!confirm('Are you sure you want to cancel your service provider profile?')) return; await fetch('/api/providers/cancel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ providerId }) }); alert('Provider profile cancelled'); }}>Cancel Provider Profile</Button>
              </div>

                <div>
                  <div className="text-sm font-semibold text-[#44062D]">Notifications</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['newBookings','bookingChanges','cancellations','paymentUpdates','reviews'].map((key) => (
                      <Button key={key} variant="outline" size="sm" onClick={async () => { await fetch('/api/providers/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ providerId, toggle: key }) }); alert(`Toggled ${key}`); }}>{key}</Button>
                    ))}
                  </div>
                </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Chat Dialog */}
      {chatBooking && (
        <ChatDialog
          open={true}
          onOpenChange={(open) => !open && setChatBooking(null)}
          bookingId={chatBooking.id}
          bookingNumber={chatBooking.bookingNumber}
          customerId={chatBooking.customerId}
          providerId={chatBooking.providerId}
          customerName={chatBooking.customerName}
          providerName={chatBooking.providerName}
          currentUserId={providerData?.userId || providerId}
        />
      )}
    </div>
  );
}
