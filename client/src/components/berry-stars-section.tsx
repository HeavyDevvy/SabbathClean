import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
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

// Import provider images
import nomsaImage from "@assets/Nomsa Mthembu_1763439240584.jpg";
import thaboImage from "@assets/Thabo Mokoena_1763439240584.jpg";
import zinhleImage from "@assets/Zinhle Ndlovu_1763439240584.jpg";
import mandlaImage from "@assets/Mandla Sithole_1763439240583.jpg";

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
  onBookService: (serviceId: string, providerId?: string, providerName?: string) => void;
}

export default function BerryStarsSection({ onBookService }: BerryStarsSectionProps) {
  const [, setLocation] = useLocation();
  
  const featuredProviders: Provider[] = [
    {
      id: "1",
      name: "Nomsa Mthembu",
      rating: 4.9,
      totalReviews: 247,
      image: nomsaImage,
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
      image: thaboImage,
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
      image: zinhleImage,
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
      image: mandlaImage,
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
    <section className="py-8 md:py-12 lg:py-16" style={{ backgroundColor: '#EED1C4' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold mb-5" style={{ color: '#44062D' }}>
            Meet Your Berry Stars
          </h2>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: '#3C0920' }}>
            Experienced, vetted professionals ready to help.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { icon: Users, value: "500+", label: "Verified Professionals" },
            { icon: Star, value: "4.9/5", label: "Average Rating" },
            { icon: Shield, value: "100%", label: "Background Checked" },
            { icon: Award, value: "50+", label: "Berry Stars" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(197, 107, 134, 0.1)' }}>
                <stat.icon className="h-8 w-8" style={{ color: '#C56B86' }} />
              </div>
              <div className="text-3xl font-bold mb-2" style={{ color: '#44062D' }} data-testid={`stat-${stat.label.toLowerCase().replace(' ', '-')}`}>
                {stat.value}
              </div>
              <div className="text-sm" style={{ color: '#3C0920' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Featured Providers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {featuredProviders.map((provider) => (
            <Card 
              key={provider.id} 
              className="bg-white border-2 border-gray-100 hover:border-gray-200 hover:shadow-2xl transition-all duration-500 group overflow-hidden rounded-2xl h-full flex flex-col"
              data-testid={`provider-card-${provider.id}`}
            >
              <CardContent className="p-0 flex flex-col h-full">
                {/* Header Image */}
                <div className="relative aspect-square overflow-hidden">
                  <img 
                    src={provider.image} 
                    alt={provider.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    style={{
                      imageRendering: '-webkit-optimize-contrast',
                      WebkitBackfaceVisibility: 'hidden',
                      backfaceVisibility: 'hidden',
                      transform: 'translateZ(0)',
                    }}
                    loading="lazy"
                  />
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  {/* Name */}
                  <h3 className="text-lg font-bold mb-2 leading-tight" style={{ color: '#44062D' }}>
                    {provider.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm mb-4 flex-1" style={{ color: '#3C0920' }}>
                    {provider.specialties[0]}
                  </p>

                  {/* Pricing & CTA */}
                  <div className="flex items-center justify-between mt-auto pt-4 border-t" style={{ borderColor: '#EED1C4' }}>
                    <div>
                      <div className="text-lg font-bold" style={{ color: '#44062D' }}>R{provider.hourlyRate}</div>
                      <div className="text-xs" style={{ color: '#3C0920' }}>per hour</div>
                    </div>
                    <Button
                      onClick={() => onBookService(
                        getServiceForProvider(provider.specialties),
                        provider.id,
                        provider.name
                      )}
                      size="sm"
                      className="font-semibold px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-xs text-white hover:opacity-90"
                      style={{ backgroundColor: '#8B4789' }}
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
        <div className="text-center bg-white rounded-3xl p-12 border shadow-lg" style={{ borderColor: '#EED1C4' }}>
          <div className="max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold mb-4" style={{ color: '#44062D' }}>
              Want to become a Berry Star?
            </h3>
            <p className="text-lg mb-8" style={{ color: '#3C0920' }}>
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
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white" style={{ backgroundColor: '#C56B86' }}>
                    <benefit.icon className="h-8 w-8" />
                  </div>
                  <h4 className="font-semibold mb-2" style={{ color: '#44062D' }}>{benefit.title}</h4>
                  <p className="text-sm" style={{ color: '#3C0920' }}>{benefit.description}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="font-semibold px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-white"
                style={{ backgroundColor: '#C56B86' }}
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
                className="border-2 font-semibold px-10 py-4 rounded-xl transition-all duration-300"
                style={{ borderColor: '#C56B86', color: '#C56B86' }}
                onClick={() => setLocation('/services')}
                data-testid="button-browse-services"
              >
                <Heart className="mr-2 h-5 w-5" />
                Service Catalog
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}