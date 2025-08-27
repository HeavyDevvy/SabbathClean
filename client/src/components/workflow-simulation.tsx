import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, MapPin, Star, CreditCard, Home, Calendar } from "lucide-react";

interface WorkflowSimulationProps {
  onClose: () => void;
}

export default function WorkflowSimulation({ onClose }: WorkflowSimulationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const simulationSteps = [
    {
      step: 1,
      title: "Service Selection",
      description: "John selects 'House Cleaning' for his 3-bedroom home",
      content: {
        service: "House Cleaning",
        details: "3-bedroom house, 2 bathrooms, Deep cleaning",
        location: "Rosebank, Johannesburg",
        date: "Tomorrow, 2:00 PM"
      },
      duration: 2000
    },
    {
      step: 2,
      title: "Provider Matching",
      description: "Our system finds 3 verified providers in your area",
      content: {
        providers: [
          { name: "Maria Santos", rating: 4.9, reviews: 127, distance: "1.2km", price: "R280/hour" },
          { name: "David Chen", rating: 4.8, reviews: 89, distance: "2.1km", price: "R270/hour" },
          { name: "Sarah Johnson", rating: 5.0, reviews: 45, distance: "3.5km", price: "R290/hour" }
        ]
      },
      duration: 3000
    },
    {
      step: 3,
      title: "Provider Selection",
      description: "John chooses Maria Santos - top-rated with excellent reviews",
      content: {
        selectedProvider: {
          name: "Maria Santos",
          rating: 4.9,
          reviews: 127,
          experience: "5 years",
          specialties: ["Deep cleaning", "Move-in/out", "Regular maintenance"],
          verified: true
        }
      },
      duration: 2500
    },
    {
      step: 4,
      title: "Booking Confirmation",
      description: "Payment processed and booking confirmed instantly",
      content: {
        booking: {
          id: "BK-2024-0892",
          service: "House Cleaning",
          provider: "Maria Santos",
          date: "Tomorrow, 2:00 PM",
          duration: "3 hours",
          total: "R840",
          status: "Confirmed"
        }
      },
      duration: 2000
    },
    {
      step: 5,
      title: "Service Delivery",
      description: "Maria arrives on time and completes the service professionally",
      content: {
        completion: {
          arrivalTime: "2:00 PM (On time)",
          completionTime: "5:15 PM",
          rating: 5,
          feedback: "Excellent service! Maria was thorough and professional. Highly recommend!"
        }
      },
      duration: 3000
    }
  ];

  const startSimulation = () => {
    setIsPlaying(true);
    setCurrentStep(0);
    setProgress(0);
  };

  const resetSimulation = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setProgress(0);
  };

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (currentStep < simulationSteps.length - 1) {
        setCurrentStep(prev => prev + 1);
        setProgress(((currentStep + 1) / simulationSteps.length) * 100);
      } else {
        setIsPlaying(false);
      }
    }, simulationSteps[currentStep]?.duration || 2000);

    return () => clearTimeout(timer);
  }, [currentStep, isPlaying]);

  const currentStepData = simulationSteps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl mb-2">See Berry in Action</CardTitle>
          <p className="text-gray-600">Watch how easy it is to book premium home services</p>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Step Indicator */}
          <div className="flex justify-center space-x-2 mb-6">
            {simulationSteps.map((step, index) => (
              <div
                key={step.step}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  index <= currentStep
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {index < currentStep ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  step.step
                )}
              </div>
            ))}
          </div>

          {/* Current Step Content */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold mb-2">{currentStepData?.title}</h3>
            <p className="text-gray-600">{currentStepData?.description}</p>
          </div>

          {/* Step-specific UI Simulation */}
          <div className="min-h-[300px] flex items-center justify-center">
            {currentStep === 0 && (
              <Card className="w-full max-w-md">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Home className="h-8 w-8 text-primary" />
                        <div>
                          <h4 className="font-semibold">House Cleaning</h4>
                          <p className="text-sm text-gray-600">Professional home cleaning</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Selected</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Property:</span>
                        <span className="font-medium">3-bedroom house</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Service type:</span>
                        <span className="font-medium">Deep cleaning</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Location:</span>
                        <span className="font-medium">Rosebank, JHB</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 1 && (
              <div className="w-full space-y-4">
                <div className="text-center mb-4">
                  <Clock className="h-12 w-12 text-primary mx-auto mb-2 animate-spin" />
                  <p className="text-lg font-medium">Finding providers near you...</p>
                </div>
                <div className="grid gap-3">
                  {currentStepData.content.providers?.map((provider, index) => (
                    <Card key={index} className="opacity-80 animate-pulse">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback>{provider.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h5 className="font-medium">{provider.name}</h5>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span>{provider.rating} ({provider.reviews})</span>
                                <MapPin className="h-3 w-3" />
                                <span>{provider.distance}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{provider.price}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <Card className="w-full max-w-md border-2 border-primary">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <Avatar className="h-16 w-16 mx-auto mb-3">
                      <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300" />
                      <AvatarFallback>MS</AvatarFallback>
                    </Avatar>
                    <h4 className="font-semibold text-lg">Maria Santos</h4>
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">4.9</span>
                      <span className="text-gray-600">(127 reviews)</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Verified Professional</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Experience:</span>
                      <span className="font-medium">5 years</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Specialties:</span>
                      <span className="font-medium">Deep cleaning</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rate:</span>
                      <span className="font-medium">R280/hour</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 3 && (
              <Card className="w-full max-w-md">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-3" />
                    <h4 className="font-semibold text-lg">Booking Confirmed!</h4>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Booking ID:</span>
                      <span className="font-medium">BK-2024-0892</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service:</span>
                      <span className="font-medium">House Cleaning</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Provider:</span>
                      <span className="font-medium">Maria Santos</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date & Time:</span>
                      <span className="font-medium">Tomorrow, 2:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-medium">3 hours</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>R840</span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-800">Payment processed successfully</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 4 && (
              <Card className="w-full max-w-md">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="flex justify-center space-x-1 mb-3">
                      {[1,2,3,4,5].map((star) => (
                        <Star key={star} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <h4 className="font-semibold text-lg">Service Completed!</h4>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Arrival:</span>
                      <span className="font-medium text-green-600">2:00 PM (On time)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completed:</span>
                      <span className="font-medium">5:15 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rating:</span>
                      <span className="font-medium">⭐⭐⭐⭐⭐ 5/5</span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800 italic">
                      "Excellent service! Maria was thorough and professional. Highly recommend!"
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center space-x-4 pt-6">
            {!isPlaying && currentStep === 0 && (
              <Button onClick={startSimulation} size="lg" className="bg-primary hover:bg-primary/90">
                Watch Demo
              </Button>
            )}
            {!isPlaying && currentStep > 0 && (
              <Button onClick={resetSimulation} variant="outline">
                Watch Again
              </Button>
            )}
            {isPlaying && (
              <Button variant="outline" disabled>
                Demo Running...
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>

          {/* Call to Action */}
          {currentStep === simulationSteps.length - 1 && !isPlaying && (
            <div className="text-center pt-4 border-t">
              <h4 className="font-semibold text-lg mb-2">Ready to experience Berry yourself?</h4>
              <p className="text-gray-600 mb-4">Join thousands of satisfied customers who trust Berry for their home services</p>
              <Button size="lg" className="bg-primary hover:bg-primary/90" onClick={onClose}>
                Book Your Service Now
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}