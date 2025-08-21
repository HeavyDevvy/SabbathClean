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
      basePrice: 280,
      priceUnit: "hour",
      icon: Home,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
      options: [
        { id: "basic", name: "Basic Cleaning", price: 280, duration: "2-3 hours", description: "General cleaning, dusting, vacuuming" },
        { id: "deep", name: "Deep Cleaning", price: 350, duration: "4-6 hours", description: "Thorough cleaning including inside appliances, baseboards" },
        { id: "move-in", name: "Move-in/Move-out", price: 420, duration: "5-7 hours", description: "Complete cleaning for moving situations" },
        { id: "spring", name: "Spring Cleaning", price: 380, duration: "Full day", description: "Comprehensive seasonal deep clean" }
      ]
    },
    {
      id: "plumbing", 
      name: "Plumbing\nServices",
      description: "Pipe repairs, leak fixing, faucet installation, drain cleaning, toilet repairs",
      basePrice: 380,
      priceUnit: "hour",
      icon: Droplets,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      options: [
        { id: "repair", name: "General Repairs", price: 380, duration: "1-2 hours", description: "Leaks, faucets, basic plumbing fixes" },
        { id: "installation", name: "Installation Services", price: 450, duration: "2-4 hours", description: "New fixtures, appliances, piping" },
        { id: "emergency", name: "Emergency Call-out", price: 550, duration: "Immediate", description: "24/7 urgent plumbing issues" },
        { id: "maintenance", name: "Preventive Maintenance", price: 320, duration: "1-2 hours", description: "Regular checks and upkeep" }
      ]
    },
    {
      id: "electrical",
      name: "Electrical\nServices", 
      description: "Wiring repairs, outlet installation, lighting setup, circuit breaker fixes",
      basePrice: 420,
      priceUnit: "hour",
      icon: Zap,
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-700",
      options: [
        { id: "basic", name: "Basic Electrical", price: 420, duration: "1-2 hours", description: "Outlets, switches, basic wiring" },
        { id: "lighting", name: "Lighting Installation", price: 480, duration: "2-3 hours", description: "Light fixtures, ceiling fans, LED setup" },
        { id: "safety", name: "Safety Inspection", price: 350, duration: "1-2 hours", description: "Electrical safety assessment" },
        { id: "panel", name: "Panel Upgrades", price: 650, duration: "4-6 hours", description: "Circuit breaker, main panel work" }
      ]
    },
    {
      id: "chef-catering",
      name: "Chef &\nCatering",
      description: "Personal chef services, meal preparation, event catering, menu planning",
      basePrice: 550,
      priceUnit: "event",
      icon: ChefHat,
      color: "from-orange-500 to-orange-600", 
      bgColor: "bg-orange-50",
      textColor: "text-orange-700",
      options: [
        { id: "personal", name: "Personal Chef", price: 550, duration: "3-4 hours", description: "Custom meal preparation at your home" },
        { id: "event-small", name: "Small Event (10-20 people)", price: 1200, duration: "4-6 hours", description: "Intimate gatherings and dinner parties" },
        { id: "event-medium", name: "Medium Event (20-50 people)", price: 2500, duration: "6-8 hours", description: "Corporate events, celebrations" },
        { id: "event-large", name: "Large Event (50+ people)", price: 4500, duration: "Full day", description: "Weddings, major celebrations" }
      ]
    },
    {
      id: "waitering",
      name: "Waitering\nServices",
      description: "Professional waitstaff for events, table service, bar service, event coordination",
      basePrice: 220,
      priceUnit: "hour",
      icon: Users,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      options: [
        { id: "basic", name: "Table Service", price: 220, duration: "Per hour", description: "Professional serving staff" },
        { id: "bar", name: "Bar Service", price: 280, duration: "Per hour", description: "Bartender with cocktail expertise" },
        { id: "event", name: "Event Coordination", price: 350, duration: "Per hour", description: "Full event management and service" },
        { id: "formal", name: "Formal Service", price: 320, duration: "Per hour", description: "High-end formal dining service" }
      ]
    },
    {
      id: "garden-care",
      name: "Garden\nCare", 
      description: "Garden maintenance, lawn mowing, landscaping, plant care, outdoor cleaning",
      basePrice: 350,
      priceUnit: "hour",
      icon: Leaf,
      color: "from-teal-500 to-teal-600",
      bgColor: "bg-teal-50",
      textColor: "text-teal-700",
      options: [
        { id: "maintenance", name: "Garden Maintenance", price: 350, duration: "2-4 hours", description: "Lawn mowing, weeding, general upkeep" },
        { id: "landscaping", name: "Landscaping", price: 450, duration: "4-8 hours", description: "Design and plant installation" },
        { id: "cleanup", name: "Garden Cleanup", price: 320, duration: "2-3 hours", description: "Seasonal cleanup, debris removal" },
        { id: "irrigation", name: "Irrigation Setup", price: 550, duration: "3-5 hours", description: "Sprinkler and watering system installation" }
      ]
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
                    <p className="text-sm font-semibold text-gray-800 mt-1">
                      From R{service.basePrice}/{service.priceUnit}
                    </p>
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
            onClick={() => onServiceSelect('all-services')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            data-testid="button-book-service-main"
          >
            Book a Service
          </Button>
          <p className="text-sm text-gray-600 mt-2">
            Choose from all available services and options
          </p>
        </div>
      </div>
    </section>
  );
}