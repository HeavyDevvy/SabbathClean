import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ChefHat, 
  MapPin, 
  Clock, 
  Star, 
  Users, 
  ShoppingCart, 
  Utensils,
  CheckCircle,
  Play,
  RotateCcw,
  Sparkles,
  Wrench,
  Zap,
  Scissors,
  Truck
} from "lucide-react";

interface DemoStep {
  id: number;
  title: string;
  description: string;
  component: React.ReactNode;
  duration: number;
}

interface ServiceDemo {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  steps: DemoStep[];
}

export function AnimatedBookingDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const serviceDemos: ServiceDemo[] = [
    {
      id: "chef-catering",
      name: "Chef & Catering",
      icon: <ChefHat className="h-6 w-6" />,
      color: "from-orange-400 to-red-500",
      steps: [
        {
          id: 1,
          title: "Select Chef & Catering Service",
          description: "Choose from our premium home services",
          duration: 2000,
          component: (
            <Card className="w-full max-w-sm mx-auto transform hover:scale-105 transition-all duration-300 border-2 border-orange-500 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <ChefHat className="h-8 w-8 text-orange-500" />
                  <div>
                    <h3 className="font-semibold text-lg">Chef & Catering</h3>
                    <Badge variant="secondary">Premium Service</Badge>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-3">Professional chef services for any occasion</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-orange-500">R550</span>
                  <span className="text-sm text-gray-500">starting from</span>
                </div>
              </CardContent>
            </Card>
          )
        },
        {
          id: 2,
          title: "Choose African Cuisine",
          description: "Select from authentic African cuisine specialties",
          duration: 2500,
          component: (
            <div className="space-y-3 max-w-md mx-auto">
              <h4 className="font-semibold text-center mb-4">Select African Cuisine Type</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: "South African", icon: "🍖", active: true, description: "Braai & Boerewors" },
                  { name: "Nigerian", icon: "🍛", active: false, description: "Jollof & Suya" },
                  { name: "Ethiopian", icon: "🫓", active: false, description: "Injera & Doro Wat" },
                  { name: "Moroccan", icon: "🍲", active: false, description: "Tagine & Couscous" }
                ].map((cuisine) => (
                  <Card 
                    key={cuisine.name} 
                    className={`cursor-pointer transition-all duration-300 ${
                      cuisine.active ? 'ring-2 ring-orange-500 bg-orange-50 transform scale-105' : 'hover:shadow-md'
                    }`}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl mb-2">{cuisine.icon}</div>
                      <p className="font-medium text-sm">{cuisine.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{cuisine.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        },
        {
          id: 3,
          title: "African Chef Matched!",
          description: "Specialist in authentic African cuisine",
          duration: 2000,
          component: (
            <div className="text-center max-w-sm mx-auto">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <CheckCircle className="h-12 w-12 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-orange-700 mb-2">Chef Thabo Matched!</h3>
              <p className="text-gray-600 mb-4">Specialist chef will prepare South African braai feast for 8 people</p>
              <div className="space-y-2 mb-4">
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-orange-800">Menu Highlights:</p>
                  <p className="text-xs text-orange-600">Boerewors, Sosaties, Pap & Gravy, Chakalaka</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-orange-500">R4,200</div>
              <p className="text-xs text-gray-500 mt-1">Includes traditional braai setup & sides</p>
            </div>
          )
        }
      ]
    }
  ];

  const currentServiceDemo = serviceDemos[0]; // Only one service now
  const demoSteps: DemoStep[] = currentServiceDemo?.steps || [];

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (currentStep < demoSteps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        // End of demo - just stop
        setIsPlaying(false);
      }
    }, demoSteps[currentStep]?.duration || 2000);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, demoSteps]);

  const startDemo = () => {
    if (!hasStarted) setHasStarted(true);
    setIsPlaying(true);
  };

  const resetDemo = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    setHasStarted(false);
  };

  const currentStepData = demoSteps[currentStep];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Watch How It Works
        </h2>
        <p className="text-lg text-neutral mb-6">
          Experience authentic African cuisine with our specialized chefs in just a few simple steps.
        </p>



        {/* Control Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            onClick={startDemo}
            disabled={isPlaying}
            className="bg-primary hover:bg-blue-700 text-white px-6 py-2"
            data-testid="button-start-demo"
          >
            <Play className="mr-2 h-4 w-4" />
            {hasStarted ? 'Resume Demo' : 'Start Demo'}
          </Button>
          
          <Button
            onClick={resetDemo}
            variant="outline"
            className="px-6 py-2"
            data-testid="button-reset-demo"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>


        </div>
      </div>



      {/* Progress Indicator */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-2">
          {demoSteps.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-8 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? `bg-gradient-to-r ${currentServiceDemo.color}`
                  : index < currentStep
                  ? 'bg-green-500'
                  : 'bg-gray-200'
              }`}
              data-testid={`progress-step-${index}`}
            />
          ))}
        </div>
      </div>

      {/* Demo Content */}
      <div className="min-h-[400px] flex items-center justify-center">
        {hasStarted && currentStepData ? (
          <div className="w-full">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2 animate-fadeIn">
                {currentStepData.title}
              </h3>
              <p className="text-neutral animate-fadeIn">
                {currentStepData.description}
              </p>
            </div>
            
            <div className="animate-scaleIn">
              {currentStepData.component}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Ready to See How It Works?
            </h3>
            <p className="text-neutral">
              Click "Start Demo" to see our African cuisine chef booking process in action
            </p>
          </div>
        )}
      </div>


    </div>
  );
}