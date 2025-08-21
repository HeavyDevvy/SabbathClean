import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Droplets, 
  Zap, 
  ChefHat, 
  Users, 
  Leaf,
  Star,
  ArrowRight
} from "lucide-react";

interface SweepSouthStyleServicesProps {
  onServiceSelect: (service: string) => void;
}

export default function SweepSouthStyleServices({ onServiceSelect }: SweepSouthStyleServicesProps) {
  const [hoveredService, setHoveredService] = useState<string | null>(null);

  const mainServices = [
    {
      id: "house-cleaning",
      name: "House\nCleaning",
      description: "Complete home cleaning including dusting, vacuuming, mopping, kitchen & bathroom sanitization",
      price: "R280/hour",
      icon: Home,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700"
    },
    {
      id: "plumbing", 
      name: "Plumbing\nServices",
      description: "Pipe repairs, leak fixing, faucet installation, drain cleaning, toilet repairs",
      price: "R380/hour",
      icon: Droplets,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700"
    },
    {
      id: "electrical",
      name: "Electrical\nServices", 
      description: "Wiring repairs, outlet installation, lighting setup, circuit breaker fixes",
      price: "R420/hour",
      icon: Zap,
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-700"
    },
    {
      id: "chef-catering",
      name: "Chef &\nCatering",
      description: "Personal chef services, meal preparation, event catering, menu planning",
      price: "R550/event",
      icon: ChefHat,
      color: "from-orange-500 to-orange-600", 
      bgColor: "bg-orange-50",
      textColor: "text-orange-700"
    },
    {
      id: "waitering",
      name: "Waitering\nServices",
      description: "Professional waitstaff for events, table service, bar service, event coordination",
      price: "R220/hour",
      icon: Users,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-700"
    },
    {
      id: "garden-care",
      name: "Garden\nCare", 
      description: "Garden maintenance, lawn mowing, landscaping, plant care, outdoor cleaning",
      price: "R350/hour",
      icon: Leaf,
      color: "from-teal-500 to-teal-600",
      bgColor: "bg-teal-50",
      textColor: "text-teal-700"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Choose the service you need
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From comprehensive cleaning to specialized care, our verified professionals are ready to help with all your home service needs.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {mainServices.map((service) => {
            const Icon = service.icon;
            return (
              <Card
                key={service.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg group relative overflow-hidden border-0 ${service.bgColor}`}
                onMouseEnter={() => setHoveredService(service.id)}
                onMouseLeave={() => setHoveredService(null)}
                onClick={() => onServiceSelect(service.id)}
                data-testid={`service-card-${service.id}`}
              >
                <CardContent className="p-6 text-center h-full flex flex-col justify-between">
                  {/* Service Icon */}
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${service.color} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  
                  {/* Service Name */}
                  <div className="mb-3">
                    <h3 className={`text-lg font-bold whitespace-pre-line ${service.textColor} group-hover:text-gray-900 transition-colors`}>
                      {service.name}
                    </h3>
                    {service.price && (
                      <p className="text-sm font-semibold text-gray-800 mt-1">
                        {service.price}
                      </p>
                    )}
                  </div>
                  
                  {/* Service Description - Always visible on desktop, hover for mobile */}
                  <div className={`transition-all duration-300 md:opacity-100 md:max-h-20 ${
                    hoveredService === service.id 
                      ? 'opacity-100 max-h-20' 
                      : 'opacity-0 max-h-0 md:opacity-100 md:max-h-20'
                  } overflow-hidden`}>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  {/* Hover Arrow */}
                  <div className={`absolute bottom-4 right-4 transition-all duration-300 ${
                    hoveredService === service.id ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
                  }`}>
                    <ArrowRight className="h-5 w-5 text-gray-600" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Primary CTA */}
        <div className="text-center mt-12">
          <Button 
            onClick={() => onServiceSelect('house-cleaning')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            data-testid="button-book-service-main"
          >
            Book a Service
          </Button>
        </div>
      </div>
    </section>
  );
}