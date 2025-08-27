import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRecommendations, useContextualSuggestions } from "@/hooks/useRecommendations";
import { 
  Star, 
  MapPin, 
  Clock, 
  Heart, 
  TrendingUp, 
  Sparkles, 
  Calendar,
  DollarSign,
  User,
  ChevronRight,
  Filter,
  Shuffle
} from "lucide-react";
import { motion } from "framer-motion";
import ServiceDetailModal from "@/components/service-detail-modal";

interface RecommendationEngineProps {
  userId?: string;
  onBookService?: (serviceId: string, providerId: string) => void;
  onViewProvider?: (providerId: string) => void;
  showHeader?: boolean;
}



export default function RecommendationEngine({ 
  userId = "demo-user", 
  onBookService,
  onViewProvider,
  showHeader = true 
}: RecommendationEngineProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showPreferences, setShowPreferences] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");

  const { 
    recommendations, 
    preferences, 
    isLoading, 
    trackInteraction, 
    updatePreferences 
  } = useRecommendations(userId);

  const { data: contextualSuggestions } = useContextualSuggestions({
    timeOfDay: new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening',
    dayOfWeek: new Date().toLocaleDateString('en', { weekday: 'long' }).toLowerCase(),
    previousSearches: preferences?.preferredServices || []
  });

  const categories = [
    { id: 'all', label: 'All Recommendations', icon: Sparkles },
    { id: 'trending', label: 'Trending Now', icon: TrendingUp },
    { id: 'personalized', label: 'Just for You', icon: Heart },
    { id: 'nearby', label: 'Near You', icon: MapPin }
  ];

  const filteredRecommendations = recommendations?.filter(rec => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'trending') return rec.isPromoted;
    if (selectedCategory === 'personalized') return rec.matchScore > 80;
    if (selectedCategory === 'nearby') return rec.provider.distance && rec.provider.distance < 10;
    return true;
  }) || [];

  const handleRecommendationClick = (recommendation: any) => {
    trackInteraction('view', recommendation.id);
    // Extract service ID from service name for modal
    const serviceMap: Record<string, string> = {
      'Deep House Cleaning': 'house-cleaning',
      'Traditional African Catering': 'chef-catering',
      'Garden Maintenance': 'garden-care',
      'Plumbing Service': 'plumbing',
      'Electrical Work': 'electrical',
      'Waitering Service': 'waitering'
    };
    
    const serviceId = serviceMap[recommendation.serviceName] || 'house-cleaning';
    setSelectedServiceId(serviceId);
    setShowServiceModal(true);
  };

  const handleServiceSelection = (serviceId: string, optionId: string, addOns?: string[]) => {
    // Process the service selection and continue to booking
    onBookService?.(serviceId, 'recommended-provider');
    setShowServiceModal(false);
  };

  const handleFavorite = (recommendationId: string) => {
    trackInteraction('favorite', recommendationId);
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-48 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-500" />
              Recommended for You
            </h2>
            <p className="text-gray-600 mt-1">
              Personalized service suggestions based on your preferences and history
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowPreferences(!showPreferences)}>
              <Filter className="h-4 w-4 mr-2" />
              Preferences
            </Button>
            <Button variant="outline" size="sm">
              <Shuffle className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      )}

      {/* Contextual Quick Suggestions */}
      {contextualSuggestions && contextualSuggestions.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Perfect for Right Now
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {contextualSuggestions.slice(0, 3).map((suggestion: any, index: number) => (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex-shrink-0"
                >
                  <Button 
                    variant="outline" 
                    className="h-auto p-3 flex-col items-start min-w-[200px] bg-white hover:bg-blue-50"
                    onClick={() => handleRecommendationClick(suggestion)}
                  >
                    <div className="font-medium text-left">{suggestion.serviceName}</div>
                    <div className="text-sm text-gray-500 text-left">{suggestion.contextReason}</div>
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{category.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-4 mt-6">
          {filteredRecommendations.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No recommendations yet
                </h3>
                <p className="text-gray-600">
                  Complete a booking or update your preferences to get personalized suggestions.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRecommendations.map((recommendation, index) => (
                <motion.div
                  key={recommendation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-all cursor-pointer group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                            {recommendation.serviceName}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={`/api/avatar/${recommendation.provider.id}`} />
                              <AvatarFallback>
                                {recommendation.provider.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{recommendation.provider.name}</p>
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                <span className="text-xs text-gray-600">{recommendation.provider.rating}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFavorite(recommendation.id);
                            }}
                            className="p-1 h-8 w-8"
                          >
                            <Heart className="h-4 w-4" />
                          </Button>
                          <Badge 
                            className={`${getMatchScoreColor(recommendation.matchScore)} text-white`}
                          >
                            {recommendation.matchScore}% match
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Match Reasons */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Why this recommendation:</h4>
                        <div className="flex flex-wrap gap-1">
                          {recommendation.reasons.slice(0, 3).map((reason, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {reason}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Service Details */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-500" />
                          <span className="font-medium">R{recommendation.estimatedPrice}</span>
                        </div>
                        {recommendation.provider.distance && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-blue-500" />
                            <span>{recommendation.provider.distance.toFixed(1)}km away</span>
                          </div>
                        )}
                      </div>

                      {/* Availability */}
                      {recommendation.availability.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Available:</h4>
                          <div className="flex gap-2">
                            {recommendation.availability.slice(0, 3).map((time, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {time}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2 border-t">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRecommendationClick(recommendation);
                          }}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Book Now
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewProvider?.(recommendation.provider.id);
                          }}
                        >
                          View Provider
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Match Quality Indicator */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Recommendation Quality</span>
            <span className="text-sm text-gray-600">
              {recommendations?.length > 0 ? 
                `${Math.round(recommendations.reduce((acc, r) => acc + r.matchScore, 0) / recommendations.length)}% accurate` 
                : 'Building profile...'
              }
            </span>
          </div>
          <Progress 
            value={recommendations?.length > 0 ? 
              Math.round(recommendations.reduce((acc, r) => acc + r.matchScore, 0) / recommendations.length) 
              : 25
            } 
            className="h-2" 
          />
          <p className="text-xs text-gray-600 mt-2">
            Complete more bookings and rate services to improve recommendations
          </p>
        </CardContent>
      </Card>

      {/* Service Detail Modal */}
      <ServiceDetailModal
        isOpen={showServiceModal}
        onClose={() => setShowServiceModal(false)}
        serviceId={selectedServiceId}
        onSelectService={handleServiceSelection}
      />
    </div>
  );
}