import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  User, 
  Star, 
  CheckCircle, 
  MapPin, 
  Clock, 
  Shield,
  Lock as LockIcon
} from "lucide-react";

interface ReviewStepProps {
  formData: {
    selectedProvider: any;
    tipAmount: number;
  };
  setFormData: (updater: (prev: any) => any) => void;
  providers: any[];
  preSelectedProviderId?: string;
  preSelectedProviderName?: string;
  showEnhancedProviderDetails: boolean;
  isHouseCleaning: boolean;
  bookedServices: string[];
  setProviderDetailsModal: (provider: any) => void;
}

export function ReviewStep({
  formData,
  setFormData,
  providers,
  preSelectedProviderId,
  preSelectedProviderName,
  showEnhancedProviderDetails,
  isHouseCleaning,
  bookedServices,
  setProviderDetailsModal
}: ReviewStepProps) {
  // Phase 5.2: Initialize Berry Star provider in formData (useEffect to avoid render mutation)
  useEffect(() => {
    if (preSelectedProviderId && preSelectedProviderName && !formData.selectedProvider) {
      const provider = { 
        id: preSelectedProviderId, 
        name: preSelectedProviderName,
        rating: 4.9,
        reviews: 150,
        distance: "2.5 km",
        specializations: ["Berry Star", "Top Rated"],
        verified: true,
        verifiedBadges: ["Berry Star", "Verified", "Top Rated"],
        responseTime: "< 1 hour",
        hourlyRate: 350
      };
      setFormData(prev => ({ ...prev, selectedProvider: provider }));
    }
  }, [preSelectedProviderId, preSelectedProviderName, formData.selectedProvider, setFormData]);
  
  // Phase 5.2: Show ONLY locked Berry Star provider if pre-selected
  if (preSelectedProviderId && preSelectedProviderName) {
    const provider = formData.selectedProvider || { 
      id: preSelectedProviderId, 
      name: preSelectedProviderName,
      rating: 4.9,
      reviews: 150,
      distance: "2.5 km",
      specializations: ["Berry Star", "Top Rated"],
      verified: true,
      verifiedBadges: ["Berry Star", "Verified", "Top Rated"],
      responseTime: "< 1 hour",
      hourlyRate: 350
    }
    
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <Star className="h-12 w-12 text-yellow-500 mx-auto mb-3 fill-current" />
          <h3 className="text-lg font-semibold">Berry Star Provider Selected</h3>
          <p className="text-gray-600 text-sm">
            You've chosen one of our top-rated Berry Star professionals
          </p>
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3 mt-3">
            <p className="text-xs text-yellow-700 flex items-center justify-center">
              <Star className="h-4 w-4 mr-2 fill-current" />
              Berry Stars are our highest-rated providers with proven excellence
            </p>
          </div>
        </div>

        {/* Locked Provider Card */}
        <Card className="ring-2 ring-yellow-500 bg-gradient-to-br from-yellow-50/50 to-orange-50/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                <Star className="h-6 w-6 text-white fill-current" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-semibold text-gray-900">{provider.name}</h4>
                  <Badge className="bg-yellow-500 text-white">Berry Star</Badge>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1 fill-current" />
                    {provider.rating} ({provider.reviews})
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {provider.distance}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {provider.responseTime}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {provider.verifiedBadges?.map((badge: string) => (
                    <Badge key={badge} variant="secondary" className="text-xs">
                      {badge}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <span className="text-sm font-semibold text-gray-700">
                    R{provider.hourlyRate}/hour
                  </span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    <LockIcon className="h-3 w-3 mr-1" />
                    Pre-Selected
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-sm text-blue-700">
            This Berry Star provider is pre-selected for this booking. 
            Proceed to add to cart or complete your booking.
          </p>
        </div>
      </div>
    );
  }

  // Normal provider selection flow
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <User className="h-12 w-12 text-primary mx-auto mb-3" />
        <h3 className="text-lg font-semibold">Choose Your Verified Provider</h3>
        <p className="text-gray-600 text-sm">
          Showing {providers.length} verified professionals within 20km radius matching your requirements
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
          <p className="text-xs text-blue-700 flex items-center justify-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            All providers are background-checked, insured, and rated 4.5+ stars
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {providers.map((provider) => (
          <Card 
            key={provider.id}
            className={`transition-all ${
              formData.selectedProvider?.id === provider.id ? 'ring-2 ring-primary' : ''
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                {/* ENHANCED DETAILS: Show profile image for House Cleaning & Plumbing */}
                {showEnhancedProviderDetails && provider.profileImage ? (
                  <img 
                    src={provider.profileImage} 
                    alt={provider.name}
                    className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 
                      className="font-semibold text-primary underline cursor-pointer hover:text-primary/80"
                      onClick={() => setProviderDetailsModal(provider)}
                    >
                      {provider.name}
                    </h4>
                    {provider.verified && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  
                  {/* ENHANCED DETAILS: Show bio for House Cleaning & Plumbing */}
                  {showEnhancedProviderDetails && provider.bio && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{provider.bio}</p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1 fill-current" />
                      {provider.rating} ({provider.reviews} reviews)
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {provider.distance}km
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {provider.responseTime}
                    </div>
                  </div>
                  
                  {/* ENHANCED DETAILS: Show jobs completed and experience for House Cleaning & Plumbing */}
                  {showEnhancedProviderDetails && (
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      {provider.jobsCompleted && (
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1 text-success" />
                          {provider.jobsCompleted} jobs completed
                        </div>
                      )}
                      {provider.experience && (
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 mr-1" />
                          {provider.experience} years exp.
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* ENHANCED DETAILS: Show qualifications for House Cleaning & Plumbing */}
                  {showEnhancedProviderDetails && provider.qualifications && provider.qualifications.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {provider.qualifications.map((qual: string) => (
                        <Badge key={qual} variant="secondary" className="text-xs">
                          {qual}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {/* Show specializations for all services OR availability for House Cleaning */}
                  {!isHouseCleaning && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {provider.specializations.slice(0, 2).map((spec: string) => (
                        <Badge key={spec} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {isHouseCleaning && provider.availability && (
                    <div className="text-xs text-gray-600 mb-2">
                      Available: {provider.availability}
                    </div>
                  )}
                  
                  <Button
                    size="sm"
                    variant={formData.selectedProvider?.id === provider.id ? "default" : "outline"}
                    onClick={() => setFormData(prev => ({ ...prev, selectedProvider: provider }))}
                    className="w-full"
                    data-testid={`button-select-provider-${provider.id}`}
                  >
                    {formData.selectedProvider?.id === provider.id ? "Selected" : "Select Provider"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* ENHANCED SERVICES: Tip input section */}
      {showEnhancedProviderDetails && formData.selectedProvider && (
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="p-4">
            <Label className="text-sm font-semibold mb-2 block">Add a tip for your provider (optional)</Label>
            <p className="text-xs text-gray-600 mb-3">Show your appreciation for excellent service</p>
            
            <div className="flex gap-2 mb-3">
              {[0, 20, 50, 100].map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  size="sm"
                  variant={formData.tipAmount === amount ? "default" : "outline"}
                  onClick={() => setFormData(prev => ({ ...prev, tipAmount: amount }))}
                  className="flex-1"
                  data-testid={`button-tip-${amount}`}
                >
                  R{amount}
                </Button>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <Label htmlFor="custom-tip" className="text-xs whitespace-nowrap">Custom:</Label>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">R</span>
                <Input
                  id="custom-tip"
                  type="number"
                  min="0"
                  max="1000"
                  step="0.01"
                  value={formData.tipAmount || ''}
                  onChange={(e) => {
                    const rawValue = e.target.value;
                    if (rawValue === '' || rawValue === null || rawValue === undefined) {
                      setFormData(prev => ({ ...prev, tipAmount: 0 }));
                      return;
                    }
                    
                    const value = parseFloat(rawValue);
                    if (!isNaN(value) && value >= 0 && value <= 1000) {
                      const rounded = Math.round(value * 100) / 100;
                      setFormData(prev => ({ ...prev, tipAmount: rounded }));
                    }
                  }}
                  className="pl-8"
                  placeholder="0"
                  data-testid="input-custom-tip"
                />
              </div>
            </div>
            
            {formData.tipAmount > 0 && (
              <p className="text-xs text-success mt-2">
                ✓ R{formData.tipAmount.toFixed(2)} tip will be added to your total
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {bookedServices.length > 0 && (
        <div className="text-sm text-gray-600 text-center mt-4">
          Already booked: {bookedServices.length} service{bookedServices.length > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
