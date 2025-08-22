import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  CheckCircle2
} from "lucide-react";

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  icon: React.ComponentType<any>;
  basePrice: number;
  estimatedDuration: number;
  features: string[];
  popular?: boolean;
  urgent?: boolean;
}

interface EnhancedServicesProps {
  onServiceSelect: (serviceId: string) => void;
}

export default function EnhancedServices({ onServiceSelect }: EnhancedServicesProps) {
  const serviceCategories = [
    {
      id: "indoor-services",
      name: "Indoor Services",
      description: "Professional cleaning and organization",
      color: "blue",
      services: [
        {
          id: "house-cleaning",
          name: "House Cleaning",
          description: "Professional deep cleaning for your entire home",
          category: "indoor-services",
          subcategory: "cleaning",
          icon: Home as React.ComponentType<any>,
          basePrice: 280,
          estimatedDuration: 180,
          features: ["Deep clean", "Sanitization", "Eco-friendly products", "Insurance covered"],
          popular: true,
        },
        {
          id: "laundry-ironing",
          name: "Laundry & Ironing",
          description: "Complete laundry service with professional ironing",
          category: "indoor-services", 
          subcategory: "laundry",
          icon: Coffee as React.ComponentType<any>,
          basePrice: 150,
          estimatedDuration: 120,
          features: ["Wash & fold", "Professional ironing", "Stain treatment", "Same day service"],
        },
      ]
    },
    {
      id: "outdoor-services",
      name: "Outdoor Services", 
      description: "Garden and exterior maintenance",
      color: "green",
      services: [
        {
          id: "garden-maintenance",
          name: "Garden Maintenance",
          description: "Complete garden care and landscaping services",
          category: "outdoor-services",
          subcategory: "gardening",
          icon: TreePine as React.ComponentType<any>,
          basePrice: 350,
          estimatedDuration: 240,
          features: ["Lawn mowing", "Pruning", "Weeding", "Plant care"],
        },
        {
          id: "car-washing",
          name: "Car Washing",
          description: "Professional car cleaning and detailing",
          category: "outdoor-services",
          subcategory: "automotive",
          icon: Car as React.ComponentType<any>,
          basePrice: 120,
          estimatedDuration: 90,
          features: ["Interior cleaning", "Exterior wash", "Wax finish", "Tire shine"],
        },
      ]
    },
    {
      id: "maintenance",
      name: "Home Maintenance",
      description: "Repairs and technical services",
      color: "orange",
      services: [
        {
          id: "plumbing-services",
          name: "Plumbing Services",
          description: "Emergency and general plumbing repairs",
          category: "maintenance",
          subcategory: "plumbing",
          icon: Droplet as React.ComponentType<any>,
          basePrice: 400,
          estimatedDuration: 120,
          features: ["Emergency service", "Licensed plumbers", "Parts included", "Warranty"],
          urgent: true,
        },
        {
          id: "electrical-work",
          name: "Electrical Work",
          description: "Safe and certified electrical repairs",
          category: "maintenance",
          subcategory: "electrical",
          icon: Zap as React.ComponentType<any>,
          basePrice: 450,
          estimatedDuration: 150,
          features: ["Certified electricians", "Safety first", "Code compliant", "Emergency available"],
          urgent: true,
        },
      ]
    },
    {
      id: "specialized-services",
      name: "Specialized Services",
      description: "Expert services for special occasions",
      color: "purple",
      services: [
        {
          id: "chef-catering",
          name: "Chef & Catering",
          description: "Professional chefs for events and daily meals",
          category: "specialized-services",
          subcategory: "culinary",
          icon: ChefHat as React.ComponentType<any>,
          basePrice: 550,
          estimatedDuration: 240,
          features: ["African cuisine", "Event catering", "Custom menus", "Professional service"],
          popular: true,
        },
        {
          id: "elder-care",
          name: "Elder Care",
          description: "Compassionate care for elderly family members",
          category: "specialized-services",
          subcategory: "caregiving",
          icon: Heart as React.ComponentType<any>,
          basePrice: 300,
          estimatedDuration: 480,
          features: ["Certified caregivers", "24/7 availability", "Medical assistance", "Companionship"],
        },
      ]
    }
  ];

  const getCategoryColor = (color: string) => {
    const colors = {
      blue: "from-blue-500 to-cyan-500",
      green: "from-green-500 to-emerald-500", 
      orange: "from-orange-500 to-red-500",
      purple: "from-purple-500 to-pink-500",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const formatPrice = (price: number) => {
    return `R${price}`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    return hours > 0 ? `${hours}h` : `${minutes}m`;
  };

  return (
    <section className="py-16 lg:py-24 bg-gray-50" id="services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 text-sm font-semibold border-0 mb-4">
            <Star className="h-4 w-4 mr-2" />
            Comprehensive Home Services
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            All your home needs,
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              one platform
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            From routine cleaning to emergency repairs, our vetted professionals deliver 
            exceptional service with guaranteed satisfaction and full insurance coverage.
          </p>
        </div>

        {/* Service Categories Grid */}
        <div className="space-y-16">
          {serviceCategories.map((category) => (
            <div key={category.id} className="space-y-8">
              {/* Category Header */}
              <div className="text-center">
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                  {category.name}
                </h3>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                  {category.description}
                </p>
              </div>

              {/* Services Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {category.services.map((service) => (
                  <div
                    key={service.id}
                    className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-gray-200"
                    data-testid={`service-card-${service.id}`}
                  >
                    {/* Service Badge */}
                    <div className="absolute top-4 right-4 z-10 flex gap-2">
                      {service.popular && (
                        <Badge className="bg-green-500 text-white border-0">
                          <Star className="h-3 w-3 mr-1" />
                          Popular
                        </Badge>
                      )}
                      {service.urgent && (
                        <Badge className="bg-red-500 text-white border-0">
                          <Clock className="h-3 w-3 mr-1" />
                          24/7
                        </Badge>
                      )}
                    </div>

                    {/* Header with Icon */}
                    <div className={`bg-gradient-to-r ${getCategoryColor(category.color)} p-8 text-white relative`}>
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                          <service.icon className="h-8 w-8" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xl font-bold mb-2">{service.name}</h4>
                          <p className="text-white/90 text-sm leading-relaxed">
                            {service.description}
                          </p>
                        </div>
                      </div>
                      
                      {/* Decorative Elements */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                      {/* Pricing & Duration */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">
                            {formatPrice(service.basePrice)}
                          </div>
                          <div className="text-sm text-gray-500">starting from</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-700">
                            {formatDuration(service.estimatedDuration)}
                          </div>
                          <div className="text-sm text-gray-500">duration</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center">
                            <Shield className="h-5 w-5 text-green-500 mr-1" />
                          </div>
                          <div className="text-sm text-gray-500">insured</div>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="space-y-3 mb-8">
                        {service.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="text-gray-700 text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* CTA Button */}
                      <Button
                        onClick={() => onServiceSelect(service.id)}
                        className="w-full bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 group-hover:shadow-lg"
                        data-testid={`button-book-${service.id}`}
                      >
                        Book {service.name}
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <div className="mt-20 text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white">
          <h3 className="text-3xl font-bold mb-4">
            Need a custom service package?
          </h3>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Our team can create a personalized service plan that fits your specific needs and budget.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => onServiceSelect('custom-package')}
              className="bg-white text-blue-600 hover:bg-gray-50 font-semibold px-8 py-3 rounded-xl shadow-lg"
              data-testid="button-custom-package"
            >
              Request Custom Package
            </Button>
            <Button
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-3 rounded-xl"
              onClick={() => {
                const contactSection = document.getElementById('contact');
                contactSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              data-testid="button-contact-us"
            >
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}