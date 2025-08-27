import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Sparkles, Droplets, Zap, ChefHat, Users, Leaf, Truck, Play } from "lucide-react";
import { useState } from "react";
import WorkflowSimulation from "./workflow-simulation";

interface HowItWorksProps {
  onBookingClick: (serviceId?: string) => void;
}

export default function HowItWorks({ onBookingClick }: HowItWorksProps) {
  const [showServiceSelector, setShowServiceSelector] = useState(false);
  const [showSimulation, setShowSimulation] = useState(false);

  const services = [
    { id: "house-cleaning", name: "House Cleaning", icon: Home, color: "bg-purple-600" },
    { id: "deep-cleaning", name: "Deep Cleaning", icon: Sparkles, color: "bg-pink-600" },
    { id: "plumbing", name: "Plumbing", icon: Droplets, color: "bg-blue-600" },
    { id: "electrical", name: "Electrical", icon: Zap, color: "bg-yellow-600" },
    { id: "chef-catering", name: "Chef & Catering", icon: ChefHat, color: "bg-orange-600" },
    { id: "waitering", name: "Waitering", icon: Users, color: "bg-green-600" },
    { id: "gardening", name: "Garden Care", icon: Leaf, color: "bg-emerald-600" },
    { id: "home-moving", name: "Home Moving", icon: Truck, color: "bg-indigo-600" },
  ];

  const steps = [
    {
      number: 1,
      title: "Choose Your Service",
      description: "Select from house cleaning, deep cleaning, maintenance, garden care, moving services, or professional catering. Specify your requirements and preferred date.",
      bgColor: "bg-primary",
    },
    {
      number: 2,
      title: "Get Matched Instantly", 
      description: "Our algorithm matches you with up to 10 verified professionals in your area. View profiles, ratings, and availability.",
      bgColor: "bg-secondary",
    },
    {
      number: 3,
      title: "Enjoy Premium Service",
      description: "Your chosen professional arrives on time with all necessary supplies. Track progress and pay securely through the platform.", 
      bgColor: "bg-accent",
    },
  ];

  return (
    <section id="how-it-works" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">How Berry Works</h2>
          <p className="mt-4 text-lg text-neutral">Book premium domestic services in just 3 simple steps</p>
        </div>

        <div className="mt-16 lg:grid lg:grid-cols-3 lg:gap-8">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className={`flex items-center justify-center w-16 h-16 ${step.bgColor} rounded-full mx-auto mb-6`}>
                <span className="text-white text-xl font-bold">{step.number}</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{step.title}</h3>
              <p className="text-neutral">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          {!showServiceSelector ? (
            <div className="space-y-4">
              <Button 
                onClick={() => setShowServiceSelector(true)}
                size="lg"
                className="bg-primary text-white hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg mr-4"
                data-testid="button-start-booking"
              >
                Start Your Service Booking
              </Button>
              <Button 
                onClick={() => setShowSimulation(true)}
                size="lg"
                variant="outline"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transform hover:scale-105 transition-all duration-200"
                data-testid="button-watch-workflow"
              >
                <Play className="h-5 w-5 mr-2" />
                See How It Works
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-gray-900">Choose Your Service</h3>
              <p className="text-neutral mb-8">Select the service you need and we'll connect you with the best providers in your area</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                {services.map((service) => {
                  const IconComponent = service.icon;
                  return (
                    <Card 
                      key={service.id}
                      className="cursor-pointer hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 group"
                      onClick={() => onBookingClick(service.id)}
                      data-testid={`service-selector-${service.id}`}
                    >
                      <CardContent className="p-6 text-center">
                        <div className={`w-12 h-12 ${service.color} rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200`}>
                          <IconComponent className="text-white h-6 w-6" />
                        </div>
                        <h4 className="font-medium text-gray-900 text-sm">{service.name}</h4>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              <div className="flex justify-center space-x-4 mt-8">
                <Button 
                  variant="outline"
                  onClick={() => setShowServiceSelector(false)}
                  data-testid="button-back-to-general"
                >
                  Back
                </Button>
                <Button 
                  onClick={() => setShowSimulation(true)}
                  variant="outline"
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  data-testid="button-watch-demo"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Watch Demo
                </Button>
                <Button 
                  onClick={() => onBookingClick()}
                  variant="outline"
                  data-testid="button-browse-all"
                >
                  Browse All Services
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {/* Workflow Simulation Modal */}
        {showSimulation && (
          <WorkflowSimulation onClose={() => setShowSimulation(false)} />
        )}
      </div>
    </section>
  );
}
