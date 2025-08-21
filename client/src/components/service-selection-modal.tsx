import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Clock, Star, ArrowRight, CreditCard, Building } from "lucide-react";

interface ServiceOption {
  id: string;
  name: string;
  price: number;
  duration: string;
  description: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  priceUnit: string;
  options: ServiceOption[];
  color: string;
  bgColor: string;
  textColor: string;
}

interface ServiceSelectionModalProps {
  onClose: () => void;
  onServiceSelect: (serviceId: string, optionId: string) => void;
}

export default function ServiceSelectionModal({ onClose, onServiceSelect }: ServiceSelectionModalProps) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedOption, setSelectedOption] = useState<ServiceOption | null>(null);

  const allServices: Service[] = [
    {
      id: "house-cleaning",
      name: "House Cleaning",
      description: "Professional home cleaning services",
      basePrice: 280,
      priceUnit: "hour",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
      options: [
        { id: "basic", name: "Basic Cleaning", price: 280, duration: "2-3 hours", description: "General cleaning, dusting, vacuuming" },
        { id: "deep", name: "Deep Cleaning", price: 350, duration: "4-6 hours", description: "Thorough cleaning including inside appliances, baseboards" },
        { id: "move-in", name: "Move-in/Move-out", price: 420, duration: "5-7 hours", description: "Complete cleaning for moving situations" },
        { id: "spring", name: "Spring Cleaning", price: 380, duration: "Full day", description: "Comprehensive seasonal deep clean" }
      ]
    },
    {
      id: "plumbing",
      name: "Plumbing Services",
      description: "Professional plumbing repairs and installations",
      basePrice: 380,
      priceUnit: "hour",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      options: [
        { id: "repair", name: "General Repairs", price: 380, duration: "1-2 hours", description: "Leaks, faucets, basic plumbing fixes" },
        { id: "installation", name: "Installation Services", price: 450, duration: "2-4 hours", description: "New fixtures, appliances, piping" },
        { id: "emergency", name: "Emergency Call-out", price: 550, duration: "Immediate", description: "24/7 urgent plumbing issues" },
        { id: "maintenance", name: "Preventive Maintenance", price: 320, duration: "1-2 hours", description: "Regular checks and upkeep" }
      ]
    },
    {
      id: "electrical",
      name: "Electrical Services",
      description: "Certified electrical work and installations",
      basePrice: 420,
      priceUnit: "hour",
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-700",
      options: [
        { id: "basic", name: "Basic Electrical", price: 420, duration: "1-2 hours", description: "Outlets, switches, basic wiring" },
        { id: "lighting", name: "Lighting Installation", price: 480, duration: "2-3 hours", description: "Light fixtures, ceiling fans, LED setup" },
        { id: "safety", name: "Safety Inspection", price: 350, duration: "1-2 hours", description: "Electrical safety assessment" },
        { id: "panel", name: "Panel Upgrades", price: 650, duration: "4-6 hours", description: "Circuit breaker, main panel work" }
      ]
    },
    {
      id: "chef-catering",
      name: "Chef & Catering",
      description: "Professional culinary services and event catering",
      basePrice: 550,
      priceUnit: "event",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-700",
      options: [
        { id: "personal", name: "Personal Chef", price: 550, duration: "3-4 hours", description: "Custom meal preparation at your home" },
        { id: "event-small", name: "Small Event (10-20 people)", price: 1200, duration: "4-6 hours", description: "Intimate gatherings and dinner parties" },
        { id: "event-medium", name: "Medium Event (20-50 people)", price: 2500, duration: "6-8 hours", description: "Corporate events, celebrations" },
        { id: "event-large", name: "Large Event (50+ people)", price: 4500, duration: "Full day", description: "Weddings, major celebrations" }
      ]
    },
    {
      id: "waitering",
      name: "Waitering Services",
      description: "Professional event staff and service",
      basePrice: 220,
      priceUnit: "hour",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      options: [
        { id: "basic", name: "Table Service", price: 220, duration: "Per hour", description: "Professional serving staff" },
        { id: "bar", name: "Bar Service", price: 280, duration: "Per hour", description: "Bartender with cocktail expertise" },
        { id: "event", name: "Event Coordination", price: 350, duration: "Per hour", description: "Full event management and service" },
        { id: "formal", name: "Formal Service", price: 320, duration: "Per hour", description: "High-end formal dining service" }
      ]
    },
    {
      id: "garden-care",
      name: "Garden Care",
      description: "Professional garden maintenance and landscaping",
      basePrice: 350,
      priceUnit: "hour",
      color: "from-teal-500 to-teal-600",
      bgColor: "bg-teal-50",
      textColor: "text-teal-700",
      options: [
        { id: "maintenance", name: "Garden Maintenance", price: 350, duration: "2-4 hours", description: "Lawn mowing, weeding, general upkeep" },
        { id: "landscaping", name: "Landscaping", price: 450, duration: "4-8 hours", description: "Design and plant installation" },
        { id: "cleanup", name: "Garden Cleanup", price: 320, duration: "2-3 hours", description: "Seasonal cleanup, debris removal" },
        { id: "irrigation", name: "Irrigation Setup", price: 550, duration: "3-5 hours", description: "Sprinkler and watering system installation" }
      ]
    }
  ];

  const calculateTotal = (basePrice: number) => {
    const platformFee = Math.round(basePrice * 0.15); // 15% platform fee
    const paymentFee = Math.round(basePrice * 0.035); // 3.5% payment processing
    return basePrice + platformFee + paymentFee;
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setSelectedOption(null);
  };

  const handleOptionSelect = (option: ServiceOption) => {
    setSelectedOption(option);
  };

  const handleBookNow = () => {
    if (selectedService && selectedOption) {
      onServiceSelect(selectedService.id, selectedOption.id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-white">
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Choose Your Service
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Select a service category, then choose your specific option
              </p>
            </div>
            <Button 
              onClick={onClose}
              variant="ghost" 
              size="sm"
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {!selectedService ? (
            // Service Category Selection
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                All Services Available
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allServices.map((service) => (
                  <Card
                    key={service.id}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${service.bgColor} border-0`}
                    onClick={() => handleServiceSelect(service)}
                  >
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className={`w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br ${service.color} flex items-center justify-center`}>
                          <div className="w-6 h-6 bg-white rounded-full"></div>
                        </div>
                        <h4 className={`font-bold ${service.textColor} mb-1`}>
                          {service.name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {service.description}
                        </p>
                        <p className="text-sm font-semibold text-gray-800">
                          From R{service.basePrice}/{service.priceUnit}
                        </p>
                        <div className="mt-3">
                          <Badge variant="outline" className="text-xs">
                            {service.options.length} options available
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : !selectedOption ? (
            // Service Option Selection
            <div>
              <div className="flex items-center mb-6">
                <Button 
                  onClick={() => setSelectedService(null)}
                  variant="ghost"
                  size="sm"
                  className="mr-4"
                >
                  ← Back to Services
                </Button>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedService.name} Options
                  </h3>
                  <p className="text-gray-600">Choose the service level that best fits your needs</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedService.options.map((option) => (
                  <Card
                    key={option.id}
                    className="cursor-pointer transition-all duration-300 hover:shadow-lg border-2 hover:border-blue-300"
                    onClick={() => handleOptionSelect(option)}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">
                            {option.name}
                          </h4>
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <Clock className="h-4 w-4 mr-1" />
                            {option.duration}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            R{option.price}
                          </div>
                          <div className="text-xs text-gray-500">
                            + fees
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-4">
                        {option.description}
                      </p>
                      <div className="flex items-center text-sm text-blue-600">
                        <Star className="h-4 w-4 mr-1 fill-current" />
                        Highly rated service
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            // Booking Summary and Payment
            <div>
              <div className="flex items-center mb-6">
                <Button 
                  onClick={() => setSelectedOption(null)}
                  variant="ghost"
                  size="sm"
                  className="mr-4"
                >
                  ← Back to Options
                </Button>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Booking Summary
                  </h3>
                  <p className="text-gray-600">Review your selection and payment options</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Service Summary */}
                <div>
                  <Card className={`${selectedService.bgColor} border-0`}>
                    <CardContent className="p-6">
                      <h4 className="text-lg font-bold text-gray-900 mb-2">
                        {selectedService.name}
                      </h4>
                      <div className="text-xl font-bold text-blue-600 mb-2">
                        {selectedOption.name}
                      </div>
                      <div className="space-y-2 text-sm text-gray-700">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          Duration: {selectedOption.duration}
                        </div>
                        <p>{selectedOption.description}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment Breakdown */}
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="text-lg">Payment Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Service Cost</span>
                          <span>R{selectedOption.price}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Platform Fee (15%)</span>
                          <span>R{Math.round(selectedOption.price * 0.15)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Payment Processing (3.5%)</span>
                          <span>R{Math.round(selectedOption.price * 0.035)}</span>
                        </div>
                        <hr />
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total</span>
                          <span>R{calculateTotal(selectedOption.price)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Payment Options */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Payment Options
                  </h4>
                  
                  <div className="space-y-4">
                    {/* Card Payment */}
                    <Card className="border-2 border-blue-200 bg-blue-50">
                      <CardContent className="p-4">
                        <div className="flex items-center mb-3">
                          <CreditCard className="h-5 w-5 text-blue-600 mr-3" />
                          <div>
                            <h5 className="font-semibold text-gray-900">Credit/Debit Card</h5>
                            <p className="text-sm text-gray-600">Instant payment via Berry Events secure gateway</p>
                          </div>
                        </div>
                        <div className="text-sm text-blue-700 bg-blue-100 p-2 rounded">
                          ✓ Instant confirmation • ✓ Secure encryption • ✓ All major cards accepted
                        </div>
                      </CardContent>
                    </Card>

                    {/* Bank Transfer */}
                    <Card className="border-2 border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-center mb-3">
                          <Building className="h-5 w-5 text-gray-600 mr-3" />
                          <div>
                            <h5 className="font-semibold text-gray-900">Bank Transfer (EFT)</h5>
                            <p className="text-sm text-gray-600">Direct bank transfer • 1-2 business days</p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-700 bg-gray-100 p-2 rounded">
                          Banking details provided after booking confirmation
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Book Now Button */}
                  <Button 
                    onClick={handleBookNow}
                    className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
                  >
                    Proceed to Book Service
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>

                  <div className="mt-4 text-center text-sm text-gray-600">
                    <p>By proceeding, you agree to our terms of service.</p>
                    <p>Payment is secured by Berry Events Bank.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}