import SweepSouthStyleHeader from "@/components/sweepsouth-style-header";
import Hero from "@/components/hero";
import SweepSouthStyleServices from "@/components/sweepsouth-style-services";
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
  const [bookedServices, setBookedServices] = useState<string[]>([]);
  const [confirmedDrafts, setConfirmedDrafts] = useState<any[]>([]); // Store complete booking data for multi-service

  const openBooking = (service?: string) => {
    if (service && service !== 'all-services') {
      // Check if service is already booked
      if (bookedServices.includes(service)) {
        alert(`You've already booked ${service.replace('-', ' ')} in this session. Please choose a different service.`);
        return;
      }
      setSelectedService(service);
    } else {
      // No service pre-selected - let user choose
      setSelectedService('');
    }
    setIsBookingOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SweepSouthStyleHeader onBookingClick={() => openBooking('all-services')} />
      <main>
        <Hero onBookingClick={() => openBooking('all-services')} />
        <SweepSouthStyleServices onServiceSelect={openBooking} />
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
        serviceId={selectedService}
        onServiceSelect={(serviceId) => setSelectedService(serviceId)}
        onBookingComplete={(bookingData) => {
          console.log("Booking completed:", bookingData);
          
          // Add to confirmed drafts for multi-service aggregation
          setConfirmedDrafts(prev => [...prev, bookingData]);
          
          // Track service ID to prevent duplicates
          if (bookingData.serviceId && !bookedServices.includes(bookingData.serviceId)) {
            setBookedServices(prev => [...prev, bookingData.serviceId]);
          }
          
          setIsBookingOpen(false);
          setSelectedService(""); // Clear selected service to prevent card interference
        }}
        bookedServices={bookedServices}
        onAddAnotherService={(currentServiceId: string) => {
          // Add current service to booked list
          if (currentServiceId && !bookedServices.includes(currentServiceId)) {
            setBookedServices(prev => [...prev, currentServiceId]);
          }
          // Close modal to return to home page
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
