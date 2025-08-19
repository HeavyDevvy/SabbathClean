import { Home, Sparkles, Wrench, Leaf } from "lucide-react";

interface ServicesProps {
  onServiceSelect: (service: string) => void;
}

export default function Services({ onServiceSelect }: ServicesProps) {
  const services = [
    {
      id: "house-cleaning",
      name: "House Cleaning",
      description: "Complete home cleaning with attention to every detail",
      price: "R450/hour",
      icon: Home,
      gradient: "from-blue-50 to-blue-100",
      iconBg: "bg-primary",
    },
    {
      id: "deep-cleaning", 
      name: "Deep Cleaning",
      description: "Thorough cleaning for move-ins, move-outs, and seasonal refresh",
      price: "R810/hour",
      icon: Sparkles,
      gradient: "from-green-50 to-green-100",
      iconBg: "bg-secondary",
    },
    {
      id: "maintenance",
      name: "Home Maintenance", 
      description: "Plumbing, electrical, and general home repairs",
      price: "R630/hour",
      icon: Wrench,
      gradient: "from-amber-50 to-amber-100",
      iconBg: "bg-accent",
    },
    {
      id: "gardening",
      name: "Garden Care",
      description: "Lawn maintenance, pruning, and landscape care", 
      price: "R540/hour",
      icon: Leaf,
      gradient: "from-emerald-50 to-emerald-100",
      iconBg: "bg-emerald-600",
    },
  ];

  return (
    <section id="services" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Our Premium Services</h2>
          <p className="mt-4 text-lg text-neutral">Professional domestic services tailored to your needs</p>
        </div>
        
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
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
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h3>
                  <p className="text-neutral text-sm mb-4">{service.description}</p>
                  <div className="text-primary font-semibold">From {service.price}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
