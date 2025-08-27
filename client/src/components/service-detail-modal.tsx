import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  X, 
  Clock, 
  Star, 
  CheckCircle, 
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Shield,
  Sparkles,
  ChevronRight,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ServiceOption {
  id: string;
  name: string;
  description: string;
  duration: string;
  basePrice: number;
  popular?: boolean;
  includes: string[];
  addOns?: {
    id: string;
    name: string;
    price: number;
    description: string;
  }[];
}

interface ServiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  onSelectService: (serviceId: string, optionId: string, addOns?: string[]) => void;
}

const serviceDetails = {
  'house-cleaning': {
    title: 'House Cleaning Services',
    icon: '🏠',
    description: 'Professional cleaning services for your home',
    options: [
      {
        id: 'basic-clean',
        name: 'Basic Cleaning',
        description: 'Essential cleaning for regular maintenance',
        duration: '2-3 hours',
        basePrice: 280,
        includes: ['Dusting surfaces', 'Vacuuming floors', 'Basic bathroom cleaning', 'Kitchen surfaces'],
        addOns: [
          { id: 'inside-oven', name: 'Inside Oven Cleaning', price: 150, description: 'Deep clean oven interior' },
          { id: 'inside-fridge', name: 'Inside Fridge Cleaning', price: 100, description: 'Clean and sanitize fridge' },
          { id: 'windows', name: 'Window Cleaning', price: 80, description: 'Interior window cleaning' }
        ]
      },
      {
        id: 'deep-clean',
        name: 'Deep Cleaning',
        description: 'Comprehensive cleaning for thorough results',
        duration: '4-6 hours',
        basePrice: 450,
        popular: true,
        includes: ['Everything in Basic', 'Inside appliances', 'Detailed bathroom scrubbing', 'Behind furniture cleaning', 'Window sills and frames'],
        addOns: [
          { id: 'carpet-clean', name: 'Carpet Deep Clean', price: 200, description: 'Professional carpet cleaning' },
          { id: 'upholstery', name: 'Upholstery Cleaning', price: 180, description: 'Sofa and chair cleaning' }
        ]
      },
      {
        id: 'move-clean',
        name: 'Move In/Out Cleaning',
        description: 'Complete cleaning for property transitions',
        duration: '6-8 hours',
        basePrice: 680,
        includes: ['Complete deep clean', 'All appliances inside/out', 'Cupboard interiors', 'Light fixture cleaning', 'Wall spot cleaning'],
        addOns: [
          { id: 'garage-clean', name: 'Garage Cleaning', price: 300, description: 'Complete garage cleaning' }
        ]
      }
    ]
  },
  'chef-catering': {
    title: 'Chef & Catering Services',
    icon: '👨‍🍳',
    description: 'Professional cooking and catering for your events',
    options: [
      {
        id: 'personal-chef',
        name: 'Personal Chef Service',
        description: 'Private chef for intimate dining experiences',
        duration: '3-4 hours',
        basePrice: 850,
        includes: ['Menu consultation', 'Grocery shopping', 'Cooking on-site', 'Kitchen cleanup', 'Serving presentation'],
        addOns: [
          { id: 'wine-pairing', name: 'Wine Pairing', price: 300, description: 'Professional wine selection and pairing' },
          { id: 'special-diet', name: 'Special Dietary Requirements', price: 150, description: 'Vegan, keto, halal adaptations' }
        ]
      },
      {
        id: 'braai-catering',
        name: 'Traditional Braai Catering',
        description: 'Authentic South African braai experience',
        duration: '4-5 hours',
        basePrice: 650,
        popular: true,
        includes: ['Traditional braai setup', 'Meat selection and prep', 'Side dishes', 'Braai master service', 'Equipment provided'],
        addOns: [
          { id: 'traditional-music', name: 'Traditional Music', price: 400, description: 'Live traditional music performance' },
          { id: 'potjie-cooking', name: 'Potjiekos Add-on', price: 250, description: 'Traditional potjie cooking' }
        ]
      },
      {
        id: 'event-catering',
        name: 'Event Catering',
        description: 'Full-service catering for large events',
        duration: '6-8 hours',
        basePrice: 1200,
        includes: ['Menu planning', 'Professional cooking team', 'Serving staff', 'Equipment rental', 'Setup and cleanup'],
        addOns: [
          { id: 'bar-service', name: 'Full Bar Service', price: 800, description: 'Professional bartender and drinks' },
          { id: 'dessert-station', name: 'Dessert Station', price: 450, description: 'Professional dessert display and service' }
        ]
      }
    ]
  },
  'waitering': {
    title: 'Professional Waitering Services',
    icon: '🍽️',
    description: 'Experienced waitstaff for your events',
    options: [
      {
        id: 'basic-service',
        name: 'Basic Waitering',
        description: 'Professional service staff for your event',
        duration: '4-6 hours',
        basePrice: 180,
        includes: ['Professional uniform', 'Table service', 'Drink service', 'Basic cleanup', 'Event coordination'],
        addOns: [
          { id: 'bar-training', name: 'Bar Service Training', price: 100, description: 'Cocktail and wine service' },
          { id: 'extended-hours', name: 'Extended Hours', price: 50, description: 'Per additional hour' }
        ]
      },
      {
        id: 'premium-service',
        name: 'Premium Event Service',
        description: 'High-end service for special occasions',
        duration: '6-8 hours',
        basePrice: 280,
        popular: true,
        includes: ['Everything in Basic', 'Event setup assistance', 'Guest coordination', 'Multiple course service', 'Post-event cleanup'],
        addOns: [
          { id: 'sommelier', name: 'Sommelier Service', price: 400, description: 'Wine expert and service' },
          { id: 'butler-service', name: 'Butler Service', price: 300, description: 'Premium personal service' }
        ]
      }
    ]
  },
  'plumbing': {
    title: 'Plumbing Services',
    icon: '🔧',
    description: 'Professional plumbing repairs and installations',
    options: [
      {
        id: 'emergency-repair',
        name: 'Emergency Plumbing',
        description: 'Urgent plumbing repairs and fixes',
        duration: '1-3 hours',
        basePrice: 380,
        includes: ['Emergency callout', 'Diagnostic inspection', 'Basic repairs', 'Parts (up to R100)', 'Same-day service'],
        addOns: [
          { id: 'after-hours', name: 'After Hours Service', price: 200, description: 'Evening and weekend service' },
          { id: 'major-parts', name: 'Major Parts Replacement', price: 0, description: 'Actual cost of parts' }
        ]
      },
      {
        id: 'installation',
        name: 'Plumbing Installation',
        description: 'New fixture and appliance installations',
        duration: '2-4 hours',
        basePrice: 480,
        popular: true,
        includes: ['Installation service', 'Quality testing', 'Warranty on workmanship', 'Cleanup', 'Professional advice'],
        addOns: [
          { id: 'premium-fixtures', name: 'Premium Fixtures', price: 0, description: 'Upgrade to premium fixtures' },
          { id: 'extended-warranty', name: 'Extended Warranty', price: 150, description: '2-year extended warranty' }
        ]
      }
    ]
  },
  'electrical': {
    title: 'Electrical Services',
    icon: '⚡',
    description: 'Licensed electrical work and installations',
    options: [
      {
        id: 'basic-electrical',
        name: 'Basic Electrical Work',
        description: 'Standard electrical repairs and installations',
        duration: '2-4 hours',
        basePrice: 420,
        includes: ['Electrical inspection', 'Basic repairs', 'Safety testing', 'Certificate of compliance', 'Professional service'],
        addOns: [
          { id: 'circuit-upgrade', name: 'Circuit Board Upgrade', price: 800, description: 'Upgrade electrical panel' },
          { id: 'smart-switches', name: 'Smart Switch Installation', price: 200, description: 'Smart home integration' }
        ]
      },
      {
        id: 'solar-installation',
        name: 'Solar Power Installation',
        description: 'Complete solar power system setup',
        duration: '1-2 days',
        basePrice: 2500,
        popular: true,
        includes: ['System design', 'Professional installation', 'Grid connection', 'Monitoring setup', '5-year warranty'],
        addOns: [
          { id: 'battery-backup', name: 'Battery Backup System', price: 3000, description: 'Complete battery backup' },
          { id: 'monitoring-app', name: 'Advanced Monitoring', price: 300, description: 'Professional monitoring system' }
        ]
      }
    ]
  },
  'garden-care': {
    title: 'Garden Care Services',
    icon: '🌱',
    description: 'Professional landscaping and garden maintenance',
    options: [
      {
        id: 'maintenance',
        name: 'Garden Maintenance',
        description: 'Regular garden upkeep and care',
        duration: '2-4 hours',
        basePrice: 320,
        includes: ['Lawn mowing', 'Edge trimming', 'Weed removal', 'Basic pruning', 'Garden cleanup'],
        addOns: [
          { id: 'fertilizer', name: 'Fertilizer Treatment', price: 150, description: 'Professional fertilizer application' },
          { id: 'pest-control', name: 'Pest Control', price: 200, description: 'Eco-friendly pest management' }
        ]
      },
      {
        id: 'landscaping',
        name: 'Landscaping Design',
        description: 'Complete garden transformation',
        duration: '1-3 days',
        basePrice: 1200,
        popular: true,
        includes: ['Design consultation', 'Plant selection', 'Installation service', 'Irrigation setup', '6-month maintenance'],
        addOns: [
          { id: 'indigenous-plants', name: 'Indigenous Plant Package', price: 500, description: 'Water-wise indigenous plants' },
          { id: 'outdoor-lighting', name: 'Garden Lighting', price: 800, description: 'Professional garden lighting' }
        ]
      }
    ]
  }
};

export default function ServiceDetailModal({ 
  isOpen, 
  onClose, 
  serviceId, 
  onSelectService 
}: ServiceDetailModalProps) {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<'options' | 'customize' | 'summary'>('options');

  const service = serviceDetails[serviceId as keyof typeof serviceDetails];
  const selectedServiceOption = service?.options.find(opt => opt.id === selectedOption);

  const calculateTotal = () => {
    if (!selectedServiceOption) return 0;
    
    const basePrice = selectedServiceOption.basePrice;
    const addOnPrice = selectedAddOns.reduce((total, addOnId) => {
      const addOn = selectedServiceOption.addOns?.find(ao => ao.id === addOnId);
      return total + (addOn?.price || 0);
    }, 0);
    
    return basePrice + addOnPrice;
  };

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
    setCurrentStep('customize');
  };

  const handleAddOnToggle = (addOnId: string) => {
    setSelectedAddOns(prev => 
      prev.includes(addOnId) 
        ? prev.filter(id => id !== addOnId)
        : [...prev, addOnId]
    );
  };

  const handleBookService = () => {
    onSelectService(serviceId, selectedOption, selectedAddOns);
    onClose();
  };

  if (!isOpen || !service) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{service.icon}</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{service.title}</h2>
                <p className="text-gray-600">{service.description}</p>
              </div>
            </div>
            <Button variant="ghost" onClick={onClose} className="p-2">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Progress Steps */}
          <div className="mt-6 flex items-center gap-4">
            <div className={`flex items-center gap-2 ${currentStep === 'options' ? 'text-blue-600' : currentStep === 'customize' || currentStep === 'summary' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${currentStep === 'options' ? 'border-blue-600 bg-blue-50' : currentStep === 'customize' || currentStep === 'summary' ? 'border-green-600 bg-green-50' : 'border-gray-300'}`}>
                1
              </div>
              <span className="text-sm font-medium">Select Service</span>
            </div>
            
            <ChevronRight className="h-4 w-4 text-gray-400" />
            
            <div className={`flex items-center gap-2 ${currentStep === 'customize' ? 'text-blue-600' : currentStep === 'summary' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${currentStep === 'customize' ? 'border-blue-600 bg-blue-50' : currentStep === 'summary' ? 'border-green-600 bg-green-50' : 'border-gray-300'}`}>
                2
              </div>
              <span className="text-sm font-medium">Customize</span>
            </div>
            
            <ChevronRight className="h-4 w-4 text-gray-400" />
            
            <div className={`flex items-center gap-2 ${currentStep === 'summary' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${currentStep === 'summary' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                3
              </div>
              <span className="text-sm font-medium">Book</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {currentStep === 'options' && (
              <motion.div
                key="options"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-semibold mb-4">Choose Your Service Option</h3>
                
                {service.options.map((option, index) => (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all hover:shadow-lg ${selectedOption === option.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:border-blue-300'}`}
                      onClick={() => handleOptionSelect(option.id)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <CardTitle className="text-lg">{option.name}</CardTitle>
                              {option.popular && (
                                <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  Most Popular
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm">{option.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">R{option.basePrice}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {option.duration}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-sm text-gray-700 mb-2">Includes:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                              {option.includes.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                                  <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                                  <span>{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {option.addOns && option.addOns.length > 0 && (
                            <div className="pt-2 border-t">
                              <h4 className="font-medium text-sm text-gray-700 mb-2">Available Add-ons:</h4>
                              <div className="flex flex-wrap gap-2">
                                {option.addOns.slice(0, 3).map((addOn) => (
                                  <Badge key={addOn.id} variant="outline" className="text-xs">
                                    {addOn.name} (+R{addOn.price})
                                  </Badge>
                                ))}
                                {option.addOns.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{option.addOns.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {currentStep === 'customize' && selectedServiceOption && (
              <motion.div
                key="customize"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">Customize Your Service</h3>
                    <p className="text-gray-600">Selected: {selectedServiceOption.name}</p>
                  </div>
                  <Button variant="outline" onClick={() => setCurrentStep('options')}>
                    Change Service
                  </Button>
                </div>

                {selectedServiceOption.addOns && selectedServiceOption.addOns.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Add-on Services</CardTitle>
                      <p className="text-sm text-gray-600">Enhance your service with these optional add-ons</p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedServiceOption.addOns.map((addOn, index) => (
                        <motion.div
                          key={addOn.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedAddOns.includes(addOn.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                          onClick={() => handleAddOnToggle(addOn.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${selectedAddOns.includes(addOn.id) ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                                  {selectedAddOns.includes(addOn.id) && (
                                    <CheckCircle className="h-3 w-3 text-white" />
                                  )}
                                </div>
                                <h4 className="font-medium">{addOn.name}</h4>
                              </div>
                              <p className="text-sm text-gray-600 ml-6">{addOn.description}</p>
                            </div>
                            <div className="text-lg font-semibold text-blue-600">
                              {addOn.price > 0 ? `+R${addOn.price}` : 'Quote'}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep('options')}>
                    Back
                  </Button>
                  <Button onClick={() => setCurrentStep('summary')}>
                    Continue to Summary
                  </Button>
                </div>
              </motion.div>
            )}

            {currentStep === 'summary' && selectedServiceOption && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-semibold">Service Summary</h3>

                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-lg">{selectedServiceOption.name}</h4>
                          <p className="text-gray-600">{selectedServiceOption.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold">R{selectedServiceOption.basePrice}</div>
                          <div className="text-sm text-gray-500">{selectedServiceOption.duration}</div>
                        </div>
                      </div>

                      {selectedAddOns.length > 0 && (
                        <>
                          <Separator />
                          <div>
                            <h5 className="font-medium mb-2">Selected Add-ons:</h5>
                            <div className="space-y-2">
                              {selectedAddOns.map(addOnId => {
                                const addOn = selectedServiceOption.addOns?.find(ao => ao.id === addOnId);
                                return addOn ? (
                                  <div key={addOn.id} className="flex items-center justify-between text-sm">
                                    <span>{addOn.name}</span>
                                    <span>+R{addOn.price}</span>
                                  </div>
                                ) : null;
                              })}
                            </div>
                          </div>
                        </>
                      )}

                      <Separator />
                      
                      <div className="flex items-center justify-between text-lg font-bold">
                        <span>Total Cost:</span>
                        <span className="text-blue-600">R{calculateTotal()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Next Steps:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• Choose your preferred date and time</li>
                        <li>• Confirm your location and contact details</li>
                        <li>• Make secure payment through Berry Events Bank</li>
                        <li>• Receive confirmation and provider contact</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep('customize')}>
                    Back
                  </Button>
                  <Button onClick={handleBookService} className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Book This Service
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}