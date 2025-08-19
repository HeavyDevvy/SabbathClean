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
  const [currentService, setCurrentService] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);

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
          title: "Choose Your Cuisine",
          description: "Select from authentic cuisine types",
          duration: 2500,
          component: (
            <div className="space-y-3 max-w-md mx-auto">
              <h4 className="font-semibold text-center mb-4">Select Cuisine Type</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: "Italian", icon: "🍝", active: true },
                  { name: "Indian", icon: "🍛", active: false },
                  { name: "Asian", icon: "🍜", active: false },
                  { name: "Mediterranean", icon: "🥗", active: false }
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        },
        {
          id: 3,
          title: "Chef Matched!",
          description: "Professional chef ready to serve",
          duration: 2000,
          component: (
            <div className="text-center max-w-sm mx-auto">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <CheckCircle className="h-12 w-12 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-orange-700 mb-2">Chef Matched!</h3>
              <p className="text-gray-600 mb-4">Chef Sarah will prepare Italian cuisine for 6 people</p>
              <div className="text-2xl font-bold text-orange-500">R3,480</div>
            </div>
          )
        }
      ]
    },
    {
      id: "house-cleaning",
      name: "House Cleaning",
      icon: <Sparkles className="h-6 w-6" />,
      color: "from-blue-400 to-purple-500",
      steps: [
        {
          id: 1,
          title: "Select House Cleaning",
          description: "Professional cleaning services",
          duration: 2000,
          component: (
            <Card className="w-full max-w-sm mx-auto transform hover:scale-105 transition-all duration-300 border-2 border-blue-500 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <Sparkles className="h-8 w-8 text-blue-500" />
                  <div>
                    <h3 className="font-semibold text-lg">House Cleaning</h3>
                    <Badge variant="secondary">Most Popular</Badge>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-3">Eco-friendly cleaning solutions</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-blue-500">R280</span>
                  <span className="text-sm text-gray-500">per hour</span>
                </div>
              </CardContent>
            </Card>
          )
        },
        {
          id: 2,
          title: "Configure Cleaning",
          description: "Customize your cleaning service",
          duration: 2500,
          component: (
            <div className="max-w-md mx-auto">
              <h4 className="font-semibold text-center mb-4">Cleaning Configuration</h4>
              <div className="space-y-3">
                <Card className="border-blue-500 bg-blue-50">
                  <CardContent className="p-4">
                    <p className="font-medium text-sm">3 Bedroom House</p>
                    <p className="text-xs text-gray-600">Deep cleaning included</p>
                  </CardContent>
                </Card>
                <Card className="border-blue-500 bg-blue-50">
                  <CardContent className="p-4">
                    <p className="font-medium text-sm">4 Hours Duration</p>
                    <p className="text-xs text-gray-600">Bathroom & kitchen focus</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )
        },
        {
          id: 3,
          title: "Cleaner Confirmed!",
          description: "Maria is on her way",
          duration: 2000,
          component: (
            <div className="text-center max-w-sm mx-auto">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <CheckCircle className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-blue-700 mb-2">Cleaner Confirmed!</h3>
              <p className="text-gray-600 mb-4">Maria will arrive in 30 minutes</p>
              <div className="text-2xl font-bold text-blue-500">R1,120</div>
            </div>
          )
        }
      ]
    },
    {
      id: "plumbing",
      name: "Plumbing",
      icon: <Wrench className="h-6 w-6" />,
      color: "from-green-400 to-teal-500",
      steps: [
        {
          id: 1,
          title: "Emergency Plumbing",
          description: "24/7 professional plumber service",
          duration: 2000,
          component: (
            <Card className="w-full max-w-sm mx-auto transform hover:scale-105 transition-all duration-300 border-2 border-green-500 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <Wrench className="h-8 w-8 text-green-500" />
                  <div>
                    <h3 className="font-semibold text-lg">Plumbing Service</h3>
                    <Badge variant="destructive">Emergency</Badge>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-3">Certified plumbers available 24/7</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-green-500">R400</span>
                  <span className="text-sm text-gray-500">per hour</span>
                </div>
              </CardContent>
            </Card>
          )
        },
        {
          id: 2,
          title: "Describe the Issue",
          description: "Quick problem assessment",
          duration: 2500,
          component: (
            <div className="max-w-md mx-auto">
              <h4 className="font-semibold text-center mb-4">What's the Problem?</h4>
              <Card className="border-green-500 bg-green-50">
                <CardContent className="p-4">
                  <p className="font-medium text-sm">Blocked Kitchen Sink</p>
                  <p className="text-xs text-gray-600">Water not draining, urgent repair needed</p>
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">Urgent</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        },
        {
          id: 3,
          title: "Plumber En Route!",
          description: "James is coming to fix your sink",
          duration: 2000,
          component: (
            <div className="text-center max-w-sm mx-auto">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-green-700 mb-2">Plumber En Route!</h3>
              <p className="text-gray-600 mb-4">James will arrive in 15 minutes with tools</p>
              <div className="text-2xl font-bold text-green-500">R400</div>
            </div>
          )
        }
      ]
    },
    {
      id: "electrical",
      name: "Electrical",
      icon: <Zap className="h-6 w-6" />,
      color: "from-yellow-400 to-orange-500",
      steps: [
        {
          id: 1,
          title: "Electrical Service",
          description: "Licensed electrician support",
          duration: 2000,
          component: (
            <Card className="w-full max-w-sm mx-auto transform hover:scale-105 transition-all duration-300 border-2 border-yellow-500 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <Zap className="h-8 w-8 text-yellow-500" />
                  <div>
                    <h3 className="font-semibold text-lg">Electrical Work</h3>
                    <Badge variant="secondary">Licensed</Badge>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-3">Safety-certified electrical repairs</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-yellow-500">R450</span>
                  <span className="text-sm text-gray-500">per hour</span>
                </div>
              </CardContent>
            </Card>
          )
        },
        {
          id: 2,
          title: "Safety Assessment",
          description: "Electrical issue evaluation",
          duration: 2500,
          component: (
            <div className="max-w-md mx-auto">
              <h4 className="font-semibold text-center mb-4">Electrical Issue</h4>
              <Card className="border-yellow-500 bg-yellow-50">
                <CardContent className="p-4">
                  <p className="font-medium text-sm">Power Outlet Installation</p>
                  <p className="text-xs text-gray-600">Need 3 new outlets in living room</p>
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">Safety First</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        },
        {
          id: 3,
          title: "Electrician Assigned!",
          description: "Licensed professional on the way",
          duration: 2000,
          component: (
            <div className="text-center max-w-sm mx-auto">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <CheckCircle className="h-12 w-12 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-yellow-700 mb-2">Electrician Assigned!</h3>
              <p className="text-gray-600 mb-4">John will install 3 outlets tomorrow at 2 PM</p>
              <div className="text-2xl font-bold text-yellow-500">R1,350</div>
            </div>
          )
        }
      ]
    },
    {
      id: "gardening",
      name: "Garden Care",
      icon: <Scissors className="h-6 w-6" />,
      color: "from-green-400 to-emerald-500",
      steps: [
        {
          id: 1,
          title: "Garden Care Service",
          description: "Professional landscaping and maintenance",
          duration: 2000,
          component: (
            <Card className="w-full max-w-sm mx-auto transform hover:scale-105 transition-all duration-300 border-2 border-emerald-500 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <Scissors className="h-8 w-8 text-emerald-500" />
                  <div>
                    <h3 className="font-semibold text-lg">Garden Care</h3>
                    <Badge variant="secondary">Eco-Friendly</Badge>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-3">Sustainable garden maintenance</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-emerald-500">R540</span>
                  <span className="text-sm text-gray-500">per hour</span>
                </div>
              </CardContent>
            </Card>
          )
        },
        {
          id: 2,
          title: "Garden Assessment",
          description: "Plan your garden transformation",
          duration: 2500,
          component: (
            <div className="max-w-md mx-auto">
              <h4 className="font-semibold text-center mb-4">Garden Services</h4>
              <div className="space-y-2">
                <Card className="border-emerald-500 bg-emerald-50">
                  <CardContent className="p-3">
                    <p className="font-medium text-sm">Lawn Maintenance</p>
                  </CardContent>
                </Card>
                <Card className="border-emerald-500 bg-emerald-50">
                  <CardContent className="p-3">
                    <p className="font-medium text-sm">Hedge Trimming</p>
                  </CardContent>
                </Card>
                <Card className="border-emerald-500 bg-emerald-50">
                  <CardContent className="p-3">
                    <p className="font-medium text-sm">Plant Care</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )
        },
        {
          id: 3,
          title: "Gardener Scheduled!",
          description: "David will transform your garden",
          duration: 2000,
          component: (
            <div className="text-center max-w-sm mx-auto">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <CheckCircle className="h-12 w-12 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-emerald-700 mb-2">Gardener Scheduled!</h3>
              <p className="text-gray-600 mb-4">David will maintain your garden this Saturday</p>
              <div className="text-2xl font-bold text-emerald-500">R2,160</div>
            </div>
          )
        }
      ]
    },
    {
      id: "home-moving",
      name: "Home Moving",
      icon: <Truck className="h-6 w-6" />,
      color: "from-purple-400 to-pink-500",
      steps: [
        {
          id: 1,
          title: "Home Moving Service",
          description: "Professional relocation assistance",
          duration: 2000,
          component: (
            <Card className="w-full max-w-sm mx-auto transform hover:scale-105 transition-all duration-300 border-2 border-purple-500 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <Truck className="h-8 w-8 text-purple-500" />
                  <div>
                    <h3 className="font-semibold text-lg">Home Moving</h3>
                    <Badge variant="secondary">Full Service</Badge>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-3">Complete relocation solutions</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-purple-500">R450</span>
                  <span className="text-sm text-gray-500">per hour</span>
                </div>
              </CardContent>
            </Card>
          )
        },
        {
          id: 2,
          title: "Moving Details",
          description: "Plan your relocation",
          duration: 2500,
          component: (
            <div className="max-w-md mx-auto">
              <h4 className="font-semibold text-center mb-4">Moving Information</h4>
              <Card className="border-purple-500 bg-purple-50">
                <CardContent className="p-4">
                  <p className="font-medium text-sm">3 Bedroom House</p>
                  <p className="text-xs text-gray-600">From Johannesburg to Cape Town</p>
                  <p className="text-xs text-gray-600 mt-1">Packing & transport included</p>
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">Long Distance</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        },
        {
          id: 3,
          title: "Moving Team Ready!",
          description: "Professional movers assigned",
          duration: 2000,
          component: (
            <div className="text-center max-w-sm mx-auto">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <CheckCircle className="h-12 w-12 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-purple-700 mb-2">Moving Team Ready!</h3>
              <p className="text-gray-600 mb-4">Mike's team will handle your move next Friday</p>
              <div className="text-2xl font-bold text-purple-500">R8,500</div>
            </div>
          )
        }
      ]
    }
  ];

  const currentServiceDemo = serviceDemos[currentService];
  const demoSteps: DemoStep[] = currentServiceDemo?.steps || [];

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (currentStep < demoSteps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        // End of current service demo
        if (isLooping) {
          // Move to next service or restart from first service
          const nextService = (currentService + 1) % serviceDemos.length;
          setCurrentService(nextService);
          setCurrentStep(0);
        } else {
          setIsPlaying(false);
        }
      }
    }, demoSteps[currentStep]?.duration || 2000);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, currentService, demoSteps, isLooping, serviceDemos.length]);

  const startDemo = () => {
    if (!hasStarted) setHasStarted(true);
    setIsPlaying(true);
  };

  const resetDemo = () => {
    setCurrentService(0);
    setCurrentStep(0);
    setIsPlaying(false);
    setHasStarted(false);
  };

  const toggleLoop = () => {
    setIsLooping(!isLooping);
  };

  const selectService = (serviceIndex: number) => {
    setCurrentService(serviceIndex);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const currentStepData = demoSteps[currentStep];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Watch How It Works
        </h2>
        <p className="text-lg text-neutral mb-6">
          See how easy it is to book any of our premium home services in just a few simple steps.
        </p>

        {/* Service Selector */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {serviceDemos.map((service, index) => (
            <Button
              key={service.id}
              variant={currentService === index ? "default" : "outline"}
              size="sm"
              onClick={() => selectService(index)}
              className={`transition-all duration-300 ${
                currentService === index 
                  ? `bg-gradient-to-r ${service.color} text-white` 
                  : 'hover:shadow-md'
              }`}
              data-testid={`service-selector-${service.id}`}
            >
              {service.icon}
              <span className="ml-2">{service.name}</span>
            </Button>
          ))}
        </div>

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

          <Button
            onClick={toggleLoop}
            variant={isLooping ? "default" : "outline"}
            className="px-6 py-2"
            data-testid="button-toggle-loop"
          >
            {isLooping ? 'Loop: ON' : 'Loop: OFF'}
          </Button>
        </div>
      </div>

      {/* Current Service Header */}
      <div className="text-center mb-6">
        <div className={`inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r ${currentServiceDemo.color} text-white mb-4`}>
          {currentServiceDemo.icon}
          <span className="ml-2 font-semibold">{currentServiceDemo.name} Demo</span>
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
              Click "Start Demo" to see our {currentServiceDemo.name.toLowerCase()} booking process in action
            </p>
          </div>
        )}
      </div>

      {isLooping && isPlaying && (
        <div className="text-center mt-6">
          <div className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse mr-2"></div>
            Auto-cycling through all services
          </div>
        </div>
      )}
    </div>
  );
}