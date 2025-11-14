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
    <section className="py-16 lg:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Choose the service you need
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From comprehensive cleaning to specialized care, our verified professionals are ready to help with all your home service needs.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6 max-w-5xl mx-auto">
          {mainServices.map((service) => {
            const Icon = service.icon;
            return (
              <button
                key={service.id}
                className="group p-6 bg-card border border-border hover:border-primary/30 rounded-lg transition-all duration-200 hover:shadow-md text-center"
                onClick={() => onServiceSelect(service.id)}
                data-testid={`service-card-${service.id}`}
              >
                {/* Service Icon */}
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                
                {/* Service Name */}
                <h3 className="text-base font-bold whitespace-pre-line text-foreground mb-1">
                  {service.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  From R{service.basePrice}/{service.priceUnit}
                </p>
              </button>
            );
          })}
        </div>

        {/* Primary CTA */}
        <div className="text-center mt-12">
          <Button 
            onClick={() => onServiceSelect('all-services')}
            className="bg-primary hover:bg-accent text-primary-foreground px-8 py-3 text-base font-semibold rounded-lg transition-colors"
            data-testid="button-book-service-main"
          >
            Book a Service
          </Button>
        </div>
      </div>
    </section>
  );
}