import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Star,
  MapPin,
  Calendar,
  Shield,
  Award,
  Clock,
  CheckCircle2,
  Users,
  Heart,
  ArrowRight
} from "lucide-react";

interface Provider {
  id: string;
  name: string;
  rating: number;
  totalReviews: number;
  image: string;
  specialties: string[];
  experience: string;
  location: string;
  nextAvailable: string;
  hourlyRate: number;
  completedJobs: number;
  verificationBadges: string[];
  topPerformer: boolean;
}

interface BerryStarsSectionProps {
  onBookService: (serviceId: string) => void;
}

export default function BerryStarsSection({ onBookService }: BerryStarsSectionProps) {
  const featuredProviders: Provider[] = [
    {
      id: "1",
      name: "Nomsa Mthembu",
      rating: 4.9,
      totalReviews: 247,
      image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200",
      specialties: ["House Cleaning", "Deep Clean", "Eco-Friendly"],
      experience: "5+ years",
      location: "Cape Town, Western Cape",
      nextAvailable: "Today, 2:00 PM",
      hourlyRate: 280,
      completedJobs: 892,
      verificationBadges: ["ID Verified", "Background Checked", "Insured"],
      topPerformer: true,
    },
    {
      id: "2",
      name: "Thabo Mokoena", 
      rating: 4.8,
      totalReviews: 189,
      image: "https://images.unsplash.com/photo-1600486913747-55e5470d6f40?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200",
      specialties: ["Plumbing", "Emergency Repairs", "Licensed"],
      experience: "8+ years",
      location: "Johannesburg, Gauteng",
      nextAvailable: "Tomorrow, 8:00 AM",
      hourlyRate: 420,
      completedJobs: 634,
      verificationBadges: ["Licensed", "Certified", "Insured"],
      topPerformer: true,
    },
    {
      id: "3",
      name: "Zinhle Ndlovu",
      rating: 4.9,
      totalReviews: 156,
      image: "https://images.unsplash.com/photo-1494790108755-2616c96bb829?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200",
      specialties: ["Garden Care", "Landscaping", "Plant Expert"],
      experience: "6+ years",
      location: "Durban, KwaZulu-Natal",
      nextAvailable: "Today, 10:00 AM",
      hourlyRate: 350,
      completedJobs: 445,
      verificationBadges: ["Certified", "Eco-Specialist", "Insured"],
      topPerformer: false,
    },
    {
      id: "4",
      name: "Mandla Sithole",
      rating: 4.7,
      totalReviews: 203,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200",
      specialties: ["African Cuisine", "Event Catering", "Traditional"],
      experience: "10+ years", 
      location: "Pretoria, Gauteng",
      nextAvailable: "Weekend Available",
      hourlyRate: 580,
      completedJobs: 321,
      verificationBadges: ["Culinary Certified", "Health Certified", "Insured"],
      topPerformer: true,
    },
  ];

  const getServiceForProvider = (specialties: string[]): string => {
    if (specialties.some(s => s.toLowerCase().includes('clean'))) return 'house-cleaning';
    if (specialties.some(s => s.toLowerCase().includes('plumb'))) return 'plumbing-services';
    if (specialties.some(s => s.toLowerCase().includes('garden'))) return 'garden-maintenance';
    if (specialties.some(s => s.toLowerCase().includes('chef') || s.toLowerCase().includes('cuisine'))) return 'chef-catering';
    return 'house-cleaning';
  };

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 text-sm font-semibold border-0 mb-4">
            <Star className="h-4 w-4 mr-2" />
            Berry Stars
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Meet our top-rated
            <span className="block bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              professionals
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our Berry Stars are the highest-rated, most experienced professionals on our platform. 
            They've earned their status through exceptional service and customer satisfaction.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {[
            { icon: Users, value: "500+", label: "Verified Professionals", color: "blue" },
            { icon: Star, value: "4.9/5", label: "Average Rating", color: "yellow" },
            { icon: Shield, value: "100%", label: "Background Checked", color: "green" },
            { icon: Award, value: "50+", label: "Berry Stars", color: "purple" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`w-16 h-16 bg-${stat.color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
                <stat.icon className={`h-8 w-8 text-${stat.color}-600`} />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2" data-testid={`stat-${stat.label.toLowerCase().replace(' ', '-')}`}>
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Featured Providers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {featuredProviders.map((provider) => (
            <Card 
              key={provider.id} 
              className="bg-white border-2 border-gray-100 hover:border-gray-200 hover:shadow-2xl transition-all duration-500 group overflow-hidden"
              data-testid={`provider-card-${provider.id}`}
            >
              <CardContent className="p-0">
                {/* Header Image & Badge */}
                <div className="relative">
                  <img 
                    src={provider.image} 
                    alt={provider.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  {/* Top Performer Badge */}
                  {provider.topPerformer && (
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-yellow-500 text-white border-0 shadow-lg">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        Berry Star
                      </Badge>
                    </div>
                  )}

                  {/* Availability Badge */}
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-green-500 text-white border-0 shadow-lg">
                      <Clock className="h-3 w-3 mr-1" />
                      Available
                    </Badge>
                  </div>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Name & Rating */}
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {provider.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${
                                i < Math.floor(provider.rating) 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-gray-300'
                              }`} 
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-600">
                          {provider.rating} ({provider.totalReviews})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Specialties */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {provider.specialties.slice(0, 2).map((specialty, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                      {provider.specialties.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{provider.specialties.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                    <div>
                      <div className="font-semibold text-gray-900">{provider.completedJobs}</div>
                      <div className="text-xs">Jobs Completed</div>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{provider.experience}</div>
                      <div className="text-xs">Experience</div>
                    </div>
                  </div>

                  {/* Location & Availability */}
                  <div className="space-y-2 mb-6 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{provider.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="text-green-600 font-medium">{provider.nextAvailable}</span>
                    </div>
                  </div>

                  {/* Verification Badges */}
                  <div className="flex flex-wrap gap-1 mb-6">
                    {provider.verificationBadges.slice(0, 3).map((badge, index) => (
                      <div key={index} className="flex items-center text-xs text-green-600 bg-green-50 rounded-full px-2 py-1">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {badge}
                      </div>
                    ))}
                  </div>

                  {/* Pricing & CTA */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">R{provider.hourlyRate}</div>
                      <div className="text-xs text-gray-500">per hour</div>
                    </div>
                    <Button
                      onClick={() => onBookService(getServiceForProvider(provider.specialties))}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 group-hover:scale-105"
                      data-testid={`button-book-${provider.id}`}
                    >
                      Book Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center bg-white rounded-3xl p-12 border border-gray-200 shadow-lg">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Want to become a Berry Star?
            </h3>
            <p className="text-lg text-gray-600 mb-8">
              Join our elite group of top-rated professionals. Earn more, get priority bookings, 
              and build a reputation that speaks for itself.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { icon: Star, title: "Higher Earnings", description: "Top performers earn 20% more" },
                { icon: Calendar, title: "Priority Bookings", description: "Get first access to premium jobs" },
                { icon: Award, title: "Recognition", description: "Stand out with Berry Star badge" },
              ].map((benefit, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">{benefit.title}</h4>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => {
                  window.open('/provider-onboarding', '_blank');
                }}
                data-testid="button-become-provider"
              >
                <Users className="mr-2 h-5 w-5" />
                Become a Provider
              </Button>
              
              <Button 
                variant="outline"
                className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold px-8 py-3 rounded-xl transition-all duration-200"
                onClick={() => {
                  const servicesSection = document.getElementById('services');
                  servicesSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                data-testid="button-browse-services"
              >
                <Heart className="mr-2 h-5 w-5" />
                Browse All Services
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}