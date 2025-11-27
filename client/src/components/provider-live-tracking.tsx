import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  MapPin, 
  Navigation, 
  Clock, 
  User, 
  Phone,
  AlertCircle,
  CheckCircle2,
  Route,
  Zap,
  Calendar
} from "lucide-react";

interface ProviderLiveTrackingProps {
  providerId: string;
}

interface LocationData {
  latitude: number;
  longitude: number;
  isOnline: boolean;
  lastSeen: string;
}

interface ActiveBooking {
  id: string;
  customerName: string;
  customerPhone: string;
  service: string;
  address: string;
  scheduledTime: string;
  status: string;
}

export default function ProviderLiveTracking({ providerId }: ProviderLiveTrackingProps) {
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isWatchingLocation, setIsWatchingLocation] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current provider location and status
  const { data: providerLocation } = useQuery<LocationData>({
    queryKey: [`/api/providers/${providerId}/location`],
    retry: false,
  });

  // Fetch active bookings for this provider
  const { data: activeBookings = [] } = useQuery<ActiveBooking[]>({
    queryKey: [`/api/providers/${providerId}/bookings/active`],
    retry: false,
  });

  // Update provider location mutation
  const updateLocationMutation = useMutation({
    mutationFn: async (locationData: { latitude: number; longitude: number; isOnline: boolean }) => {
      const res = await apiRequest('POST', `/api/providers/${providerId}/location`, locationData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/providers/${providerId}/location`] });
      toast({
        title: "Location Updated",
        description: "Your location has been shared successfully",
      });
    },
    onError: () => {
      toast({
        title: "Location Update Failed",
        description: "Could not update your location. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update provider status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (isOnline: boolean) => {
      const res = await apiRequest('PUT', `/api/providers/${providerId}/status`, { isOnline });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/providers/${providerId}/location`] });
    },
  });

  // Set enroute status for a booking
  const setEnrouteMutation = useMutation({
    mutationFn: async ({ bookingId, latitude, longitude }: { bookingId: string; latitude: number; longitude: number }) => {
      const res = await apiRequest('POST', `/api/bookings/${bookingId}/enroute`, { providerId, latitude, longitude });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Enroute Status Set",
        description: "Customer has been notified that you're on your way!",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/providers/${providerId}/bookings/active`] });
    },
  });

  // Get current geolocation
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser doesn't support location sharing",
        variant: "destructive",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          isOnline: isLocationEnabled,
        };
        
        setCurrentLocation({
          ...locationData,
          lastSeen: new Date().toISOString(),
        });
        
        updateLocationMutation.mutate(locationData);
      },
      (error) => {
        toast({
          title: "Location Access Denied",
          description: "Please enable location access to share your position",
          variant: "destructive",
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Start watching location
  const startLocationTracking = () => {
    if (!navigator.geolocation) return;

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          isOnline: isLocationEnabled,
        };
        
        setCurrentLocation({
          ...locationData,
          lastSeen: new Date().toISOString(),
        });
        
        // Update location every 30 seconds when tracking
        updateLocationMutation.mutate(locationData);
      },
      (error) => {
        setIsWatchingLocation(false);
        if (id) {
          navigator.geolocation.clearWatch(id);
          setWatchId(null);
        }
        toast({
          title: "Location Tracking Error",
          description: "Unable to track location. Check permissions and try again.",
          variant: "destructive",
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );

    setIsWatchingLocation(true);
    setWatchId(id);
    return id;
  };

  // Handle location toggle
  const handleLocationToggle = async (enabled: boolean) => {
    setIsLocationEnabled(enabled);
    
    if (enabled) {
      getCurrentLocation();
      if (!isWatchingLocation) {
        startLocationTracking();
      }
    }
    if (!enabled) {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
      }
      setIsWatchingLocation(false);
    }
    
    await updateStatusMutation.mutateAsync(enabled);
  };

  // Handle enroute button click
  const handleSetEnroute = (bookingId: string) => {
    const hasLocation = (loc: LocationData | null): loc is LocationData => !!loc;
    if (hasLocation(currentLocation)) {
      setEnrouteMutation.mutate({
        bookingId,
        latitude: (currentLocation as LocationData).latitude,
        longitude: (currentLocation as LocationData).longitude,
      });
      return;
    }

    getCurrentLocation();
    setTimeout(() => {
      if (hasLocation(currentLocation)) {
        setEnrouteMutation.mutate({
          bookingId,
          latitude: (currentLocation as LocationData).latitude,
          longitude: (currentLocation as LocationData).longitude,
        });
      }
    }, 1000);
  };

  useEffect(() => {
    if (providerLocation) {
      setIsLocationEnabled(providerLocation.isOnline ?? false);
      setCurrentLocation(providerLocation);
    }
  }, [providerLocation]);

  return (
    <div className="space-y-6">
      {/* Location Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-blue-600" />
            Live Location Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Share Your Location</p>
              <p className="text-sm text-gray-600">
                Allow customers to track your arrival in real-time
              </p>
            </div>
            <Switch
              checked={isLocationEnabled}
              onCheckedChange={handleLocationToggle}
              data-testid="location-toggle"
            />
          </div>

          {currentLocation && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Navigation className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Current Position</p>
                  <p className="text-xs text-gray-600">
                    {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-xs text-gray-600">
                    {new Date(currentLocation.lastSeen).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Badge 
              variant={isLocationEnabled ? "default" : "secondary"}
              className={isLocationEnabled ? "bg-green-100 text-green-800" : ""}
            >
              {isLocationEnabled ? (
                <>
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Online & Trackable
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Offline
                </>
              )}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Active Bookings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Route className="h-5 w-5 mr-2 text-purple-600" />
            Active Bookings ({activeBookings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeBookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No active bookings at the moment</p>
              <p className="text-sm">New bookings will appear here when assigned</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeBookings.map((booking) => (
                <div key={booking.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-600" />
                        <span className="font-medium">{booking.customerName}</span>
                        <Badge variant="outline" className="text-xs">
                          {booking.service}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{booking.customerPhone}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{booking.address}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>Scheduled: {new Date(booking.scheduledTime).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Badge 
                        variant={booking.status === 'enroute' ? 'default' : 'secondary'}
                        className={booking.status === 'enroute' ? 'bg-blue-100 text-blue-800' : ''}
                      >
                        {booking.status === 'enroute' ? '🚗 En Route' : booking.status}
                      </Badge>
                      
                      {booking.status !== 'enroute' && isLocationEnabled && (
                        <Button
                          size="sm"
                          onClick={() => handleSetEnroute(booking.id)}
                          disabled={setEnrouteMutation.isPending}
                          className="w-full"
                          data-testid={`enroute-${booking.id}`}
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Set En Route
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={getCurrentLocation}
            disabled={updateLocationMutation.isPending}
            data-testid="update-location"
          >
            <Navigation className="h-4 w-4 mr-2" />
            Update My Location Now
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => handleLocationToggle(true)}
              disabled={isLocationEnabled}
              data-testid="go-online"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Go Online
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleLocationToggle(false)}
              disabled={!isLocationEnabled}
              data-testid="go-offline"
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Go Offline
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
