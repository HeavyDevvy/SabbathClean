import SweepSouthStyleHeader from "@/components/sweepsouth-style-header";
import Hero from "@/components/hero";
import SweepSouthStyleServices from "@/components/sweepsouth-style-services";
import HowItWorksSection from "@/components/how-it-works-section";
import TrustSafetySection from "@/components/trust-safety-section";
import BerryStarsSection from "@/components/berry-stars-section";
import Footer from "@/components/footer";
import QuickBookingModal from "@/components/quick-booking-modal";
import ServiceSelectionModal from "@/components/service-selection-modal";
import ProviderOnboarding from "@/components/provider-onboarding";
import { useState } from "react";

export default function Home() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isServiceSelectionOpen, setIsServiceSelectionOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [isProviderOnboardingOpen, setIsProviderOnboardingOpen] = useState(false);

  const openBooking = (service?: string) => {
    if (service === 'all-services') {
      setIsServiceSelectionOpen(true);
    } else if (service) {
      setSelectedService(service);
      setIsBookingOpen(true);
    }
  };

  const handleServiceSelection = (serviceId: string, optionId: string) => {
    setSelectedService(serviceId);
    setSelectedOption(optionId);
    setIsServiceSelectionOpen(false);
    setIsBookingOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SweepSouthStyleHeader onBookingClick={() => openBooking('all-services')} />
      <main>
        <Hero onBookingClick={() => openBooking('all-services')} />
        <SweepSouthStyleServices onServiceSelect={openBooking} />
        <HowItWorksSection />
        <BerryStarsSection onBookService={openBooking} />
        <TrustSafetySection />
      </main>
      <Footer />

      {/* Modals */}
      {isServiceSelectionOpen && (
        <ServiceSelectionModal 
          onClose={() => setIsServiceSelectionOpen(false)}
          onServiceSelect={handleServiceSelection}
        />
      )}
      
      {isBookingOpen && (
        <QuickBookingModal 
          selectedService={selectedService}
          selectedOption={selectedOption}
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
