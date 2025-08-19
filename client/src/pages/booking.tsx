import { useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ServiceSpecificBooking from "@/components/service-specific-booking";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, Clock, MapPin, ChefHat, Sparkles, Wrench, Zap, Scissors, Truck, ArrowRight } from "lucide-react";

export default function Booking() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");

  const openBooking = (serviceId?: string) => {
    if (serviceId) setSelectedService(serviceId);
    setIsBookingOpen(true);
  };

  const services = [
    {
      id: "chef-catering",
      name: "Chef & Catering",
      icon: <ChefHat className="h-8 w-8" />,
      description: "Professional chef services for any occasion",
      price: "R550",
      priceUnit: "starting from",
      badge: "Premium Service",
      badgeVariant: "secondary" as const,
      color: "border-orange-500 hover:bg-orange-50",
      iconColor: "text-orange-500"
    },
    {
      id: "house-cleaning",
      name: "House Cleaning",
      icon: <Sparkles className="h-8 w-8" />,
      description: "Eco-friendly cleaning solutions",
      price: "R280",
      priceUnit: "per hour",
      badge: "Most Popular",
      badgeVariant: "default" as const,
      color: "border-blue-500 hover:bg-blue-50",
      iconColor: "text-blue-500"
    },
    {
      id: "plumbing",
      name: "Plumbing",
      icon: <Wrench className="h-8 w-8" />,
      description: "Certified plumbers available 24/7",
      price: "R400",
      priceUnit: "per hour",
      badge: "Emergency",
      badgeVariant: "destructive" as const,
      color: "border-green-500 hover:bg-green-50",
      iconColor: "text-green-500"
    },
    {
      id: "electrical",
      name: "Electrical",
      icon: <Zap className="h-8 w-8" />,
      description: "Safety-certified electrical repairs",
      price: "R450",
      priceUnit: "per hour",
      badge: "Licensed",
      badgeVariant: "secondary" as const,
      color: "border-yellow-500 hover:bg-yellow-50",
      iconColor: "text-yellow-500"
    },
    {
      id: "gardening",
      name: "Garden Care",
      icon: <Scissors className="h-8 w-8" />,
      description: "Sustainable garden maintenance",
      price: "R540",
      priceUnit: "per hour",
      badge: "Eco-Friendly",
      badgeVariant: "secondary" as const,
      color: "border-emerald-500 hover:bg-emerald-50",
      iconColor: "text-emerald-500"
    },
    {
      id: "home-moving",
      name: "Home Moving",
      icon: <Truck className="h-8 w-8" />,
      description: "Complete relocation solutions",
      price: "R450",
      priceUnit: "per hour",
      badge: "Full Service",
      badgeVariant: "secondary" as const,
      color: "border-purple-500 hover:bg-purple-50",
      iconColor: "text-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onBookingClick={openBooking} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Book Your Service</h1>
          <p className="text-lg text-neutral">Complete your booking in just 2 minutes</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Choose Your Service
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral mb-6">Select the service you need to get matched with verified professionals in your area.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <Card 
                      key={service.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-lg transform hover:scale-[1.02] ${service.color}`}
                      onClick={() => openBooking(service.id)}
                      data-testid={`service-card-${service.id}`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={service.iconColor}>
                            {service.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{service.name}</h3>
                            <Badge variant={service.badgeVariant} className="text-xs">
                              {service.badge}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-2xl font-bold text-primary">{service.price}</span>
                            <span className="text-sm text-gray-500 ml-1">{service.priceUnit}</span>
                          </div>
                          <ArrowRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sample Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-neutral">Service:</span>
                  <span className="font-medium">House Cleaning</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral">Duration:</span>
                  <span className="font-medium">3 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral">Rate:</span>
                  <span className="font-medium">R450/hour</span>
                </div>
                <div className="border-t pt-4 flex justify-between font-semibold">
                  <span>Total:</span>
                  <span className="text-primary">R1,350</span>
                </div>
                <Button 
                  onClick={() => openBooking()}
                  className="w-full" 
                  data-testid="button-confirm-booking"
                >
                  Start Booking
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Why Choose Berry Events?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-secondary mr-2" />
                  Background verified professionals
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-secondary mr-2" />
                  Full insurance coverage
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-secondary mr-2" />
                  Satisfaction guarantee
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-secondary mr-2" />
                  Same-day booking available
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
      
      <ServiceSpecificBooking 
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        serviceId={selectedService}
      />
    </div>
  );
}
