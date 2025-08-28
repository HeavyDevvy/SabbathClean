import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ModernServiceModal from "@/components/modern-service-modal";
import { useState } from "react";
import { 
  Home, 
  TreePine, 
  Droplet, 
  Zap, 
  ChefHat, 
  Coffee,
  Wrench,
  Shield,
  ArrowRight,
  Star,
  Clock
} from "lucide-react";

interface MinimalistServicesProps {
  onServiceSelect: (serviceId: string) => void;
}

// Simplified service structure focusing on core offerings
const services = [
  {
    id: "cleaning",
    title: "House Cleaning",
    description: "Professional cleaning services for your home",
    price: "From R75/hour",
    duration: "2-4 hours",
    popular: true,
    icon: Home,
    features: ["Regular & deep cleaning", "Eco-friendly products", "Insured professionals"]
  },
  {
    id: "garden-care", 
    title: "Garden Care",
    description: "Complete garden maintenance and landscaping",
    price: "From R180/hour",
    duration: "2-6 hours", 
    icon: TreePine,
    features: ["Lawn mowing", "Garden cleanup", "Plant care"]
  },
  {
    id: "plumbing",
    title: "Plumbing",
    description: "Quick plumbing repairs and installations",
    price: "From R350/hour",
    duration: "1-3 hours",
    urgent: true,
    icon: Droplet,
    features: ["24/7 emergency", "Licensed plumbers", "Fixed pricing"]
  },
  {
    id: "electrical",
    title: "Electrical",
    description: "Safe electrical repairs and installations", 
    price: "From R280/hour",
    duration: "1-4 hours",
    urgent: true,
    icon: Zap,
    features: ["Certified electricians", "Safety guaranteed", "Transparent pricing"]
  },
  {
    id: "chef-catering",
    title: "Chef & Catering", 
    description: "Authentic African cuisine for your events",
    price: "From R450/event",
    duration: "3-8 hours",
    icon: ChefHat,
    features: ["Traditional recipes", "Fresh ingredients", "Event planning"]
  },
  {
    id: "handyman",
    title: "Handyman",
    description: "General repairs and home maintenance",
    price: "From R250/hour", 
    duration: "1-5 hours",
    icon: Wrench,
    features: ["Furniture assembly", "Wall mounting", "General repairs"]
  }
];

export default function MinimalistServices({ onServiceSelect }: MinimalistServicesProps) {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleServiceClick = (serviceId: string) => {
    setSelectedService(serviceId);
    setIsModalOpen(true);
    onServiceSelect(serviceId);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedService(null);
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Professional Home Services
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Book trusted, verified professionals for all your home service needs. 
            Quality guaranteed, transparent pricing.
          </p>
        </div>

        {/* Services Grid - Clean and Spacious */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service) => (
            <Card
              key={service.id}
              className="group relative overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer bg-white"
              onClick={() => handleServiceClick(service.id)}
              data-testid={`service-card-${service.id}`}
            >
              <CardContent className="p-8">
                {/* Service Icon */}
                <div className="mb-6">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <service.icon className="w-8 h-8 text-blue-600" />
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {service.popular && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                      <Star className="w-3 h-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                  {service.urgent && (
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                      <Clock className="w-3 h-3 mr-1" />
                      24/7 Available
                    </Badge>
                  )}
                </div>

                {/* Service Info */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {service.description}
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <Shield className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Pricing */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{service.price}</p>
                    <p className="text-sm text-gray-500">{service.duration}</p>
                  </div>
                  <div className="flex items-center text-blue-600 group-hover:text-blue-700">
                    <span className="text-sm font-medium mr-2">Book Now</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Indicators - Simplified */}
        <div className="bg-gray-50 rounded-3xl p-8 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">50,000+</div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">1,500+</div>
              <div className="text-gray-600">Verified Professionals</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">4.9★</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
          </div>
        </div>

        {/* How It Works - Streamlined */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-blue-600 font-bold text-lg">1</span>
              </div>
              <h4 className="font-semibold text-gray-900">Select Service</h4>
              <p className="text-gray-600">Choose from our professional home services</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-blue-600 font-bold text-lg">2</span>
              </div>
              <h4 className="font-semibold text-gray-900">Book & Pay</h4>
              <p className="text-gray-600">Schedule your service and pay securely</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-blue-600 font-bold text-lg">3</span>
              </div>
              <h4 className="font-semibold text-gray-900">Enjoy Results</h4>
              <p className="text-gray-600">Relax while professionals handle the work</p>
            </div>
          </div>
        </div>
      </div>

      {/* Service Modal */}
      {selectedService && (
        <ModernServiceModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          serviceId={selectedService}
          onBookingComplete={(bookingData) => {
            console.log('Booking completed:', bookingData);
          }}
        />
      )}
    </section>
  );
}