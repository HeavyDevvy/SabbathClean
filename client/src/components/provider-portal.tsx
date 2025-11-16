import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import TrainingCenter from "@/components/training-center";
import ProviderLiveTracking from "@/components/provider-live-tracking";
import { ChatDialog } from "@/components/chat-dialog";
import { format } from "date-fns";
import { 
  User,
  Calendar,
  DollarSign,
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
  rating?: number;
  servicesOffered?: string[];
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

  const { data: providerData, isLoading } = useQuery<ProviderData>({
    queryKey: [`/api/providers/${providerId}`],
    retry: false,
  });

  const { data: bookings = [] } = useQuery({
    queryKey: [`/api/providers/${providerId}/bookings`],
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

  // Provide safe defaults for data
  const provider: ProviderData = providerData || { name: 'Service Provider', firstName: 'Service', lastName: 'Provider' };
  const providerEarnings: EarningsData = earnings || { totalEarnings: 0, pendingPayouts: 0, completedJobs: 0 };
  const score: SocialScoreData = socialScore || { score: 0, queueBonus: 0, trainingBonus: 0, tier: 'Bronze' };

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
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {isAdmin ? 'Admin Portal' : 'Provider Portal'}
            </h1>
            <p className="text-gray-600">
              {provider.name || `${provider.firstName || ''} ${provider.lastName || ''}`.trim() || 'Service Provider'} • {providerType === 'company' ? 'Company' : 'Individual'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Social Score Badge */}
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-purple-600" />
                <div>
                  <div className="text-xs text-gray-600">Social Score</div>
                  <div className="font-bold text-purple-600">
                    {score.score}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
        </div>
      </div>

      {/* Main Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="tracking">
            <Navigation className="h-4 w-4 mr-2" />
            Live Tracking
          </TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="training">
            <GraduationCap className="h-4 w-4 mr-2" />
            Training Center
          </TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Dashboard */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="text-sm text-gray-600">This Week</div>
                    <div className="text-xl font-bold">12 Bookings</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="text-sm text-gray-600">Earnings</div>
                    <div className="text-xl font-bold">R8,540</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-yellow-600" />
                  <div>
                    <div className="text-sm text-gray-600">Rating</div>
                    <div className="text-xl font-bold">4.8</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <div>
                    <div className="text-sm text-gray-600">Queue Priority</div>
                    <div className="text-xl font-bold text-green-600">
                      +{score.queueBonus}%
                    </div>
                  </div>
                </div>
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
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">+{score.trainingBonus}</div>
                  <div className="text-sm text-gray-600">Social Score Bonus</div>
                  <div className="text-xs text-gray-500 mt-1">From completed training</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">+{score.queueBonus}%</div>
                  <div className="text-sm text-gray-600">Queue Priority</div>
                  <div className="text-xs text-gray-500 mt-1">Higher booking chances</div>
                </div>
                
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <Award className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-yellow-600">{score.tier}</div>
                  <div className="text-sm text-gray-600">Provider Tier</div>
                  <div className="text-xs text-gray-500 mt-1">Based on training & performance</div>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Continue Your Training Journey</h4>
                    <p className="text-sm text-gray-600">Complete more modules to boost your social score and earnings</p>
                  </div>
                  <Button onClick={() => setActiveTab('training')}>
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Open Training Center
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Sample booking data */}
                  {[
                    { id: 1, service: "House Cleaning", client: "Sarah M.", time: "Today 2:00 PM", status: "confirmed" },
                    { id: 2, service: "Garden Care", client: "John D.", time: "Tomorrow 9:00 AM", status: "pending" },
                    { id: 3, service: "Plumbing", client: "Emma W.", time: "Dec 25 10:00 AM", status: "confirmed" }
                  ].map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{booking.service}</div>
                        <div className="text-sm text-gray-600">{booking.client}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">{booking.time}</div>
                        <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Training Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { module: "Customer Service Excellence", progress: 100, status: "completed" },
                    { module: "Safety & Compliance", progress: 75, status: "in_progress" },
                    { module: "Advanced Technical Skills", progress: 0, status: "not_started" }
                  ].map((module, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{module.module}</span>
                        <span>{module.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            module.status === 'completed' ? 'bg-green-600' : 
                            module.status === 'in_progress' ? 'bg-blue-600' : 'bg-gray-400'
                          }`}
                          style={{ width: `${module.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Live Tracking */}
        <TabsContent value="tracking" className="space-y-6">
          <ProviderLiveTracking providerId={providerId} />
        </TabsContent>

        {/* Training Center */}
        <TabsContent value="training">
          <TrainingCenter 
            providerId={providerId}
            providerType={providerType}
            isAdmin={isAdmin}
          />
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>Your Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No bookings yet</p>
                  <p className="text-sm mt-1">Your confirmed bookings will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking: any) => (
                    <div key={booking.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{booking.serviceType}</h3>
                          <p className="text-sm text-gray-600">Booking #{booking.id.slice(0, 8)}</p>
                        </div>
                        <Badge 
                          className={
                            booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }
                        >
                          {booking.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          {format(new Date(booking.scheduledDate), "MMM d, yyyy")}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          {booking.scheduledTime}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          {booking.address}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <User className="h-4 w-4 mr-2" />
                          {booking.customerName || 'Customer'}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="text-lg font-semibold text-green-600">
                          R{parseFloat(booking.totalPrice || '0').toFixed(2)}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setChatBooking({
                            id: booking.id,
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
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings">
          <Card>
            <CardHeader>
              <CardTitle>Earnings & Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Earnings dashboard will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Profile management interface will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Settings interface will be implemented here.</p>
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
          customerId={chatBooking.customerId}
          providerId={chatBooking.providerId}
          customerName={chatBooking.customerName}
          providerName={chatBooking.providerName}
          currentUserId={providerId}
        />
      )}
    </div>
  );
}