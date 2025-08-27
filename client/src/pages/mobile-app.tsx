import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import MobileFeatures from '@/components/mobile-features';
import PWAInstaller from '@/components/pwa-installer';
import { 
  Smartphone, 
  Download,
  Bell,
  Wifi,
  Share,
  Settings,
  Star,
  Clock,
  Shield
} from 'lucide-react';

export default function MobileApp() {
  const [activeTab, setActiveTab] = useState("features");

  const appFeatures = [
    {
      icon: Bell,
      title: "Push Notifications",
      description: "Get instant updates about your bookings, provider arrivals, and service completions",
      status: "active"
    },
    {
      icon: Wifi,
      title: "Offline Mode",
      description: "Browse services and view previous bookings even without internet connection",
      status: "active"
    },
    {
      icon: Download,
      title: "Fast Installation",
      description: "Add to home screen for native app-like experience without app store",
      status: "active"
    },
    {
      icon: Shield,
      title: "Secure Storage",
      description: "Your data and payment information are stored securely on your device",
      status: "active"
    }
  ];

  const appScreenshots = [
    {
      title: "Home Dashboard",
      description: "Quick access to all services and recent bookings",
      features: ["Service selection", "Recent bookings", "Provider ratings"]
    },
    {
      title: "Service Booking",
      description: "Streamlined booking process optimized for mobile",
      features: ["Smart forms", "Location picker", "Instant quotes"]
    },
    {
      title: "Real-time Updates",
      description: "Live tracking and notifications during service",
      features: ["Provider location", "Service progress", "Completion alerts"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* PWA Installer Component */}
      <PWAInstaller />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Smartphone className="h-4 w-4" />
            Mobile App Companion
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Berry Events
            <span className="block text-2xl md:text-3xl font-normal opacity-90 mt-2">
              Mobile Experience
            </span>
          </h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto mb-8">
            Get the full power of Berry Events in a fast, native mobile app. 
            Install directly from your browser - no app store required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              <Download className="h-5 w-5 mr-2" />
              Install Mobile App
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Share className="h-5 w-5 mr-2" />
              Share with Friends
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose the Mobile App?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Enhanced features and performance designed specifically for mobile users
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {appFeatures.map((feature, index) => (
              <Card key={index} className="text-center border-2 hover:border-primary transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    ✓ {feature.status === 'active' ? 'Available' : 'Coming Soon'}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Demo Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              App Experience Preview
            </h2>
            <p className="text-xl text-gray-600">
              See what makes our mobile app special
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="features" className="text-sm">Live Features</TabsTrigger>
              <TabsTrigger value="screenshots" className="text-sm">App Screens</TabsTrigger>
              <TabsTrigger value="settings" className="text-sm">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="features" className="space-y-6">
              <MobileFeatures />
            </TabsContent>

            <TabsContent value="screenshots" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                {appScreenshots.map((screen, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm font-bold">{index + 1}</span>
                        </div>
                        {screen.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{screen.description}</p>
                      <div className="space-y-2">
                        {screen.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Mobile App Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-2">Installation Status</h3>
                    <p className="text-blue-700 text-sm">
                      The app can be installed directly from your browser without visiting any app store.
                      Look for the install prompt or use your browser's "Add to Home Screen" option.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-900 mb-2">Permissions Required</h3>
                    <ul className="text-green-700 text-sm space-y-1">
                      <li>• Notifications - For booking updates and service alerts</li>
                      <li>• Location - For finding nearby service providers (optional)</li>
                      <li>• Storage - For offline functionality and faster loading</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h3 className="font-semibold text-purple-900 mb-2">Data Usage</h3>
                    <p className="text-purple-700 text-sm">
                      The app caches essential data for offline use. Initial download is ~2MB, 
                      with minimal ongoing data usage for updates only.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-16 bg-gradient-to-r from-primary to-green-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Install the Berry Events mobile app now and enjoy a faster, more convenient way 
            to book your home services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
              <Download className="h-5 w-5 mr-2" />
              Install Now
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Clock className="h-5 w-5 mr-2" />
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}