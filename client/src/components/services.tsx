import { Home, Sparkles, Wrench, Leaf, Zap, Droplets, ChefHat, Users, Truck, Clock, Star, Calendar, Shield, Scissors, UtensilsCrossed, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import ModernServiceModal from "@/components/modern-service-modal";
import { useState } from "react";

interface ServicesProps {
  onServiceSelect: (service: string) => void;
}

export default function Services({ onServiceSelect }: ServicesProps) {
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");

  const handleCalendarClick = (serviceId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedServiceId(serviceId);
    setShowServiceModal(true);
  };

  const handleServiceSelection = (serviceId: string, optionId: string, addOns?: string[]) => {
    onServiceSelect(serviceId);
    setShowServiceModal(false);
  };
  const services = [
    {
      id: "house-cleaning",
      name: "House Cleaning",
      category: "Cleaning Services",
      description: "Complete home cleaning including dusting, vacuuming, mopping, kitchen & bathroom sanitization, organizing",
      price: "R280/hour",
      basePrice: 280,
      icon: Sparkles,
      gradient: "from-gradient-start to-gradient-end",
      iconBg: "bg-gradient-to-br from-blue-500 to-purple-600",
      modernIcon: true,
      features: ["Same-day availability", "Eco-friendly products", "Insured & bonded", "4.8+ star rating"],
      timeSlots: ["6:00 AM", "8:00 AM", "10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM"],
      discounts: {
        materials: 15,
        recurring: { weekly: 15, biweekly: 10, monthly: 8 },
        earlyBird: 10
      }
    },
    {
      id: "plumbing",
      name: "Plumbing Services", 
      category: "Maintenance & Repairs",
      description: "Pipe repairs, leak fixing, faucet installation, drain cleaning, toilet repairs, water heater maintenance",
      price: "R380/hour",
      basePrice: 380,
      icon: Droplets,
      gradient: "from-gradient-start to-gradient-end",
      iconBg: "bg-gradient-to-br from-cyan-500 to-blue-600",
      modernIcon: true,
      features: ["24/7 Emergency", "Licensed professionals", "Parts warranty", "4.9+ star rating"],
      timeSlots: ["Emergency", "8:00 AM", "10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM"],
      discounts: {
        materials: 15,
        recurring: { weekly: 12, monthly: 6 },
        emergency: -25
      }
    },
    {
      id: "electrical",
      name: "Electrical Services",
      category: "Maintenance & Repairs",
      description: "Wiring repairs, outlet installation, lighting setup, circuit breaker fixes, electrical safety inspections", 
      price: "R420/hour",
      basePrice: 420,
      icon: Zap,
      gradient: "from-yellow-500 to-orange-600",
      iconBg: "bg-gradient-to-br from-yellow-500 to-orange-600",
      modernIcon: true,
      features: ["Certified electricians", "Safety compliant", "Free estimates", "4.7+ star rating"],
      timeSlots: ["8:00 AM", "10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM", "6:00 PM"],
      discounts: {
        materials: 15,
        recurring: { monthly: 8 },
        safety: 5
      }
    },
    {
      id: "chef-catering",
      name: "Chef & Catering",
      category: "Food & Event Services",
      description: "Personal chef services, meal preparation, event catering, menu planning, dietary accommodations",
      price: "R550/hour",
      basePrice: 550,
      icon: UtensilsCrossed,
      gradient: "from-gradient-start to-gradient-end",
      iconBg: "bg-gradient-to-br from-orange-500 to-red-600",
      modernIcon: true,
      features: ["African cuisine specialist", "Halal/non-Halal options", "Custom menus", "4.9+ star rating"],
      timeSlots: ["10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM", "6:00 PM", "8:00 PM"],
      discounts: {
        materials: 20,
        recurring: { weekly: 15, monthly: 12 },
        group: 10
      }
    },
    {
      id: "waitering",
      name: "Waitering Services",
      category: "Food & Event Services",
      description: "Professional waitstaff for events, table service, bar service, event coordination, cleanup assistance",
      price: "R220/hour",
      basePrice: 220,
      icon: Users,
      gradient: "from-gradient-start to-gradient-end",
      iconBg: "bg-gradient-to-br from-green-500 to-teal-600",
      modernIcon: true,
      features: ["Event specialists", "Professional attire", "Setup & cleanup", "4.6+ star rating"],
      timeSlots: ["10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM", "6:00 PM", "8:00 PM"],
      discounts: {
        materials: 10,
        recurring: { weekly: 12, monthly: 8 },
        team: 15
      }
    },
    {
      id: "garden-care",
      name: "Garden Care",
      category: "Outdoor Services",
      description: "Lawn maintenance, pruning, weeding, planting, irrigation setup, landscape design consultation", 
      price: "R320/hour",
      basePrice: 320,
      icon: Scissors,
      gradient: "from-gradient-start to-gradient-end",
      iconBg: "bg-gradient-to-br from-emerald-500 to-green-600",
      modernIcon: true,
      features: ["Landscape experts", "Seasonal planning", "Tool included", "4.8+ star rating"],
      timeSlots: ["6:00 AM", "8:00 AM", "10:00 AM", "2:00 PM", "4:00 PM"],
      discounts: {
        materials: 15,
        recurring: { weekly: 18, biweekly: 12, monthly: 10 },
        seasonal: 8
      }
    },
    {
      id: "home-moving",
      name: "Home Moving",
      category: "Moving & Relocation",
      description: "Packing services, furniture disassembly/assembly, loading/unloading, transportation, unpacking, storage solutions",
      price: "R450/hour",
      basePrice: 450,
      icon: Truck,
      gradient: "from-indigo-50 to-indigo-100",
      iconBg: "bg-gradient-to-br from-indigo-500 to-purple-600",
      modernIcon: true,
      features: ["Full-service moving", "Packing materials", "Insurance covered", "4.7+ star rating"],
      timeSlots: ["8:00 AM", "10:00 AM", "12:00 PM", "2:00 PM"],
      discounts: {
        materials: 10,
        distance: 5,
        volume: 12
      }
    },
    {
      id: "au-pair",
      name: "Au Pair Services",
      category: "Childcare & Support",
      description: "Live-in childcare, after-school care, educational support, activity planning, overnight babysitting",
      price: "R180/hour",
      basePrice: 180,
      icon: Users,
      gradient: "from-gradient-start to-gradient-end",
      iconBg: "bg-gradient-to-br from-pink-500 to-rose-600",
      modernIcon: true,
      features: ["Background checked", "Educational support", "Activity planning", "4.9+ star rating"],
      timeSlots: ["7:00 AM", "12:00 PM", "3:00 PM", "6:00 PM", "8:00 PM"],
      discounts: {
        recurring: { weekly: 20, monthly: 15 },
        multiple: 12,
        longterm: 18
      }
    }
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
                onClick={() => {
                  setSelectedServiceId(service.id);
                  setShowServiceModal(true);
                }}
                data-testid={`card-service-${service.id}`}
              >
                <div className="bg-white rounded-2xl p-6 text-center hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-300 border border-gray-100 group-hover:border-primary/20">
                  {/* Modern gradient icon with enhanced shadow */}
                  <div className={`w-16 h-16 ${service.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-xl group-hover:shadow-2xl`}>
                    <IconComponent className="text-white h-8 w-8" />
                  </div>
                  
                  {/* Service category badge */}
                  <div className="mb-3">
                    <span className="text-xs bg-gradient-to-r from-primary/10 to-purple-600/10 text-primary px-3 py-1 rounded-full font-medium border border-primary/20">
                      {service.category}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">{service.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">{service.description}</p>
                  
                  {/* Enhanced features showcase */}
                  <div className="space-y-3 mb-5">
                    <div className="bg-gradient-to-r from-primary/5 to-purple-600/5 rounded-lg py-2 px-3">
                      <div className="text-lg font-bold text-primary">From {service.price}</div>
                      <div className="text-xs text-gray-500">+ materials & discounts available</div>
                    </div>
                    
                    {/* Key features with icons */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <span className="flex items-center justify-center bg-green-50 text-green-700 py-1 px-2 rounded">
                        <Clock className="h-3 w-3 mr-1" />
                        Same day
                      </span>
                      <span className="flex items-center justify-center bg-yellow-50 text-yellow-700 py-1 px-2 rounded">
                        <Star className="h-3 w-3 mr-1" />
                        {service.features?.[3]?.split(' ')[0] || '4.8+'}
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
                      Weekly: -{service.discounts?.recurring?.weekly || 15}% | Materials: -{service.discounts?.materials || 15}%
                    </div>
                  </div>
                  
                  {/* Enhanced CTA buttons */}
                  <div className="space-y-2">
                    <button 
                      className="w-full hover:opacity-90 text-white font-bold text-lg py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                      style={{ backgroundColor: '#C56B86' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedServiceId(service.id);
                        setShowServiceModal(true);
                      }}
                    >
                      Book Now
                    </button>
                    <button
                      className="w-full bg-white hover:bg-gray-50 text-primary font-medium py-2 px-4 rounded-lg transition-all duration-200 border border-primary/20 hover:border-primary/40"
                      onClick={(e) => handleCalendarClick(service.id, e)}
                    >
                      Quick Quote & Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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
          // Remove onServiceSelect call to prevent card interference
        }}
      />
    </section>
  );
}
