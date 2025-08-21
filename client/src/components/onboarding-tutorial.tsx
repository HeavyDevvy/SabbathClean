import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Play, 
  Pause,
  Home,
  Calendar,
  Users,
  Bell,
  Star,
  MapPin,
  CreditCard,
  Shield,
  Sparkles,
  Phone
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  animation: string;
  actionText: string;
  targetElement?: string;
  interactiveDemo?: React.ComponentType<any>;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Berry Events',
    description: 'Your one-stop platform for all home services in South Africa. Let me show you how to get the most out of our platform.',
    icon: Home,
    animation: 'bounce',
    actionText: 'Get Started'
  },
  {
    id: 'services',
    title: 'Discover Services',
    description: 'Browse our 6 main service categories: House Cleaning, Chef & Catering, Waitering, Plumbing, Electrical Work, and Garden Care.',
    icon: Sparkles,
    animation: 'pulse',
    actionText: 'Explore Services',
    targetElement: '.services-section'
  },
  {
    id: 'booking',
    title: 'Easy Booking Process',
    description: 'Book any service in just 3 clicks. Choose your service, select date & time, and confirm your booking.',
    icon: Calendar,
    animation: 'slide',
    actionText: 'Try Booking'
  },
  {
    id: 'providers',
    title: 'Verified Providers',
    description: 'All our service providers are background-checked, insured, and rated by customers for your peace of mind.',
    icon: Shield,
    animation: 'fade',
    actionText: 'View Providers'
  },
  {
    id: 'location',
    title: 'Smart Location Matching',
    description: 'Our AI finds the best providers near you based on distance, ratings, and availability.',
    icon: MapPin,
    animation: 'zoom',
    actionText: 'Enable Location'
  },
  {
    id: 'recommendations',
    title: 'Personalized Recommendations',
    description: 'Get AI-powered service suggestions based on your preferences, booking history, and local trends.',
    icon: Star,
    animation: 'glow',
    actionText: 'See Recommendations'
  },
  {
    id: 'payments',
    title: 'Secure Payments',
    description: 'All payments go through Berry Events Bank first, ensuring 100% security before reaching providers.',
    icon: CreditCard,
    animation: 'shake',
    actionText: 'Payment Info'
  },
  {
    id: 'notifications',
    title: 'Stay Updated',
    description: 'Get push notifications for booking confirmations, provider updates, and exclusive deals.',
    icon: Bell,
    animation: 'ring',
    actionText: 'Enable Notifications'
  },
  {
    id: 'mobile',
    title: 'Mobile App Experience',
    description: 'Install our PWA for offline booking, push notifications, and native app experience.',
    icon: Phone,
    animation: 'wiggle',
    actionText: 'Install App'
  }
];

// Interactive demo components
const BookingDemo = () => (
  <motion.div 
    className="bg-white p-4 rounded-lg border-2 border-blue-200"
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
        <span className="text-sm">Select House Cleaning</span>
        <motion.div 
          className="w-4 h-4 bg-green-500 rounded-full"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 }}
        />
      </div>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
        <span className="text-sm">Choose date & time</span>
        <motion.div 
          className="w-4 h-4 bg-green-500 rounded-full"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.0 }}
        />
      </div>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
        <span className="text-sm">Confirm booking</span>
        <motion.div 
          className="w-4 h-4 bg-green-500 rounded-full"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.5 }}
        />
      </div>
    </div>
  </motion.div>
);

const ProvidersDemo = () => (
  <motion.div 
    className="bg-white p-4 rounded-lg border-2 border-green-200"
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
  >
    <div className="space-y-3">
      {[
        { name: "Nomsa M.", rating: 4.8, verified: true },
        { name: "Thabo K.", rating: 4.9, verified: true },
        { name: "Sarah L.", rating: 4.7, verified: true }
      ].map((provider, index) => (
        <motion.div 
          key={provider.name}
          className="flex items-center justify-between p-2 bg-gray-50 rounded"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: index * 0.2 }}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            <span className="text-sm font-medium">{provider.name}</span>
            {provider.verified && (
              <Badge className="text-xs bg-green-100 text-green-800">
                <Shield className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
            <span className="text-sm">{provider.rating}</span>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

interface OnboardingTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function OnboardingTutorial({ isOpen, onClose, onComplete }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showInteractiveDemo, setShowInteractiveDemo] = useState(false);

  const currentTutorialStep = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  useEffect(() => {
    if (isPlaying && isOpen) {
      const timer = setTimeout(() => {
        if (currentStep < tutorialSteps.length - 1) {
          setCurrentStep(prev => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, 4000); // 4 seconds per step

      return () => clearTimeout(timer);
    }
  }, [currentStep, isPlaying, isOpen]);

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  const getAnimationClass = (animation: string) => {
    const animations = {
      bounce: 'animate-bounce',
      pulse: 'animate-pulse',
      slide: 'transform translate-x-0',
      fade: 'animate-fade-in',
      zoom: 'animate-zoom',
      glow: 'animate-glow',
      shake: 'animate-shake',
      ring: 'animate-ring',
      wiggle: 'animate-wiggle'
    };
    return animations[animation as keyof typeof animations] || '';
  };

  const renderInteractiveDemo = () => {
    switch (currentTutorialStep.id) {
      case 'booking':
        return <BookingDemo />;
      case 'providers':
        return <ProvidersDemo />;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-1"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <span className="text-sm text-gray-500">
                    Step {currentStep + 1} of {tutorialSteps.length}
                  </span>
                </div>
              </div>
              <Button variant="ghost" onClick={onClose} className="p-2">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="text-center mb-8">
              <motion.div 
                className={`inline-block p-4 rounded-full bg-blue-100 mb-4 ${getAnimationClass(currentTutorialStep.animation)}`}
                whileHover={{ scale: 1.1 }}
              >
                <currentTutorialStep.icon className="h-8 w-8 text-blue-600" />
              </motion.div>
              
              <motion.h2 
                className="text-2xl font-bold text-gray-900 mb-3"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {currentTutorialStep.title}
              </motion.h2>
              
              <motion.p 
                className="text-gray-600 max-w-lg mx-auto"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {currentTutorialStep.description}
              </motion.p>
            </div>

            {/* Interactive Demo */}
            <motion.div 
              className="mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {renderInteractiveDemo()}
            </motion.div>

            {/* Special features for specific steps */}
            {currentTutorialStep.id === 'welcome' && (
              <motion.div 
                className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg mb-6"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">6</div>
                    <div className="text-sm text-gray-600">Services</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">500+</div>
                    <div className="text-sm text-gray-600">Providers</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">4.8★</div>
                    <div className="text-sm text-gray-600">Rating</div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentTutorialStep.id === 'payments' && (
              <motion.div 
                className="bg-green-50 p-6 rounded-lg mb-6 border-2 border-green-200"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-800">100% Secure Payment Process</span>
                </div>
                <div className="space-y-2 text-sm text-green-700">
                  <div>• All payments protected by Berry Events Bank</div>
                  <div>• Money held in escrow until service completion</div>
                  <div>• 15% platform fee (industry standard)</div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t bg-gray-50">
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex items-center gap-2">
                {tutorialSteps.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentStep ? 'bg-blue-600' : 
                      index < currentStep ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                    onClick={() => setCurrentStep(index)}
                  />
                ))}
              </div>
              
              <Button 
                onClick={nextStep}
                className="flex items-center gap-2"
              >
                {currentStep === tutorialSteps.length - 1 ? 'Complete' : currentTutorialStep.actionText}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Hook to manage tutorial state
export function useOnboarding() {
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(() => {
    return localStorage.getItem('berry-events-tutorial-completed') === 'true';
  });

  const [showTutorial, setShowTutorial] = useState(false);

  const startTutorial = () => {
    setShowTutorial(true);
  };

  const completeTutorial = () => {
    setHasCompletedTutorial(true);
    localStorage.setItem('berry-events-tutorial-completed', 'true');
    setShowTutorial(false);
  };

  const resetTutorial = () => {
    setHasCompletedTutorial(false);
    localStorage.removeItem('berry-events-tutorial-completed');
  };

  return {
    hasCompletedTutorial,
    showTutorial,
    startTutorial,
    completeTutorial,
    resetTutorial,
    setShowTutorial
  };
}