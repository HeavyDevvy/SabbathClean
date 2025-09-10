import { useLocation } from "wouter";
import ProviderPortal from "@/components/provider-portal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { 
  Shield, 
  User, 
  Building,
  AlertTriangle,
  ExternalLink,
  Lock
} from "lucide-react";

export default function ProviderDashboard() {
  const [, setLocation] = useLocation();
  const { user, isLoading, isAuthenticated } = useAuth();
  
  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-6">
              You need to be logged in as a service provider to access this dashboard.
            </p>
            <Button 
              onClick={() => setLocation('/auth')}
              className="w-full"
              data-testid="button-login-redirect"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  // Check if user is a provider (from their profile, not URL)
  const isProvider = user?.isProvider || false;
  const providerId = user?.id || '';
  // Read provider type from user profile (assuming it's stored there)
  const providerType: 'individual' | 'company' = (user as any)?.providerType || 'individual';
  // Check admin status from user roles (assuming roles are stored in user object)
  const isAdmin = (user as any)?.roles?.includes('admin') || false;
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Security Notice */}
      <div className="bg-blue-600 text-white p-3">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Shield className="h-5 w-5" />
          <div className="flex-1">
            <span className="font-medium">Secure Provider Portal</span>
            <span className="ml-2 text-blue-100">
              {isAdmin ? 'Admin Access' : 'Service Provider Access'} • {user?.firstName} {user?.lastName}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {providerType === 'company' ? (
              <Building className="h-4 w-4" />
            ) : (
              <User className="h-4 w-4" />
            )}
            {providerType}
          </div>
        </div>
      </div>

      {/* Provider Status Check */}
      {!isProvider ? (
        <div className="max-w-7xl mx-auto p-4">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-red-800">Provider Status Required</h3>
                  <p className="text-sm text-red-700 mt-1">
                    You need to be registered as a service provider to access this dashboard. 
                    Complete the provider onboarding process to unlock provider features.
                  </p>
                  <div className="mt-4">
                    <Button 
                      onClick={() => setLocation('/provider-onboarding')}
                      className="bg-red-600 hover:bg-red-700"
                      data-testid="button-provider-onboarding"
                    >
                      Become a Provider
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto p-4">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-green-800">Verified Provider Access</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Welcome back, {user?.firstName}! You have full access to your provider dashboard. 
                    Complete training modules to increase your social score and improve your booking priority.
                  </p>
                  <div className="mt-3">
                    <div className="text-xs text-green-600 space-y-1">
                      <div>✓ Boost social scoring through training completion</div>
                      <div>✓ Improve queue selection priority (up to 25% bonus)</div>
                      <div>✓ Earn certifications for enhanced credibility</div>
                      <div>✓ Access exclusive provider development resources</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Provider Portal */}
      <ProviderPortal 
        providerId={providerId}
        providerType={providerType}
        isAdmin={isAdmin}
      />

      {/* Removed Demo Access Panel for security - no PII in URLs */}
    </div>
  );
}