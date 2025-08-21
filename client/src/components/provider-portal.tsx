import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import TrainingCenter from "@/components/training-center";
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
  Clock
} from "lucide-react";

interface ProviderPortalProps {
  providerId: string;
  providerType: 'individual' | 'company';
  isAdmin?: boolean;
}

export default function ProviderPortal({ 
  providerId, 
  providerType = 'individual',
  isAdmin = false 
}: ProviderPortalProps) {
  const [activeTab, setActiveTab] = useState('dashboard');

  const { data: providerData = { name: 'Service Provider' }, isLoading } = useQuery({
    queryKey: [`/api/providers/${providerId}`],
    retry: false,
  });

  const { data: bookings = [] } = useQuery({
    queryKey: [`/api/providers/${providerId}/bookings`],
    retry: false,
  });

  const { data: earnings = {} } = useQuery({
    queryKey: [`/api/providers/${providerId}/earnings`],
    retry: false,
  });

  const { data: socialScore = { score: 0, queueBonus: 0, trainingBonus: 0, tier: 'Bronze' } } = useQuery({
    queryKey: [`/api/providers/${providerId}/social-score`],
    retry: false,
  });

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
              {providerData?.name || 'Service Provider'} • {providerType === 'company' ? 'Company' : 'Individual'}
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
                    {socialScore?.score || 0}
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
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
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
                      +{socialScore?.queueBonus || 0}%
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
                  <div className="text-2xl font-bold text-blue-600">+{socialScore?.trainingBonus || 0}</div>
                  <div className="text-sm text-gray-600">Social Score Bonus</div>
                  <div className="text-xs text-gray-500 mt-1">From completed training</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">+{socialScore?.queueBonus || 0}%</div>
                  <div className="text-sm text-gray-600">Queue Priority</div>
                  <div className="text-xs text-gray-500 mt-1">Higher booking chances</div>
                </div>
                
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <Award className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-yellow-600">{socialScore?.tier || 'Bronze'}</div>
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

        {/* Training Center */}
        <TabsContent value="training">
          <TrainingCenter 
            providerId={providerId}
            providerType={providerType}
            isAdmin={isAdmin}
          />
        </TabsContent>

        {/* Other tabs would be implemented similarly */}
        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>Booking Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Booking management interface will be implemented here.</p>
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
    </div>
  );
}