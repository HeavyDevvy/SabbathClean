import { useLocation } from "wouter";
import ProviderPortal from "@/components/provider-portal";
import { useQuery } from "@tanstack/react-query";
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
import EnhancedHeader from "@/components/enhanced-header";

export default function ProviderDashboard() {
  const [, setLocation] = useLocation();
  const { user, isLoading, isAuthenticated } = useAuth();
  // Always compute state and queries to keep hook order consistent across renders
  // Check if user is a provider (from their profile, not URL)
  const isProvider = user?.isProvider || false;
  const userId = user?.id || '';
  const { data: provider } = useQuery<any>({
    queryKey: [
      userId ? `/api/providers/by-user/${userId}` : "/api/providers/by-user/idle"
    ],
    enabled: !!userId && isProvider,
  });
  const isApproved = (provider?.verificationStatus === 'approved') || !!provider?.isVerified;
  const providerId = provider?.id || '';
  // Read provider type from user profile (assuming it's stored there)
  const providerType: 'individual' | 'company' = (user as any)?.providerType || 'individual';
  // Check admin status from user roles (assuming roles are stored in user object)
  const isAdmin = (user as any)?.roles?.includes('admin') || false;
  
  // Decide what to render based on current auth/loading state without changing hook order
  let authGate: JSX.Element | null = null;
  if (isLoading) {
    authGate = (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  } else if (!isAuthenticated) {
    authGate = (
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

  return (
    <div className="min-h-screen bg-gray-50">
      <EnhancedHeader onBookingClick={() => setLocation('/services')} />
      {authGate}
      

      {/* Provider Status Check */}
      {!isLoading && isAuthenticated && !isProvider ? (
        <div className="max-w-7xl mx-auto p-4">
          <Card className="border-[#EED1C4] bg-[#EED1C4]/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-[#44062D] mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-[#44062D]">Provider Status Required</h3>
                  <p className="text-sm text-[#3C0920] mt-1">
                    You need to be registered as a service provider to access this dashboard. 
                    Complete the provider onboarding process to unlock provider features.
                  </p>
                  <div className="mt-4">
                    <Button 
                      onClick={() => setLocation('/provider-onboarding')}
                      className="bg-[#44062D] hover:bg-[#3C0920]"
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
      ) : (!isLoading && isAuthenticated && !isApproved) ? (
        <div className="max-w-7xl mx-auto p-4">
          <Card className="border-[#EED1C4] bg-[#EED1C4]/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-[#44062D] mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-[#44062D]">Provider Approval Pending</h3>
                  <p className="text-sm text-[#3C0920] mt-1">
                    Your provider account is pending approval. You will gain access once approved.
                  </p>
                  <div className="mt-4">
                    <Button 
                      onClick={() => setLocation('/provider-support')}
                      className="bg-[#44062D] hover:bg-[#3C0920]"
                      data-testid="button-provider-support"
                    >
                      View Provider Support
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Provider Portal */}
      {!isLoading && isAuthenticated && isApproved && (
        <ProviderPortal 
          providerId={providerId}
          providerType={providerType}
          isAdmin={isAdmin}
        />
      )}

      {/* Removed Demo Access Panel for security - no PII in URLs */}
    </div>
  );
}
