import SweepSouthStyleHeader from "@/components/sweepsouth-style-header";
import Hero from "@/components/hero";
import SweepSouthStyleServices from "@/components/sweepsouth-style-services";
import HowItWorksSection from "@/components/how-it-works-section";
import TrustSafetySection from "@/components/trust-safety-section";
import BerryStarsSection from "@/components/berry-stars-section";
import Footer from "@/components/footer";
import QuickBookingModal from "@/components/quick-booking-modal";
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
      <SweepSouthStyleHeader onBookingClick={() => openBooking()} />
      <main>
        <Hero onBookingClick={() => openBooking()} />
        <SweepSouthStyleServices onServiceSelect={openBooking} />
        <HowItWorksSection />
        <BerryStarsSection />
        <TrustSafetySection />
      </main>
      <Footer />

      {/* Modals */}
      {isBookingOpen && (
        <QuickBookingModal 
          selectedService={selectedService}
          onClose={() => setIsBookingOpen(false)}
        />
      )}
      
      {isProviderOnboardingOpen && (
        <ProviderOnboarding 
          isOpen={isProviderOnboardingOpen}
          onClose={() => setIsProviderOnboardingOpen(false)}
        />
      )}
    </div>
  );
}
