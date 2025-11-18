import SweepSouthStyleHeader from "@/components/sweepsouth-style-header";
import Hero from "@/components/hero";
import SweepSouthStyleServices from "@/components/sweepsouth-style-services";
import ServicesShowcase from "@/components/services-showcase";
import TrustSafetySection from "@/components/trust-safety-section";
import BerryStarsSection from "@/components/berry-stars-section";
import Footer from "@/components/footer";
import ModernServiceModal from "@/components/modern-service-modal";
import ProviderOnboarding from "@/components/provider-onboarding";
import { useState } from "react";

export default function Home() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedProviderId, setSelectedProviderId] = useState<string | undefined>(undefined);
  const [selectedProviderName, setSelectedProviderName] = useState<string | undefined>(undefined);
  const [isProviderOnboardingOpen, setIsProviderOnboardingOpen] = useState(false);
  const [bookedServices, setBookedServices] = useState<string[]>([]);
  const [pendingDrafts, setPendingDrafts] = useState<any[]>([]); // Store service drafts before payment
  const [confirmedDrafts, setConfirmedDrafts] = useState<any[]>([]); // Store confirmed bookings after payment

  const openBooking = (service?: string, providerId?: string, providerName?: string) => {
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
    
    // Set provider info if provided (from Berry Stars)
    setSelectedProviderId(providerId);
    setSelectedProviderName(providerName);
    
    setIsBookingOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <SweepSouthStyleHeader onBookingClick={() => openBooking('all-services')} />
      <main>
        <Hero onBookingClick={() => openBooking('all-services')} />
        <SweepSouthStyleServices onServiceSelect={openBooking} />
        <ServicesShowcase />
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
          setSelectedProviderId(undefined);
          setSelectedProviderName(undefined);
        }}
        serviceId={selectedService}
        preSelectedProviderId={selectedProviderId}
        preSelectedProviderName={selectedProviderName}
        onServiceSelect={(serviceId) => setSelectedService(serviceId)}
        onBookingComplete={(bookingData) => {
          console.log("Payment completed for all services:", bookingData);
          
          // Promote all pending drafts + final booking to confirmed
          const allBookings = [...pendingDrafts, bookingData];
          setConfirmedDrafts(allBookings);
          
          // Clear session state after successful payment
          setPendingDrafts([]);
          setBookedServices([]);
          
          setIsBookingOpen(false);
          setSelectedService("");
          setSelectedProviderId(undefined);
          setSelectedProviderName(undefined);
        }}
        bookedServices={bookedServices}
        pendingDrafts={pendingDrafts}
        onAddAnotherService={(draftData: any) => {
          console.log("Adding service to pending drafts:", draftData);
          
          // Store complete draft data before payment
          setPendingDrafts(prev => [...prev, draftData]);
          
          // Track service ID to prevent duplicates
          if (draftData.serviceId && !bookedServices.includes(draftData.serviceId)) {
            setBookedServices(prev => [...prev, draftData.serviceId]);
          }
          
          // Close modal to return to home page for next service
          setIsBookingOpen(false);
          setSelectedService("");
          setSelectedProviderId(undefined);
          setSelectedProviderName(undefined);
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
