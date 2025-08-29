import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  MapPin, 
  Navigation, 
  Clock, 
  User, 
  Phone,
  Star,
  Route,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  MessageCircle
} from "lucide-react";

interface CustomerLiveTrackingProps {
  bookingId: string;
}

interface TrackingData {
  booking: {
    id: string;
    status: string;
    customerAddress: string;
  };
  provider: {
    id: string;
    name: string;
    phone: string;
    rating: number;
  };
  location: {
    latitude: number;
    longitude: number;
    isOnline: boolean;
    lastSeen: string;
  };
  estimatedArrival: string;
}

export default function CustomerLiveTracking({ bookingId }: CustomerLiveTrackingProps) {
  const [isTracking, setIsTracking] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();

  // Fetch live tracking data
  const { data: trackingData, isLoading, refetch } = useQuery<{ tracking: TrackingData | null }>({
    queryKey: [`/api/bookings/${bookingId}/tracking`],
    refetchInterval: isTracking ? 10000 : false, // Refresh every 10 seconds when tracking
    retry: false,
  });

  const tracking = trackingData?.tracking;

  // Calculate distance between two coordinates (simplified)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  };

  // Format time since last update
  const formatTimeSince = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes === 1) return "1 minute ago";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours === 1) return "1 hour ago";
    return `${diffInHours} hours ago`;
  };

  // Manual refresh handler
  const handleRefresh = () => {
    setLastUpdate(new Date());
    refetch();
  };

  useEffect(() => {
    if (tracking) {
      setLastUpdate(new Date());
    }
  }, [tracking]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!isTracking) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected for tracking');
      setIsConnected(true);
      
      // Subscribe to tracking updates for this booking
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'subscribe_tracking',
          bookingId: bookingId
        }));
      }
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'tracking_update' && data.bookingId === bookingId) {
          console.log('Received real-time tracking update:', data.data);
          
          // Update the tracking data in the query cache
          queryClient.setQueryData(
            [`/api/bookings/${bookingId}/tracking`],
            { tracking: data.data }
          );
          
          setLastUpdate(new Date());
        }
      } catch (error) {
        console.error('WebSocket message parsing error:', error);
      }
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket connection closed');
      setIsConnected(false);
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    // Cleanup on unmount or when tracking stops
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isTracking, bookingId, queryClient]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!tracking) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Tracking Available</h3>
          <p className="text-gray-600 text-center mb-4">
            Your provider hasn't started location sharing yet, or no provider has been assigned to your booking.
          </p>
          <Button variant="outline" onClick={handleRefresh} data-testid="refresh-tracking">
            <RefreshCw className="h-4 w-4 mr-2" />
            Check Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with tracking status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Navigation className="h-5 w-5 mr-2 text-blue-600" />
              Live Tracking
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge 
                variant={tracking.location.isOnline ? "default" : "secondary"}
                className={tracking.location.isOnline ? "bg-green-100 text-green-800" : ""}
              >
                {tracking.location.isOnline ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Live
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Offline
                  </>
                )}
              </Badge>
              
              {isConnected && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                  🔗 Real-time Connected
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={handleRefresh} data-testid="refresh-tracking">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Last updated: {formatTimeSince(tracking.location.lastSeen)}</span>
            <span>Booking Status: 
              <Badge variant="outline" className="ml-1 text-xs">
                {tracking.booking.status}
              </Badge>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Provider Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2 text-purple-600" />
            Your Service Provider
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-medium text-lg">{tracking.provider.name}</h3>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600">
                  {tracking.provider.rating.toFixed(1)} Rating
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Badge 
                variant={tracking.booking.status === 'enroute' ? 'default' : 'secondary'}
                className={tracking.booking.status === 'enroute' ? 'bg-blue-100 text-blue-800' : ''}
              >
                {tracking.booking.status === 'enroute' ? '🚗 En Route' : tracking.booking.status}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Contact Provider</p>
                <p className="text-xs text-gray-600">{tracking.provider.phone}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Estimated Arrival</p>
                <p className="text-xs text-gray-600">{tracking.estimatedArrival}</p>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="flex-1" data-testid="call-provider">
              <Phone className="h-4 w-4 mr-2" />
              Call Provider
            </Button>
            <Button variant="outline" size="sm" className="flex-1" data-testid="message-provider">
              <MessageCircle className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Map Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-red-600" />
            Live Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Interactive Map</h3>
            <p className="text-gray-600 mb-4">
              Real-time map showing your provider's location will be displayed here
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-white p-3 rounded-lg">
                <div className="font-medium text-blue-600">Provider Location</div>
                <div className="text-gray-600">
                  {tracking.location.latitude.toFixed(6)}, {tracking.location.longitude.toFixed(6)}
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="font-medium text-green-600">Your Address</div>
                <div className="text-gray-600">{tracking.booking.customerAddress}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tracking Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Tracking Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto-refresh</p>
              <p className="text-sm text-gray-600">Automatically update provider location every 10 seconds</p>
            </div>
            <Button
              variant={isTracking ? "default" : "outline"}
              size="sm"
              onClick={() => setIsTracking(!isTracking)}
              data-testid="toggle-tracking"
            >
              {isTracking ? "Stop Tracking" : "Start Tracking"}
            </Button>
          </div>
          
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button variant="outline" size="sm" data-testid="share-location">
                <Route className="h-4 w-4 mr-2" />
                Share Progress
              </Button>
              <Button variant="outline" size="sm" data-testid="get-directions">
                <Navigation className="h-4 w-4 mr-2" />
                Get Directions
              </Button>
              <Button variant="outline" size="sm" onClick={handleRefresh} data-testid="manual-refresh">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Service Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              <div>
                <p className="font-medium">Booking Confirmed</p>
                <p className="text-sm text-gray-600">Your service has been scheduled</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                tracking.booking.status === 'enroute' ? 'bg-blue-600' : 'bg-gray-300'
              }`}></div>
              <div>
                <p className="font-medium">Provider En Route</p>
                <p className="text-sm text-gray-600">
                  {tracking.booking.status === 'enroute' 
                    ? 'Your provider is on the way' 
                    : 'Waiting for provider to start journey'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <div>
                <p className="font-medium">Service in Progress</p>
                <p className="text-sm text-gray-600">Provider has arrived and started service</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <div>
                <p className="font-medium">Service Complete</p>
                <p className="text-sm text-gray-600">Service finished and payment processed</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}