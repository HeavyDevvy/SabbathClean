import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface PricingProps {
  onBookingClick: () => void;
}

export default function Pricing({ onBookingClick }: PricingProps) {
  const plans = [
    {
      name: "One-Time Service",
      price: "R450",
      period: "/hour",
      description: "Perfect for occasional cleaning or trying our service",
      features: [
        "Background-verified professionals",
        "Full insurance coverage", 
        "24-hour advance booking",
        "Satisfaction guarantee",
      ],
      buttonText: "Book One-Time Service",
      buttonVariant: "outline" as const,
      popular: false,
    },
    {
      name: "Weekly Service",
      price: "R396",
      period: "/hour", 
      description: "Regular weekly cleaning with your preferred professional",
      features: [
        "Same cleaner every week",
        "No service fees",
        "Priority booking",
        "Flexible rescheduling",
      ],
      buttonText: "Start Weekly Service",
      buttonVariant: "default" as const,
      popular: true,
    },
    {
      name: "Premium Package",
      price: "R342",
      period: "/hour",
      description: "Best value for multiple weekly services",
      features: [
        "2-5 services per week",
        "Dedicated team",
        "Premium supplies included", 
        "Priority support",
      ],
      buttonText: "Get Premium Package", 
      buttonVariant: "outline" as const,
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Transparent Pricing</h2>
          <p className="mt-4 text-lg text-neutral">No hidden fees. Pay only for the service you receive.</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div 
              key={plan.name}
              className={`border-2 rounded-2xl p-8 relative ${
                plan.popular 
                  ? "border-primary transform scale-105" 
                  : "border-gray-200 hover:border-primary"
              } transition-colors duration-200`}
              data-testid={`card-pricing-${plan.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{plan.name}</h3>
              <div className="text-3xl font-bold text-primary mb-2">
                {plan.price}
                <span className="text-lg text-neutral">{plan.period}</span>
              </div>
              <p className="text-neutral mb-6">{plan.description}</p>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-neutral">
                    <CheckCircle className="h-4 w-4 text-secondary mr-3 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Button 
                onClick={onBookingClick}
                variant={plan.buttonVariant}
                className={`w-full ${
                  plan.buttonVariant === "default" 
                    ? "bg-primary text-white hover:bg-blue-700" 
                    : "border-gray-300 text-gray-900 hover:bg-gray-200"
                }`}
                data-testid={`button-${plan.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {plan.buttonText}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
