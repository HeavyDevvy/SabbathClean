import Header from "@/components/header";
import Hero from "@/components/hero";
import Services from "@/components/services";
import { AnimatedBookingDemo } from "@/components/animated-booking-demo";
import FeaturedProviders from "@/components/featured-providers";
import Testimonials from "@/components/testimonials";
import Pricing from "@/components/pricing";
import Footer from "@/components/footer";
import ServiceSpecificBooking from "@/components/service-specific-booking";
import { useState } from "react";
import { Plus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");

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
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <AnimatedBookingDemo />
          </div>
        </section>
        <FeaturedProviders />
        <Testimonials />
        <Pricing onBookingClick={() => openBooking()} />
      </main>
      <Footer />
      
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          onClick={() => openBooking()}
          className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
          data-testid="floating-book-button"
        >
          <Calendar className="h-5 w-5" />
        </Button>
      </div>

      <ServiceSpecificBooking 
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        serviceId={selectedService}
      />
    </div>
  );
}
