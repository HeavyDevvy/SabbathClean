import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WifiOff, RefreshCw, Home, Calendar, Users } from "lucide-react";
import { useLocation } from "wouter";

export default function OfflinePage() {
  const [, navigate] = useLocation();

  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <WifiOff className="h-8 w-8 text-gray-500" />
          </div>
          <CardTitle className="text-xl text-gray-900">You're Offline</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              No internet connection detected. Some features may be limited while offline.
            </p>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h4 className="font-medium text-blue-800 mb-2">Available Offline:</h4>
              <ul className="text-sm text-blue-700 space-y-1 text-left">
                <li>• Browse cached services</li>
                <li>• View previous bookings</li>
                <li>• Save booking drafts</li>
                <li>• Access contact information</li>
              </ul>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleRetry} 
              className="w-full"
              data-testid="button-retry-connection"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            
            <Button 
              onClick={handleGoHome} 
              variant="outline" 
              className="w-full"
              data-testid="button-go-home"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Home
            </Button>
          </div>

          {/* Offline features */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-3">
              <button 
                className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => navigate('/bookings')}
                data-testid="button-view-bookings"
              >
                <Calendar className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                <span className="text-xs text-gray-600">My Bookings</span>
              </button>
              
              <button 
                className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => navigate('/providers')}
                data-testid="button-view-providers"
              >
                <Users className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                <span className="text-xs text-gray-600">Providers</span>
              </button>
            </div>
          </div>

          {/* Connection status */}
          <div className="text-center">
            <div className="flex items-center justify-center text-sm text-gray-500">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
              Connection Status: Offline
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Your data will sync when you're back online
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}