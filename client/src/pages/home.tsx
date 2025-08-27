import SweepSouthStyleHeader from "@/components/sweepsouth-style-header";
import Hero from "@/components/hero";
import SweepSouthStyleServices from "@/components/sweepsouth-style-services";
import HowItWorksSection from "@/components/how-it-works-section";
import TrustSafetySection from "@/components/trust-safety-section";
import BerryStarsSection from "@/components/berry-stars-section";
import Footer from "@/components/footer";
import ModernServiceModal from "@/components/modern-service-modal";
import ProviderOnboarding from "@/components/provider-onboarding";
import { useState } from "react";

export default function Home() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");
  const [isProviderOnboardingOpen, setIsProviderOnboardingOpen] = useState(false);

  const openBooking = (service?: string) => {
    if (service && service !== 'all-services') {
      setSelectedService(service);
      setIsBookingOpen(true);
    } else {
      // Default to house cleaning for general bookings
      setSelectedService('house-cleaning');
      setIsBookingOpen(true);
    }
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

      {/* Standardized Modern Service Modal */}
      <ModernServiceModal
        isOpen={isBookingOpen}
        onClose={() => {
          setIsBookingOpen(false);
          setSelectedService("");
        }}
        serviceId={selectedService || "house-cleaning"}
        onBookingComplete={(bookingData) => {
          console.log("Booking completed:", bookingData);
          setIsBookingOpen(false);
          setSelectedService("");
        }}
      />
      
      {isProviderOnboardingOpen && (
        <ProviderOnboarding 
          isOpen={isProviderOnboardingOpen}
          onClose={() => setIsProviderOnboardingOpen(false)}
        />
      )}
    </div>
  );
}
