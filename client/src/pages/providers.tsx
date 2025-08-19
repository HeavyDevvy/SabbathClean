import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import Footer from "@/components/footer";
import BookingModal from "@/components/booking-modal";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, CheckCircle, Shield } from "lucide-react";
import { ServiceProvider } from "@shared/schema";

export default function Providers() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  
  const { data: providers, isLoading } = useQuery<ServiceProvider[]>({
    queryKey: ["/api/providers"],
  });
  
  const openBooking = (providerId?: string) => {
    if (providerId) setSelectedProvider(providerId);
    setIsBookingOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="mt-4 text-neutral">Loading providers...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onBookingClick={() => openBooking()} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Verified Professionals</h1>
          <p className="text-lg text-neutral">Background-checked, insured, and highly-rated service providers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {providers?.map((provider) => (
            <Card key={provider.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300" data-testid={`card-provider-${provider.id}`}>
              <div className="aspect-w-16 aspect-h-9">
                <img 
                  src={provider.profileImage || "https://images.unsplash.com/photo-1494790108755-2616b612b588?w=300"} 
                  alt={`Professional service provider`}
                  className="w-full h-48 object-cover"
                />
              </div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{provider.firstName} {provider.lastName}</h3>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-accent fill-current" />
                    <span className="ml-1 text-sm font-medium">{provider.rating}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {provider.servicesOffered.map((service) => (
                    <Badge key={service} variant="secondary" className="text-xs">
                      {service.replace('-', ' ')}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center text-xs text-neutral mb-3">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>Available in {provider.location}</span>
                </div>

                <div className="flex items-center text-xs text-secondary mb-3">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  <span>Background Verified</span>
                  {provider.insuranceVerified && (
                    <>
                      <Shield className="h-3 w-3 ml-2 mr-1" />
                      <span>Insured</span>
                    </>
                  )}
                </div>

                <p className="text-xs text-neutral mb-4">{provider.bio}</p>

                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold text-primary">
                    R{provider.hourlyRate}/hour
                  </div>
                  <Button size="sm" onClick={() => openBooking(provider.id)} data-testid={`button-book-${provider.id}`}>
                    Book Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
      
      <BookingModal 
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        selectedProvider={selectedProvider}
      />
    </div>
  );
}
