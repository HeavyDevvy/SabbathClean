import Header from "@/components/header";
import Hero from "@/components/hero";
import Services from "@/components/services";
import { AnimatedBookingDemo } from "@/components/animated-booking-demo";
import FeaturedProviders from "@/components/featured-providers";
import Testimonials from "@/components/testimonials";
import DynamicPricing from "@/components/dynamic-pricing";
import Footer from "@/components/footer";
import ServiceSpecificBooking from "@/components/service-specific-booking";
import ProviderOnboarding from "@/components/provider-onboarding";
import { useState } from "react";
import { Plus, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");
  const [isProviderOnboardingOpen, setIsProviderOnboardingOpen] = useState(false);

  const openBooking = (service?: string) => {
    if (service) setSelectedService(service);
    setIsBookingOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onBookingClick={() => openBooking()} />
      <main>
        <Hero onBookingClick={() => openBooking()} />
        <Services onServiceSelect={openBooking} />
        <section id="demo-section" className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <AnimatedBookingDemo />
          </div>
        </section>
        <FeaturedProviders />
        <Testimonials />
        <DynamicPricing onBookingClick={() => openBooking()} />
      </main>
      <Footer />
      
      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
        <Button
          onClick={() => setIsProviderOnboardingOpen(true)}
          className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 bg-green-600 hover:bg-green-700"
          data-testid="floating-provider-button"
          title="Become a Provider"
        >
          <Users className="h-5 w-5" />
        </Button>
        <Button
          onClick={() => openBooking()}
          className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
          data-testid="floating-book-button"
          title="Book Service"
        >
          <Calendar className="h-5 w-5" />
        </Button>
      </div>

      <ServiceSpecificBooking 
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        serviceId={selectedService}
      />
      
      <ProviderOnboarding 
        isOpen={isProviderOnboardingOpen}
        onClose={() => setIsProviderOnboardingOpen(false)}
      />
    </div>
  );
}
