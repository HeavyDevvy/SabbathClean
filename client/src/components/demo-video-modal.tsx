import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX,
  X,
  Maximize2,
  CheckCircle,
  Calendar,
  CreditCard,
  Star,
  Phone
} from "lucide-react";

interface DemoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DemoVideoModal({ isOpen, onClose }: DemoVideoModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Demo steps - simulating the booking experience
  const demoSteps = [
    {
      title: "Browse Services",
      description: "Choose from 8 comprehensive service categories",
      scene: "service-selection",
      duration: 3000
    },
    {
      title: "Select Your Service",
      description: "Pick House Cleaning and configure your preferences",
      scene: "service-config",
      duration: 4000
    },
    {
      title: "Enter Details",
      description: "Add your address, preferred date and time",
      scene: "booking-details", 
      duration: 3500
    },
    {
      title: "Choose Provider",
      description: "Select from verified professionals in your area",
      scene: "provider-selection",
      duration: 3000
    },
    {
      title: "Secure Payment",
      description: "Complete your booking with Berry Events Bank protection",
      scene: "payment",
      duration: 2500
    },
    {
      title: "Booking Confirmed",
      description: "Get instant confirmation with all booking details",
      scene: "confirmation",
      duration: 3000
    }
  ];

  const totalDuration = demoSteps.reduce((sum, step) => sum + step.duration, 0);

  useEffect(() => {
    if (isPlaying && isOpen) {
      let currentProgress = 0;
      const stepStartTime = demoSteps.slice(0, currentStep).reduce((sum, step) => sum + step.duration, 0);
      
      intervalRef.current = setInterval(() => {
        currentProgress += 100;
        const totalProgress = stepStartTime + currentProgress;
        setProgress((totalProgress / totalDuration) * 100);

        if (currentProgress >= demoSteps[currentStep].duration) {
          if (currentStep < demoSteps.length - 1) {
            setCurrentStep(currentStep + 1);
          } else {
            setIsPlaying(false);
            setProgress(100);
          }
        }
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, currentStep, isOpen]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setProgress(0);
  };

  const renderScene = () => {
    const step = demoSteps[currentStep];
    
    switch (step?.scene) {
      case "service-selection":
        return (
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-lg">
            <h3 className="text-2xl font-bold mb-6 text-center">Choose Your Service</h3>
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-4xl mb-2">✨</div>
                  <h4 className="font-bold">House Cleaning</h4>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-4xl mb-2">🌿</div>
                  <h4 className="font-bold">Garden Care</h4>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-4xl mb-2">👨‍🍳</div>
                  <h4 className="font-bold">Chef & Catering</h4>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-4xl mb-2">🔧</div>
                  <h4 className="font-bold">Plumbing</h4>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "service-config":
        return (
          <div className="bg-white p-8 rounded-lg border">
            <h3 className="text-2xl font-bold mb-6">House Cleaning Service</h3>
            <div className="space-y-4">
              <div>
                <label className="block font-medium mb-2">Property Type</label>
                <select className="w-full p-3 border rounded-lg">
                  <option>House</option>
                </select>
              </div>
              <div>
                <label className="block font-medium mb-2">Cleaning Type</label>
                <div className="grid grid-cols-3 gap-2">
                  <Badge className="bg-blue-100 text-blue-800 p-2">
                    Basic Clean
                  </Badge>
                  <Badge className="bg-primary text-white p-2">
                    Deep Clean ✓
                  </Badge>
                  <Badge className="bg-gray-100 text-gray-800 p-2">
                    Move In/Out
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        );

      case "booking-details":
        return (
          <div className="bg-white p-8 rounded-lg border">
            <h3 className="text-2xl font-bold mb-6">Booking Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block font-medium mb-2">Address</label>
                <input 
                  className="w-full p-3 border rounded-lg" 
                  value="123 Sandton Drive, Johannesburg"
                  readOnly
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-2">Date</label>
                  <div className="flex items-center p-3 border rounded-lg">
                    <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                    <span>Tomorrow</span>
                  </div>
                </div>
                <div>
                  <label className="block font-medium mb-2">Time</label>
                  <div className="flex items-center p-3 border rounded-lg">
                    <span>10:00 AM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "provider-selection":
        return (
          <div className="bg-white p-8 rounded-lg border">
            <h3 className="text-2xl font-bold mb-6">Choose Your Provider</h3>
            <div className="space-y-4">
              <Card className="border-2 border-primary bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <img 
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face"
                      alt="Provider"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-bold">Thabo Mthembu</h4>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold ml-1">4.9</span>
                        </div>
                        <span className="text-gray-500">(156 reviews)</span>
                        <Badge variant="secondary">3.2km away</Badge>
                      </div>
                      <p className="text-sm text-gray-600">Deep Cleaning Specialist</p>
                    </div>
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "payment":
        return (
          <div className="bg-white p-8 rounded-lg border">
            <h3 className="text-2xl font-bold mb-6">Secure Payment</h3>
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">Berry Events Bank Protection</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Your payment is held securely until service completion
                </p>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">Total Amount</span>
                <span className="text-2xl font-bold text-primary">R450</span>
              </div>
              <Card className="border-2 border-primary bg-primary/5">
                <CardContent className="p-4 text-center">
                  <CreditCard className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h4 className="font-semibold">Credit/Debit Card</h4>
                  <p className="text-sm text-gray-600">Secure card payment</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "confirmation":
        return (
          <div className="bg-green-50 p-8 rounded-lg border border-green-200">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-green-800 mb-2">Booking Confirmed!</h3>
              <p className="text-green-700 mb-4">
                Booking Reference: <span className="font-mono font-bold">#BE123456</span>
              </p>
              <div className="space-y-2 text-sm text-green-600">
                <div className="flex items-center justify-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>Provider will contact you within 2 hours</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Service scheduled for tomorrow at 10:00 AM</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Play className="h-6 w-6 text-primary" />
            <span>Berry Events Booking Experience Demo</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{demoSteps[currentStep]?.title}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Current Step Info */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {demoSteps[currentStep]?.title}
            </h3>
            <p className="text-gray-600">
              {demoSteps[currentStep]?.description}
            </p>
          </div>

          {/* Video Scene */}
          <div className="min-h-[400px] bg-gray-50 rounded-lg p-4 flex items-center justify-center">
            {renderScene()}
          </div>

          {/* Single Play Demo Control */}
          <div className="flex items-center justify-center py-4 border-t">
            {!isPlaying && progress === 0 && (
              <Button
                onClick={() => setIsPlaying(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
              >
                <Play className="h-5 w-5 mr-2" />
                Play Demo
              </Button>
            )}
            {(isPlaying || progress > 0) && (
              <div className="text-sm text-gray-600">
                {isPlaying ? 'Demo playing...' : 'Demo completed'}
                {progress >= 100 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRestart}
                    className="ml-4"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Watch Again
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Step Indicators - Visual Only */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {demoSteps.map((step, index) => (
              <div
                key={index}
                className={`p-2 text-xs rounded-lg border ${
                  index === currentStep 
                    ? 'bg-primary text-white border-primary' 
                    : index < currentStep 
                      ? 'bg-green-100 text-green-800 border-green-200'
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                }`}
              >
                {step.title}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}