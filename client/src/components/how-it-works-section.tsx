import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Search, 
  UserCheck, 
  Calendar, 
  CreditCard, 
  CheckCircle2,
  Play,
  ArrowRight,
  Star,
  Clock,
  Shield,
  Home,
  Droplet,
  Zap,
  Leaf,
  ChefHat,
  Users,
  Truck,
  Heart,
  X
} from "lucide-react";

const steps = [
  {
    id: 1,
    title: "Search & Select",
    description: "Browse services or describe what you need. Our smart matching finds the perfect professionals in your area.",
    icon: Search,
    color: "from-blue-500 to-cyan-500",
    features: ["Smart search", "Location matching", "Real-time availability"]
  },
  {
    id: 2,
    title: "Choose Provider",
    description: "Review verified professionals with ratings, reviews, and transparent pricing. Pick your preferred expert.",
    icon: UserCheck,
    color: "from-green-500 to-emerald-500",
    features: ["Verified professionals", "Customer reviews", "Transparent pricing"]
  },
  {
    id: 3,
    title: "Schedule Service",
    description: "Pick your convenient date and time. Flexible scheduling with same-day and emergency options available.",
    icon: Calendar,
    color: "from-purple-500 to-pink-500", 
    features: ["Flexible timing", "Same-day service", "Emergency bookings"]
  },
  {
    id: 4,
    title: "Secure Payment",
    description: "Pay safely through our platform. Funds held securely until service completion guarantees quality.",
    icon: CreditCard,
    color: "from-orange-500 to-red-500",
    features: ["Secure payments", "Escrow protection", "Multiple payment methods"]
  },
  {
    id: 5,
    title: "Service Delivered",
    description: "Enjoy professional service with real-time updates. Rate your experience when complete.",
    icon: CheckCircle2,
    color: "from-indigo-500 to-purple-500",
    features: ["Real-time tracking", "Quality guarantee", "Easy reviews"]
  }
];

// Service interface matching comprehensive-services
interface Service {
  id: string;
  category: string;
  title: string;
  description: string;
  price: string;
  duration: string;
  popular?: boolean;
  urgent?: boolean;
  icon: React.ComponentType<any>;
  gradient: string;
}

// All services data - imported from comprehensive-services structure
const allServices: Service[] = [
  // INDOOR SERVICES
  {
    id: "cleaning",
    category: "Indoor Services",
    title: "House Cleaning",
    description: "Complete cleaning services from regular maintenance to deep cleaning",
    price: "From R75/hour",
    duration: "2-6 hours",
    popular: true,
    icon: Home,
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    id: "plumbing",
    category: "Indoor Services", 
    title: "Plumbing Services",
    description: "Professional plumbing solutions from emergency repairs to installations",
    price: "From R120/hour",
    duration: "1-4 hours",
    urgent: true,
    icon: Droplet,
    gradient: "from-cyan-500 to-blue-600"
  },
  {
    id: "electrical",
    category: "Indoor Services",
    title: "Electrical Services", 
    description: "Safe and certified electrical work including installations and repairs",
    price: "From R150/hour",
    duration: "1-8 hours",
    urgent: true,
    icon: Zap,
    gradient: "from-yellow-500 to-orange-500"
  },

  // OUTDOOR SERVICES
  {
    id: "garden-care",
    category: "Outdoor Services",
    title: "Garden Care",
    description: "Complete garden maintenance from landscaping to regular upkeep",
    price: "From R85/hour", 
    duration: "2-8 hours",
    popular: true,
    icon: Leaf,
    gradient: "from-green-500 to-emerald-600"
  },

  // SPECIALIZED SERVICES
  {
    id: "chef-catering",
    category: "Specialized Services",
    title: "Chef & Catering",
    description: "Professional cooking services specializing in African cuisine",
    price: "From R200/hour",
    duration: "2-8 hours",
    popular: true,
    icon: ChefHat,
    gradient: "from-orange-500 to-red-500"
  },
  {
    id: "waitering",
    category: "Specialized Services",
    title: "Waitering Services", 
    description: "Professional waitering staff for events and special occasions",
    price: "From R90/hour",
    duration: "4-12 hours",
    icon: Users,
    gradient: "from-purple-500 to-pink-500"
  },
  {
    id: "moving",
    category: "Specialized Services",
    title: "Moving Services",
    description: "Reliable moving and relocation services for homes and offices",
    price: "From R150/hour",
    duration: "4-8 hours",
    icon: Truck,
    gradient: "from-indigo-500 to-purple-600"
  },
  {
    id: "au-pair",
    category: "Specialized Services", 
    title: "Au Pair Services",
    description: "Trusted childcare and family support services",
    price: "From R60/hour",
    duration: "4-12 hours",
    icon: Heart,
    gradient: "from-pink-500 to-rose-500"
  }
];

interface HowItWorksSectionProps {
  onBookNowClick?: (serviceId?: string) => void;
}

export default function HowItWorksSection({ onBookNowClick }: HowItWorksSectionProps) {
  const [showServiceSelector, setShowServiceSelector] = useState(false);

  const handleServiceSelect = (serviceId: string) => {
    setShowServiceSelector(false);
    onBookNowClick?.(serviceId);
  };
  return (
    <section className="py-16 lg:py-24 bg-white" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 text-sm font-semibold border-0 mb-4">
            <Play className="h-4 w-4 mr-2" />
            Simple Process
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            How Berry Events
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              works for you
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            From booking to completion, we've streamlined every step to ensure 
            you get exceptional service with complete peace of mind.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-16">
          {steps.map((step, index) => (
            <div key={step.id} className="relative group">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-gray-200 to-gray-300 z-0">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
                </div>
              )}

              {/* Step Card */}
              <div className="relative bg-white rounded-xl border-2 border-gray-100 p-4 hover:border-gray-200 hover:shadow-lg transition-all duration-300 group-hover:scale-105 z-10">
                {/* Step Number */}
                <div className="absolute -top-3 left-4">
                  <div className={`w-6 h-6 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg`}>
                    {step.id}
                  </div>
                </div>

                {/* Icon */}
                <div className={`w-12 h-12 bg-gradient-to-r ${step.color} rounded-lg flex items-center justify-center mb-4 mx-auto shadow-md`}>
                  <step.icon className="h-6 w-6 text-white" />
                </div>

                {/* Content */}
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-xs leading-relaxed mb-3">
                    {step.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-1">
                    {step.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center justify-center text-xs text-gray-500">
                        <CheckCircle2 className="h-3 w-3 text-green-500 mr-1 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Demo Section */}
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-8 lg:p-12 border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Demo Content */}
            <div>
              <Badge className="bg-green-100 text-green-700 px-4 py-2 text-sm font-semibold border-0 mb-4">
                <Star className="h-4 w-4 mr-2" />
                Try It Now
              </Badge>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                See it in action
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                Experience our streamlined booking process. From finding the right professional 
                to scheduling and payment - everything happens in under 2 minutes.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Average booking time: 2 minutes</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Shield className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-gray-700 font-medium">100% secure payment processing</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Star className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-gray-700 font-medium">4.9/5 average customer satisfaction</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => setShowServiceSelector(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  data-testid="button-book-now-demo"
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Book Your First Service
                </Button>
                
                <Button 
                  variant="outline"
                  className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold px-8 py-3 rounded-xl transition-all duration-200"
                  onClick={() => {
                    const demoVideo = document.getElementById('demo-video');
                    if (demoVideo) {
                      demoVideo.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  data-testid="button-watch-demo-video"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo Video
                </Button>
              </div>
            </div>

            {/* Demo Visual */}
            <div className="relative">
              {/* Phone Mockup */}
              <div className="relative mx-auto w-80 h-96 bg-gray-900 rounded-3xl p-2 shadow-2xl">
                <div className="w-full h-full bg-white rounded-2xl overflow-hidden relative">
                  {/* Status Bar */}
                  <div className="h-8 bg-gray-50 flex items-center justify-between px-4 text-xs text-gray-600">
                    <span>9:41</span>
                    <div className="flex space-x-1">
                      <div className="w-4 h-2 bg-green-500 rounded-sm"></div>
                      <div className="w-4 h-2 bg-green-500 rounded-sm"></div>
                      <div className="w-4 h-2 bg-green-500 rounded-sm"></div>
                    </div>
                  </div>

                  {/* App Interface */}
                  <div className="p-4 h-full bg-gradient-to-b from-blue-50 to-white">
                    {/* Header */}
                    <div className="mb-6">
                      <h4 className="text-lg font-bold text-gray-900">Berry Events</h4>
                      <p className="text-sm text-gray-600">Book your service</p>
                    </div>

                    {/* Service Cards */}
                    <div className="space-y-3">
                      <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Search className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">House Cleaning</p>
                            <p className="text-xs text-gray-500">R280/hour</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <UserCheck className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">Garden Care</p>
                            <p className="text-xs text-gray-500">R350/hour</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <CheckCircle2 className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">Plumbing</p>
                            <p className="text-xs text-gray-500">R400/hour</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    {/* Book Button */}
                    <div className="absolute bottom-6 left-4 right-4">
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-3 text-center text-sm font-semibold shadow-lg">
                        Book Selected Service
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-green-500 text-white rounded-full p-3 shadow-lg animate-bounce">
                <CheckCircle2 className="h-6 w-6" />
              </div>

              <div className="absolute -bottom-4 -left-4 bg-blue-500 text-white rounded-full p-3 shadow-lg animate-pulse">
                <Star className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Service Selection Modal */}
        <Dialog open={showServiceSelector} onOpenChange={setShowServiceSelector}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-2xl font-bold">Choose Your Service</DialogTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowServiceSelector(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-gray-600 mt-2">
                Select from our complete range of professional home services
              </p>
            </DialogHeader>

            <div className="mt-6 space-y-8">
              {/* Group services by category */}
              {["Indoor Services", "Outdoor Services", "Specialized Services"].map((category) => {
                const categoryServices = allServices.filter(s => s.category === category);
                const categoryInfo = {
                  "Indoor Services": { icon: Home, color: "from-blue-500 to-cyan-500" },
                  "Outdoor Services": { icon: Leaf, color: "from-green-500 to-emerald-500" },
                  "Specialized Services": { icon: Star, color: "from-purple-500 to-pink-500" }
                };
                const info = categoryInfo[category as keyof typeof categoryInfo];
                
                return (
                  <div key={category}>
                    <div className="flex items-center mb-4">
                      <div className={`w-8 h-8 bg-gradient-to-r ${info.color} rounded-lg flex items-center justify-center mr-3`}>
                        <info.icon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{category}</h3>
                      <Badge className="ml-3 bg-gray-100 text-gray-700">
                        {categoryServices.length} services
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoryServices.map((service) => (
                        <div
                          key={service.id}
                          onClick={() => handleServiceSelect(service.id)}
                          className="bg-white border border-gray-200 rounded-xl p-4 hover:border-primary/30 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                          data-testid={`service-selector-${service.id}`}
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            <div className={`w-12 h-12 bg-gradient-to-r ${service.gradient} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                              <service.icon className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                                {service.title}
                              </h4>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-sm font-medium text-primary">
                                  {service.price}
                                </span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-500">
                                  {service.duration}
                                </span>
                              </div>
                            </div>
                            {(service.popular || service.urgent) && (
                              <div className="flex flex-col space-y-1">
                                {service.popular && (
                                  <Badge className="bg-green-100 text-green-700 text-xs px-2 py-1">
                                    Popular
                                  </Badge>
                                )}
                                {service.urgent && (
                                  <Badge className="bg-red-100 text-red-700 text-xs px-2 py-1">
                                    24/7
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            {service.description}
                          </p>
                          <Button
                            size="sm"
                            className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleServiceSelect(service.id);
                            }}
                          >
                            Book Now
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}