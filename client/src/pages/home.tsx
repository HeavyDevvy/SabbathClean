import Header from "@/components/header";
import Hero from "@/components/hero";
import Services from "@/components/services";
import ProvenirStyleDemo from "@/components/provenir-style-demo";
import FeaturedProviders from "@/components/featured-providers";
import Testimonials from "@/components/testimonials";
import DynamicPricing from "@/components/dynamic-pricing";
import CompetitiveAdvantage from "@/components/competitive-advantage";
import Footer from "@/components/footer";
import EnhancedBooking from "@/pages/enhanced-booking";
import ProviderOnboarding from "@/components/provider-onboarding";
import { useState } from "react";

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
        <section id="demo-section">
          <ProvenirStyleDemo />
        </section>
        <FeaturedProviders />
        <Testimonials />
        <DynamicPricing onBookingClick={() => openBooking()} />
        <CompetitiveAdvantage />
      </main>
      <Footer />

      {/* Modals */}
      {isBookingOpen && (
        <EnhancedBooking 
          selectedService={selectedService}
          onClose={() => setIsBookingOpen(false)}
        />
      )}
      
      <ProviderOnboarding 
        isOpen={isProviderOnboardingOpen}
        onClose={() => setIsProviderOnboardingOpen(false)}
      />
    </div>
  );
}
