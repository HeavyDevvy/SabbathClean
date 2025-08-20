import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface DynamicPricingProps {
  onBookingClick: () => void;
}

export default function DynamicPricing({ onBookingClick }: DynamicPricingProps) {
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);

  const services = [
    {
      name: "House Cleaning",
      price: "R280",
      period: "/hour",
      description: "Professional home cleaning with eco-friendly products",
      features: [
        "Deep cleaning included",
        "Bring own supplies",
        "Flexible scheduling",
        "Satisfaction guarantee",
      ],
      color: "border-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      name: "Chef & Catering",
      price: "R550",
      period: "/event",
      description: "Personal chef services and event catering",
      features: [
        "Menu customization",
        "Professional presentation",
        "Quality ingredients", 
        "Event coordination",
      ],
      color: "border-orange-500",
      bgColor: "bg-orange-50",
    },
    {
      name: "Waitering Services",
      price: "R180",
      period: "/hour",
      description: "Professional waitstaff for your events",
      features: [
        "Event-based pricing",
        "Professional service",
        "Bar service available",
        "Setup & breakdown",
      ],
      color: "border-green-500",
      bgColor: "bg-green-50",
    },
    {
      name: "Plumbing Services",
      price: "R380",
      period: "/hour",
      description: "Licensed plumbers for all your needs",
      features: [
        "Emergency available",
        "Licensed professionals",
        "Quality guaranteed",
        "Parts warranty",
      ],
      color: "border-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      name: "Garden Care",
      price: "R320",
      period: "/hour",
      description: "Complete garden maintenance and landscaping",
      features: [
        "Seasonal care",
        "Plant expertise",
        "Equipment included",
        "Eco-friendly methods",
      ],
      color: "border-emerald-500",
      bgColor: "bg-emerald-50",
    },
    {
      name: "Electrical Services",
      price: "R420",
      period: "/hour",
      description: "Safe and reliable electrical repairs",
      features: [
        "Safety certified",
        "Code compliance",
        "Emergency service",
        "Quality materials",
      ],
      color: "border-yellow-500",
      bgColor: "bg-yellow-50",
    },
  ];

  // Auto-rotate services every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentServiceIndex((prev) => (prev + 1) % services.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [services.length]);

  const currentService = services[currentServiceIndex];

  return (
    <section id="pricing" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Transparent Pricing</h2>
          <p className="mt-4 text-lg text-neutral">No hidden fees. Competitive rates across all services.</p>
        </div>

        {/* Service rotation indicators */}
        <div className="flex justify-center mt-8 space-x-2">
          {services.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentServiceIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentServiceIndex 
                  ? "bg-primary scale-125" 
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>

        {/* Dynamic service pricing card */}
        <div className="mt-8 flex justify-center">
          <div 
            className={`max-w-md w-full border-2 ${currentService.color} rounded-2xl p-8 ${currentService.bgColor} transition-all duration-500 transform`}
            data-testid={`card-pricing-${currentService.name.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">{currentService.name}</h3>
              <div className="text-4xl font-bold text-primary mb-2">
                {currentService.price}
                <span className="text-lg text-neutral">{currentService.period}</span>
              </div>
              <p className="text-neutral mb-6">{currentService.description}</p>
              
              <ul className="space-y-3 mb-8 text-left">
                {currentService.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-neutral">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Button 
                onClick={onBookingClick}
                className="w-full bg-primary text-white hover:bg-blue-700"
                data-testid={`button-book-${currentService.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                Book {currentService.name}
              </Button>
            </div>
          </div>
        </div>

        {/* Static comparison */}
        <div className="mt-12">
          <h3 className="text-center text-xl font-semibold text-gray-900 mb-8">All Services at a Glance</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {services.map((service, index) => (
              <div 
                key={service.name}
                className={`p-4 border rounded-lg text-center transition-all duration-300 cursor-pointer ${
                  index === currentServiceIndex 
                    ? `${service.color} ${service.bgColor}` 
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setCurrentServiceIndex(index)}
              >
                <div className="font-semibold text-sm">{service.name}</div>
                <div className="text-primary font-bold">{service.price}<span className="text-xs">{service.period}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}