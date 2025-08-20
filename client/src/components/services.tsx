import { Home, Sparkles, Wrench, Leaf, Zap, Droplets, ChefHat, Users, Truck, Clock, Star } from "lucide-react";

interface ServicesProps {
  onServiceSelect: (service: string) => void;
}

export default function Services({ onServiceSelect }: ServicesProps) {
  const services = [
    {
      id: "house-cleaning",
      name: "House Cleaning",
      category: "Cleaning Services",
      description: "Complete home cleaning including dusting, vacuuming, mopping, kitchen & bathroom sanitization, organizing",
      price: "R280/hour",
      icon: Home,
      gradient: "from-purple-50 to-purple-100",
      iconBg: "bg-primary",
    },

    {
      id: "plumbing",
      name: "Plumbing Services", 
      category: "Maintenance & Repairs",
      description: "Pipe repairs, leak fixing, faucet installation, drain cleaning, toilet repairs, water heater maintenance",
      price: "R380/hour",
      icon: Droplets,
      gradient: "from-blue-50 to-blue-100",
      iconBg: "bg-blue-600",
    },
    {
      id: "electrical",
      name: "Electrical Services",
      category: "Maintenance & Repairs",
      description: "Wiring repairs, outlet installation, lighting setup, circuit breaker fixes, electrical safety inspections", 
      price: "R420/hour",
      icon: Zap,
      gradient: "from-yellow-50 to-yellow-100",
      iconBg: "bg-yellow-600",
    },
    {
      id: "chef-catering",
      name: "Chef & Catering",
      category: "Food & Event Services",
      description: "Personal chef services, meal preparation, event catering, menu planning, dietary accommodations",
      price: "R550/hour",
      icon: ChefHat,
      gradient: "from-orange-50 to-orange-100",
      iconBg: "bg-orange-600",
    },
    {
      id: "waitering",
      name: "Waitering Services",
      category: "Food & Event Services",
      description: "Professional waitstaff for events, table service, bar service, event coordination, cleanup assistance",
      price: "R220/hour",
      icon: Users,
      gradient: "from-green-50 to-green-100",
      iconBg: "bg-green-600",
    },
    {
      id: "gardening",
      name: "Garden Care",
      category: "Outdoor Services",
      description: "Lawn maintenance, pruning, weeding, planting, irrigation setup, landscape design consultation", 
      price: "R320/hour",
      icon: Leaf,
      gradient: "from-emerald-50 to-emerald-100",
      iconBg: "bg-emerald-600",
    },
    {
      id: "home-moving",
      name: "Home Moving",
      category: "Moving & Relocation",
      description: "Packing services, furniture disassembly/assembly, loading/unloading, transportation, unpacking, storage solutions",
      price: "R450/hour",
      icon: Truck,
      gradient: "from-indigo-50 to-indigo-100",
      iconBg: "bg-indigo-600",
    },
  ];

  return (
    <section id="services" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Our Home Experts Services</h2>
          <p className="mt-4 text-lg text-neutral">Professional domestic services tailored to your needs</p>
        </div>
        
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {services.map((service) => {
            const IconComponent = service.icon;
            return (
              <div 
                key={service.id}
                className="relative group cursor-pointer"
                onClick={() => onServiceSelect(service.id)}
                data-testid={`card-service-${service.id}`}
              >
                <div className={`bg-gradient-to-br ${service.gradient} rounded-2xl p-8 text-center hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300`}>
                  <div className={`w-16 h-16 ${service.iconBg} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="text-white h-6 w-6" />
                  </div>
                  <div className="mb-2">
                    <span className="text-xs bg-white/70 text-primary px-2 py-1 rounded-full font-medium">
                      {service.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h3>
                  <p className="text-neutral text-sm mb-4">{service.description}</p>
                  
                  {/* Enhanced booking info */}
                  <div className="space-y-2 mb-4">
                    <div className="text-primary font-semibold">From {service.price}</div>
                    <div className="flex items-center justify-center space-x-4 text-xs text-gray-600">
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Same day
                      </span>
                      <span className="flex items-center">
                        <Star className="h-3 w-3 mr-1" />
                        4.8+ rated
                      </span>
                    </div>
                  </div>
                  
                  {/* Quick book button */}
                  <button 
                    className="w-full bg-white/90 hover:bg-white text-primary font-medium py-2 px-4 rounded-lg transition-all duration-200 group-hover:shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      onServiceSelect(service.id);
                    }}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
