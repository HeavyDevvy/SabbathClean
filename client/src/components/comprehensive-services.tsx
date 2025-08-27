import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import ModernServiceModal from "@/components/modern-service-modal";
import { useState } from "react";
import { 
  Home, 
  TreePine, 
  Droplet, 
  Zap, 
  ChefHat, 
  Coffee,
  Car,
  Heart,
  Baby,
  PaintBucket,
  Wrench,
  Shield,
  Star,
  Clock,
  ArrowRight,
  CheckCircle2,
  Truck,
  Users,
  Sparkles,
  Calendar,
  MapPin
} from "lucide-react";

interface ServiceType {
  name: string;
  description: string;
  duration: string;
  priceRange: string;
}

interface Service {
  id: string;
  category: string;
  title: string;
  description: string;
  price: string;
  duration: string;
  popular?: boolean;
  urgent?: boolean;
  serviceTypes: string[];
  features: string[];
  icon: React.ComponentType<any>;
  gradient: string;
  bookingSteps: number;
}

interface ComprehensiveServicesProps {
  onServiceSelect: (serviceId: string) => void;
}

const services: Service[] = [
  // CLEANING SERVICES
  {
    id: "cleaning",
    category: "Indoor Services",
    title: "House Cleaning",
    description: "Complete cleaning services from regular maintenance to deep cleaning with professional-grade equipment",
    price: "From R75/hour",
    duration: "2-6 hours",
    popular: true,
    serviceTypes: [
      "Regular House Cleaning (Weekly/Bi-weekly/Monthly)",
      "Deep Cleaning (Spring cleaning, move-in/move-out)", 
      "Office Cleaning (Daily/Weekly/Monthly contracts)",
      "Carpet & Upholstery Cleaning",
      "Window Cleaning (Interior/Exterior)",
      "Post-Construction Cleaning",
      "Event Cleanup Services"
    ],
    features: ["Professional equipment", "Eco-friendly products", "Insured cleaners", "Flexible scheduling"],
    icon: Home,
    gradient: "from-blue-500 to-cyan-500",
    bookingSteps: 5
  },

  // PLUMBING SERVICES
  {
    id: "plumbing",
    category: "Maintenance",
    title: "Plumbing Services",
    description: "Professional plumbing solutions from emergency repairs to complete installations with certified plumbers",
    price: "From R120/hour",
    duration: "1-4 hours",
    urgent: true,
    serviceTypes: [
      "Emergency Repairs (24/7 availability)",
      "Installation Services (taps, toilets, showers)",
      "Drain Cleaning & Unblocking",
      "Leak Detection & Repair",
      "Water Heater Services",
      "Pipe Replacement & Maintenance",
      "Bathroom & Kitchen Plumbing"
    ],
    features: ["24/7 emergency service", "Licensed plumbers", "Parts included", "Insurance coverage"],
    icon: Droplet,
    gradient: "from-cyan-500 to-blue-600",
    bookingSteps: 4
  },

  // ELECTRICAL SERVICES
  {
    id: "electrical",
    category: "Maintenance",
    title: "Electrical Services",
    description: "Safe and certified electrical work including installations, repairs, and compliance certificates",
    price: "From R150/hour",
    duration: "1-8 hours",
    urgent: true,
    serviceTypes: [
      "Emergency Electrical Repairs",
      "Installation (lights, outlets, ceiling fans)",
      "Electrical Inspections & Certificates",
      "DB Board & Circuit Repairs",
      "Smart Home Installation",
      "Solar Panel Installation & Maintenance",
      "Appliance Installation & Repair"
    ],
    features: ["Licensed electricians", "Safety certificates", "Emergency response", "Code compliance"],
    icon: Zap,
    gradient: "from-yellow-500 to-orange-500",
    bookingSteps: 4
  },

  // CHEF & CATERING SERVICES
  {
    id: "chef-catering",
    category: "Specialized",
    title: "Chef & Catering",
    description: "Professional chefs specializing in African cuisine and international dishes for events and daily meals",
    price: "From R400/event",
    duration: "2-12 hours",
    popular: true,
    serviceTypes: [
      "Personal Chef (daily/weekly meal prep)",
      "Event Catering (parties, corporate events)",
      "Cooking Classes (individual/group)",
      "African Cuisine Specialists",
      "Dietary Requirements (vegan, keto, halaal, kosher)",
      "Waitering Services",
      "Bartending Services"
    ],
    features: ["African cuisine expertise", "Event specialists", "Dietary accommodations", "Full service teams"],
    icon: ChefHat,
    gradient: "from-green-500 to-emerald-500",
    bookingSteps: 4
  },

  // MOVING SERVICES
  {
    id: "moving",
    category: "Specialized",
    title: "Moving Services",
    description: "Complete moving solutions from local relocations to long-distance moves with professional teams",
    price: "From R600/day",
    duration: "4-12 hours",
    serviceTypes: [
      "Local Moving (same city)",
      "Long-distance Moving (intercity/interstate)",
      "Office Relocation",
      "Furniture Moving & Assembly",
      "Packing & Unpacking Services",
      "Storage Solutions",
      "Piano & Specialty Item Moving"
    ],
    features: ["Professional movers", "Insured service", "Packing materials", "Storage options"],
    icon: Truck,
    gradient: "from-purple-500 to-pink-500",
    bookingSteps: 5
  },

  // AU PAIR SERVICES
  {
    id: "au-pair",
    category: "Specialized",
    title: "Au Pair Services",
    description: "Trusted childcare providers offering flexible care solutions from occasional babysitting to live-in arrangements",
    price: "From R65/hour",
    duration: "4 hours - 12 months",
    serviceTypes: [
      "Live-in Au Pair (6-12 month contracts)",
      "Part-time Childcare",
      "After-school Care",
      "Weekend & Holiday Care",
      "Overnight Babysitting",
      "Educational Support & Tutoring",
      "Activity Planning & Outings"
    ],
    features: ["Background checked", "Experienced caregivers", "Flexible schedules", "Educational support"],
    icon: Baby,
    gradient: "from-pink-500 to-rose-500",
    bookingSteps: 4
  },

  // GARDEN CARE
  {
    id: "garden-care",
    category: "Outdoor Services",
    title: "Garden Care",
    description: "Professional garden maintenance and landscaping services to keep your outdoor spaces beautiful",
    price: "From R90/hour",
    duration: "2-8 hours",
    serviceTypes: [
      "Regular Garden Maintenance",
      "Landscaping Design & Installation",
      "Tree Trimming & Removal",
      "Lawn Care & Mowing",
      "Irrigation System Installation",
      "Garden Cleanup Services",
      "Plant Care & Consultation"
    ],
    features: ["Garden specialists", "Professional tools", "Plant expertise", "Design consultation"],
    icon: TreePine,
    gradient: "from-green-600 to-emerald-600",
    bookingSteps: 4
  },

  // WAITERING SERVICES
  {
    id: "waitering",
    category: "Specialized", 
    title: "Waitering Services",
    description: "Professional event staff and waitering services for parties, corporate events, and special occasions",
    price: "From R85/hour",
    duration: "4-12 hours",
    serviceTypes: [
      "Event Waitering Staff",
      "Corporate Event Service",
      "Private Party Servers",
      "Bartending Services",
      "Event Setup & Cleanup",
      "Professional Table Service",
      "Cocktail Party Staff"
    ],
    features: ["Trained professionals", "Event specialists", "Bar service", "Setup assistance"],
    icon: Users,
    gradient: "from-indigo-500 to-purple-500",
    bookingSteps: 4
  }
];

const categories = [
  {
    id: "indoor-services",
    name: "Indoor Services",
    description: "Professional cleaning and home organization",
    color: "blue",
    icon: Home
  },
  {
    id: "outdoor-services", 
    name: "Outdoor Services",
    description: "Garden care and exterior maintenance",
    color: "green",
    icon: TreePine
  },
  {
    id: "maintenance",
    name: "Maintenance",
    description: "Plumbing, electrical, and repair services",
    color: "orange", 
    icon: Wrench
  },
  {
    id: "specialized",
    name: "Specialized",
    description: "Chef, moving, childcare, and event services",
    color: "purple",
    icon: Star
  }
];

export default function ComprehensiveServices({ onServiceSelect }: ComprehensiveServicesProps) {
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const getServicesByCategory = (categoryId: string) => {
    const categoryMap: { [key: string]: string } = {
      "indoor-services": "Indoor Services",
      "outdoor-services": "Outdoor Services", 
      "maintenance": "Maintenance",
      "specialized": "Specialized"
    };
    return services.filter(service => service.category === categoryMap[categoryId]);
  };

  const getColorClasses = (color: string) => {
    const colors: { [key: string]: string } = {
      blue: "border-blue-200 bg-blue-50 text-blue-700",
      green: "border-green-200 bg-green-50 text-green-700",
      orange: "border-orange-200 bg-orange-50 text-orange-700", 
      purple: "border-purple-200 bg-purple-50 text-purple-700"
    };
    return colors[color] || colors.blue;
  };

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 to-blue-50" data-testid="comprehensive-services-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 text-sm font-semibold border-0 mb-4">
            <Sparkles className="h-4 w-4 mr-2" />
            Complete Home Services
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Everything your home needs,
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              all in one platform
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            From emergency repairs to regular maintenance, event catering to childcare - 
            professional services delivered by verified South African specialists.
          </p>
        </div>

        {/* Service Categories - Compact Design */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-12">
          {categories.map((category) => (
            <Card key={category.id} className={`border ${getColorClasses(category.color)} hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden`}>
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-current to-current bg-opacity-20 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                  <category.icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold mb-1">{category.name}</h3>
                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                  {getServicesByCategory(category.id).length} services
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Services Grid by Category */}
        {categories.map((category) => {
          const categoryServices = getServicesByCategory(category.id);
          if (categoryServices.length === 0) return null;

          return (
            <div key={category.id} className="mb-16">
              <div className="flex items-center mb-8">
                <category.icon className={`h-8 w-8 mr-3 ${getColorClasses(category.color).split(' ')[2]}`} />
                <h3 className="text-3xl font-bold text-gray-900">{category.name}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categoryServices.map((service) => (
                  <Card key={service.id} className="bg-white border border-gray-100 hover:border-primary/20 hover:shadow-2xl transition-all duration-300 group cursor-pointer rounded-2xl overflow-hidden h-full flex flex-col hover:-translate-y-3 transform" data-testid={`service-card-${service.id}`} onClick={() => {
                    setSelectedServiceId(service.id);
                    setShowServiceModal(true);
                  }}>
                    <CardContent className="p-6 flex flex-col h-full">
                      {/* Service Header - Compact */}
                      <div className="relative mb-4">
                        <div className={`w-16 h-16 bg-gradient-to-br ${service.gradient} rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300 mx-auto`}>
                          <service.icon className="h-8 w-8 text-white" />
                        </div>
                        {(service.popular || service.urgent) && (
                          <div className="absolute -top-1 -right-1">
                            {service.popular && (
                              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 text-xs px-1.5 py-0.5">
                                <Star className="h-2 w-2 mr-0.5" />
                                Hot
                              </Badge>
                            )}
                            {service.urgent && (
                              <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 text-xs px-1.5 py-0.5">
                                24/7
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Enhanced Service Info */}
                      <div className="mb-4 text-center">
                        <span className="text-xs bg-gradient-to-r from-primary/10 to-purple-600/10 text-primary px-3 py-1 rounded-full font-medium border border-primary/20 mb-3 inline-block">
                          {service.category}
                        </span>
                        <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">{service.title}</h4>
                        <p className="text-gray-600 text-sm leading-relaxed mb-3">{service.description}</p>
                        
                        <div className="bg-gradient-to-r from-primary/5 to-purple-600/5 rounded-lg py-2 px-3 mb-3">
                          <div className="text-lg font-bold text-primary">{service.price}</div>
                          <div className="text-xs text-gray-500">Duration: {service.duration}</div>
                        </div>
                      </div>

                      {/* Enhanced Key Features and Badges */}
                      <div className="space-y-3 mb-5">
                        {/* Key features with modern icons */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <span className="flex items-center justify-center bg-green-50 text-green-700 py-1 px-2 rounded">
                            <Clock className="h-3 w-3 mr-1" />
                            Same day
                          </span>
                          <span className="flex items-center justify-center bg-yellow-50 text-yellow-700 py-1 px-2 rounded">
                            <Star className="h-3 w-3 mr-1" />
                            4.8+ rated
                          </span>
                          <span className="flex items-center justify-center bg-blue-50 text-blue-700 py-1 px-2 rounded">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified
                          </span>
                          <span className="flex items-center justify-center bg-purple-50 text-purple-700 py-1 px-2 rounded">
                            <MapPin className="h-3 w-3 mr-1" />
                            20km
                          </span>
                        </div>

                        {/* Discount highlights */}
                        <div className="text-xs text-green-600 font-medium">
                          Weekly: -15% | Materials: -15% | Early: -10%
                        </div>

                        {/* Service Types Preview */}
                        <div className="space-y-1 max-h-16 overflow-y-auto">
                          {service.serviceTypes.slice(0, 2).map((type, index) => (
                            <div key={index} className="flex items-start text-xs text-gray-600">
                              <CheckCircle2 className="h-2.5 w-2.5 text-green-500 mr-1.5 flex-shrink-0 mt-0.5" />
                              <span className="line-clamp-1">{type}</span>
                            </div>
                          ))}
                          {service.serviceTypes.length > 2 && (
                            <div className="text-xs text-blue-600 font-medium text-center">
                              +{service.serviceTypes.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Enhanced Book Now Button with Advanced Modal */}
                      <div className="mt-auto space-y-2">
                        <Button 
                          onClick={() => {
                            setSelectedServiceId(service.id);
                            setShowServiceModal(true);
                          }}
                          className="w-full bg-gradient-to-r from-primary via-purple-600 to-primary hover:from-primary/90 hover:via-purple-600/90 hover:to-primary/90 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                          data-testid={`book-${service.id}`}
                        >
                          Book Now - Advanced Booking
                          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                        </Button>
                        <button
                          className="w-full bg-white hover:bg-gray-50 text-primary font-medium py-2 px-4 rounded-lg transition-all duration-200 border border-primary/20 hover:border-primary/40 text-sm"
                          onClick={() => onServiceSelect(service.id)}
                        >
                          Quick Quote & Details
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}

        {/* Bottom CTA */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 lg:p-12 text-white">
          <h3 className="text-3xl font-bold mb-4">
            Need a custom service solution?
          </h3>
          <p className="text-blue-100 text-lg mb-6 max-w-2xl mx-auto">
            Our platform connects you with verified professionals for any home service need. 
            Book multiple services together for better coordination and pricing.
          </p>
          <Button 
            variant="secondary" 
            size="lg" 
            className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-3"
            data-testid="contact-custom-services"
          >
            Contact Us for Custom Solutions
          </Button>
        </div>
      </div>

      {/* Modern Service Modal */}
      <ModernServiceModal
        isOpen={showServiceModal}
        onClose={() => setShowServiceModal(false)}
        serviceId={selectedServiceId}
        onBookingComplete={(bookingData) => {
          console.log("Booking completed:", bookingData);
          setShowServiceModal(false);
          // Remove onServiceSelect call to prevent service card interference
        }}
      />
    </section>
  );
}