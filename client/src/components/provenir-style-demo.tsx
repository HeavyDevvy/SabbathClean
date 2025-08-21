import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowRight, Clock, Star, Shield } from "lucide-react";

interface DemoStep {
  id: number;
  title: string;
  description: string;
  visual: string;
  duration: number;
}

export default function ProvenirStyleDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const demoSteps: DemoStep[] = [
    {
      id: 1,
      title: "Choose Your Service",
      description: "Select from house cleaning, plumbing, electrical, chef services, waitering, or garden care",
      visual: "🏠",
      duration: 2000
    },
    {
      id: 2,
      title: "Smart Provider Matching",
      description: "Our AI matches you with verified professionals based on location, availability, and ratings",
      visual: "🤖",
      duration: 2500
    },
    {
      id: 3,
      title: "Instant Booking",
      description: "Book your preferred time slot with transparent upfront pricing",
      visual: "📅",
      duration: 2000
    },
    {
      id: 4,
      title: "Secure Payment",
      description: "All payments processed securely through Berry Events Bank with escrow protection",
      visual: "💳",
      duration: 2500
    },
    {
      id: 5,
      title: "Service Delivery",
      description: "Professional arrives on time with all necessary tools and equipment",
      visual: "🔧",
      duration: 2000
    },
    {
      id: 6,
      title: "Quality Assurance",
      description: "Rate your experience and provide feedback for continuous improvement",
      visual: "⭐",
      duration: 2000
    }
  ];

  const startDemo = () => {
    setIsPlaying(true);
    setCurrentStep(0);
    setCompletedSteps([]);
  };

  const stopDemo = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setCompletedSteps([]);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isPlaying && currentStep < demoSteps.length) {
      timer = setTimeout(() => {
        setCompletedSteps(prev => [...prev, currentStep]);
        
        if (currentStep + 1 < demoSteps.length) {
          setCurrentStep(currentStep + 1);
        } else {
          setIsPlaying(false);
          // Reset after completion
          setTimeout(() => {
            setCurrentStep(0);
            setCompletedSteps([]);
          }, 1000);
        }
      }, demoSteps[currentStep].duration);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPlaying, currentStep, demoSteps]);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
            Watch How Berry Events Works
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            See how easy it is to book premium home services in just minutes
          </p>
          
          <div className="flex justify-center space-x-4 mb-8">
            <Button 
              onClick={startDemo}
              disabled={isPlaying}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
              data-testid="button-start-demo"
            >
              {isPlaying ? "Demo Playing..." : "Watch Demo"}
            </Button>
            
            {isPlaying && (
              <Button 
                onClick={stopDemo}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                data-testid="button-stop-demo"
              >
                Stop Demo
              </Button>
            )}
          </div>
        </div>

        {/* Demo Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            {demoSteps.map((step, index) => (
              <div
                key={step.id}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  completedSteps.includes(index)
                    ? "bg-green-500"
                    : index === currentStep && isPlaying
                    ? "bg-blue-500 animate-pulse"
                    : "bg-gray-300"
                }`}
                data-testid={`progress-step-${index}`}
              />
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
              style={{ 
                width: `${((completedSteps.length + (isPlaying ? 0.5 : 0)) / demoSteps.length) * 100}%` 
              }}
            />
          </div>
        </div>

        {/* Demo Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {demoSteps.map((step, index) => (
            <Card 
              key={step.id}
              className={`transition-all duration-500 transform ${
                index === currentStep && isPlaying
                  ? "scale-105 shadow-xl border-blue-500"
                  : completedSteps.includes(index)
                  ? "bg-green-50 border-green-200"
                  : "hover:shadow-lg"
              }`}
              data-testid={`demo-step-${index}`}
            >
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div 
                    className={`text-4xl mr-4 transition-all duration-300 ${
                      index === currentStep && isPlaying ? "animate-bounce" : ""
                    }`}
                  >
                    {step.visual}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                      {step.title}
                    </h3>
                    <div className="flex items-center">
                      {completedSteps.includes(index) && (
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      )}
                      {index === currentStep && isPlaying && (
                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2" />
                      )}
                      <span className="text-sm text-gray-600">
                        Step {step.id}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-blue-50 rounded-2xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Experience Berry Events?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust Berry Events for their home service needs. 
              Book your first service today and experience the difference.
            </p>
            
            <div className="flex flex-wrap justify-center items-center gap-8 mb-6">
              <div className="flex items-center text-green-600">
                <Shield className="w-5 h-5 mr-2" />
                <span className="font-medium">Fully Insured</span>
              </div>
              <div className="flex items-center text-blue-600">
                <Star className="w-5 h-5 mr-2" />
                <span className="font-medium">4.8/5 Rating</span>
              </div>
              <div className="flex items-center text-purple-600">
                <Clock className="w-5 h-5 mr-2" />
                <span className="font-medium">Same Day Service</span>
              </div>
            </div>

            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
              data-testid="button-book-now-demo"
              onClick={() => {
                const servicesSection = document.getElementById('services');
                servicesSection?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Book Your Service Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}