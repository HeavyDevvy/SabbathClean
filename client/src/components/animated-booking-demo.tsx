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
  RotateCcw
} from "lucide-react";

interface DemoStep {
  id: number;
  title: string;
  description: string;
  component: React.ReactNode;
  duration: number;
}

export function AnimatedBookingDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const demoSteps: DemoStep[] = [
    {
      id: 1,
      title: "Select Chef & Catering Service",
      description: "Choose from our premium home services",
      duration: 2000,
      component: (
        <Card className="w-full max-w-sm mx-auto transform hover:scale-105 transition-all duration-300 border-2 border-primary shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-3">
              <ChefHat className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold text-lg">Chef & Catering</h3>
                <Badge variant="secondary">Premium Service</Badge>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-3">Professional chef services for any occasion</p>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-primary">R550</span>
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
              { name: "Italian", icon: "🍝", active: false },
              { name: "Indian", icon: "🍛", active: true },
              { name: "Asian", icon: "🍜", active: false },
              { name: "Mediterranean", icon: "🥗", active: false }
            ].map((cuisine, index) => (
              <Card 
                key={cuisine.name} 
                className={`cursor-pointer transition-all duration-300 ${
                  cuisine.active ? 'ring-2 ring-primary bg-primary/5 transform scale-105' : 'hover:shadow-md'
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
      title: "Select Popular Menu",
      description: "Choose from pre-designed authentic menus",
      duration: 3000,
      component: (
        <div className="max-w-lg mx-auto space-y-3">
          <h4 className="font-semibold text-center mb-4">Popular Indian Menus</h4>
          {[
            {
              name: "Royal Mughlai Feast",
              price: 450,
              items: ["Chicken Biryani", "Butter Chicken", "Naan", "Raita"],
              active: true
            },
            {
              name: "Vegetarian Delight",
              price: 380,
              items: ["Dal Makhani", "Paneer Curry", "Roti", "Rice"],
              active: false
            }
          ].map((menu, index) => (
            <Card 
              key={menu.name}
              className={`cursor-pointer transition-all duration-500 ${
                menu.active ? 'ring-2 ring-primary bg-primary/5 transform scale-102' : ''
              }`}
              style={{ animationDelay: `${index * 300}ms` }}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h5 className="font-semibold">{menu.name}</h5>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {menu.items.map((item, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-bold text-primary">R{menu.price}</p>
                    <p className="text-xs text-gray-500">per person</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )
    },
    {
      id: 4,
      title: "Configure Service Options",
      description: "Customize ingredients and utensils",
      duration: 2500,
      component: (
        <div className="max-w-md mx-auto space-y-4">
          <h4 className="font-semibold text-center mb-4">Service Configuration</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-medium mb-2 text-sm">Ingredients</p>
              <Card className="border-primary bg-primary/5 transform scale-105 transition-all duration-300">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2">
                    <ShoppingCart className="h-4 w-4" />
                    <div>
                      <p className="font-medium text-sm">Chef Brings</p>
                      <p className="text-xs text-gray-600">+R80/person</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              <p className="font-medium mb-2 text-sm">Utensils</p>
              <Card className="border-primary bg-primary/5 transform scale-105 transition-all duration-300">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2">
                    <Utensils className="h-4 w-4" />
                    <div>
                      <p className="font-medium text-sm">Chef Brings</p>
                      <p className="text-xs text-gray-600">+R50/person</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          <Card className="bg-blue-50 border border-blue-200">
            <CardContent className="p-3">
              <p className="font-semibold text-blue-900 text-sm">Price Estimate</p>
              <div className="flex justify-between text-sm mt-1">
                <span>Total for 6 people:</span>
                <span className="font-bold">R3,480</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 5,
      title: "Smart Chef Matching",
      description: "AI matches you with specialized chefs nearby",
      duration: 3000,
      component: (
        <div className="max-w-md mx-auto">
          <div className="text-center mb-4">
            <Badge variant="secondary" className="mb-2">
              <ChefHat className="h-3 w-3 mr-1" />
              Indian Cuisine Specialists
            </Badge>
            <p className="text-sm text-amber-800">Showing chefs who specialize in Indian cuisine within your radius</p>
          </div>
          <div className="space-y-3">
            {[
              {
                name: "Chef Raj Patel",
                rating: 4.8,
                reviews: 73,
                distance: "2.3 km",
                specialty: "Traditional Indian spices",
                hourlyRate: 420,
                selected: true
              },
              {
                name: "Chef Priya Singh", 
                rating: 4.9,
                reviews: 91,
                distance: "3.7 km",
                specialty: "Authentic curries & biryanis",
                hourlyRate: 450,
                selected: false
              }
            ].map((chef, index) => (
              <Card 
                key={chef.name}
                className={`cursor-pointer transition-all duration-500 ${
                  chef.selected ? 'ring-2 ring-primary bg-primary/5 transform scale-102' : ''
                }`}
                style={{ animationDelay: `${index * 400}ms` }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-200 to-orange-300 rounded-full flex items-center justify-center">
                      <ChefHat className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{chef.name}</h4>
                      <p className="text-sm text-gray-600">{chef.specialty}</p>
                      <div className="flex items-center space-x-3 mt-1">
                        <div className="flex items-center">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                          <span className="text-sm font-medium">{chef.rating}</span>
                          <span className="text-xs text-gray-500 ml-1">({chef.reviews})</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 text-gray-400 mr-1" />
                          <span className="text-xs text-gray-500">{chef.distance}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">R{chef.hourlyRate}</p>
                      <p className="text-xs text-gray-500">per hour</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 6,
      title: "Booking Confirmed!",
      description: "Your chef is on the way",
      duration: 2000,
      component: (
        <div className="text-center max-w-sm mx-auto">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-green-700 mb-2">Booking Confirmed!</h3>
          <p className="text-gray-600 mb-4">Chef Raj Patel will arrive at 6:00 PM today</p>
          <Card className="bg-green-50 border border-green-200">
            <CardContent className="p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Service:</span>
                  <span className="font-medium">Royal Mughlai Feast</span>
                </div>
                <div className="flex justify-between">
                  <span>Guests:</span>
                  <span className="font-medium">6 people</span>
                </div>
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-bold text-primary">R3,480</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
  ];

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (currentStep < demoSteps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        setIsPlaying(false);
      }
    }, demoSteps[currentStep].duration);

    return () => clearTimeout(timer);
  }, [currentStep, isPlaying, demoSteps]);

  const startDemo = () => {
    setCurrentStep(0);
    setIsPlaying(true);
    setHasStarted(true);
  };

  const resetDemo = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    setHasStarted(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Watch How It Works</h2>
        <p className="text-gray-600 mb-6">
          See how easy it is to book a professional chef with our smart matching system
        </p>
        
        <div className="flex justify-center space-x-4 mb-6">
          <Button 
            onClick={startDemo}
            disabled={isPlaying}
            className="flex items-center space-x-2"
            data-testid="button-start-demo"
          >
            <Play className="h-4 w-4" />
            <span>{hasStarted ? 'Replay Demo' : 'Start Demo'}</span>
          </Button>
          
          {hasStarted && (
            <Button 
              variant="outline" 
              onClick={resetDemo}
              className="flex items-center space-x-2"
              data-testid="button-reset-demo"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset</span>
            </Button>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center space-x-2 mb-8">
          {demoSteps.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index <= currentStep 
                  ? 'bg-primary transform scale-110' 
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Demo Content */}
      <div className="min-h-[500px] flex flex-col items-center justify-center">
        {hasStarted ? (
          <div className="w-full fade-in">
            <div className="text-center mb-6">
              <Badge variant="outline" className="mb-2">
                Step {currentStep + 1} of {demoSteps.length}
              </Badge>
              <h3 className="text-2xl font-semibold mb-2">
                {demoSteps[currentStep].title}
              </h3>
              <p className="text-gray-600">
                {demoSteps[currentStep].description}
              </p>
            </div>
            
            <div className="animate-fadeIn">
              {demoSteps[currentStep].component}
            </div>
            
            {/* Loading indicator when playing */}
            {isPlaying && (
              <div className="flex justify-center mt-6">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span>Next step in {Math.ceil(demoSteps[currentStep].duration / 1000)}s</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-primary/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <ChefHat className="h-16 w-16 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Ready to see the magic?</h3>
            <p className="text-gray-600">
              Click "Start Demo" to see how our smart chef matching works
            </p>
          </div>
        )}
      </div>
    </div>
  );
}