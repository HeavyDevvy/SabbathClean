import { useLocation } from "wouter";
import ProviderPortal from "@/components/provider-portal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  User, 
  Building,
  AlertTriangle,
  ExternalLink
} from "lucide-react";

export default function ProviderDashboard() {
  const [location] = useLocation();
  
  // Get provider info from URL params or simulate logged-in provider
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const providerId = urlParams.get('id') || 'demo-provider-1';
  const providerType = (urlParams.get('type') as 'individual' | 'company') || 'individual';
  const isAdmin = urlParams.get('admin') === 'true';
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Security Notice */}
      <div className="bg-blue-600 text-white p-3">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Shield className="h-5 w-5" />
          <div className="flex-1">
            <span className="font-medium">Secure Provider Portal</span>
            <span className="ml-2 text-blue-100">
              {isAdmin ? 'Admin Access' : 'Service Provider Access'} • Training Center Available
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

      {/* Access Control Notice */}
      <div className="max-w-7xl mx-auto p-4">
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-amber-800">Training Center Access</h3>
                <p className="text-sm text-amber-700 mt-1">
                  The Training Center is exclusively available to verified service providers and admin personnel. 
                  Complete training modules to increase your social score and improve your queue selection priority for customer requests.
                </p>
                <div className="mt-3">
                  <div className="text-xs text-amber-600 space-y-1">
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

      {/* Provider Portal */}
      <ProviderPortal 
        providerId={providerId}
        providerType={providerType}
        isAdmin={isAdmin}
      />

      {/* Demo Access Panel */}
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border p-4 max-w-sm">
        <div className="text-sm font-medium mb-2">Demo Access</div>
        <div className="space-y-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="w-full justify-start text-xs"
            onClick={() => window.location.href = '?id=provider-1&type=individual'}
          >
            <User className="h-3 w-3 mr-2" />
            Individual Provider
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="w-full justify-start text-xs"
            onClick={() => window.location.href = '?id=company-1&type=company'}
          >
            <Building className="h-3 w-3 mr-2" />
            Company Provider
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="w-full justify-start text-xs"
            onClick={() => window.location.href = '?id=admin-1&admin=true'}
          >
            <Shield className="h-3 w-3 mr-2" />
            Admin Access
          </Button>
        </div>
        <Button 
          size="sm" 
          variant="ghost" 
          className="w-full mt-2 text-xs"
          onClick={() => window.location.href = '/'}
        >
          <ExternalLink className="h-3 w-3 mr-2" />
          Back to Main Site
        </Button>
      </div>
    </div>
  );
}