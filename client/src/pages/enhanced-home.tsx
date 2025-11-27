import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import EnhancedHeader from "@/components/enhanced-header";
import EnhancedHero from "@/components/enhanced-hero";
import ComprehensiveServices from "@/components/comprehensive-services";

import ModernServiceModal from "@/components/modern-service-modal";
import BookingConfirmation from "@/components/booking-confirmation";
import DemoVideoModal from "@/components/demo-video-modal";
import BookingAuthModal from "@/components/booking-auth-modal";
import BerryStarsSection from "@/components/berry-stars-section";
import TrustSafetySection from "@/components/trust-safety-section";

import Footer from "@/components/footer";

export default function EnhancedHome() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isBookingAuthModalOpen, setIsBookingAuthModalOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isDemoVideoOpen, setIsDemoVideoOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");
  const [pendingBookingService, setPendingBookingService] = useState<string>("");
  const [pendingProviderId, setPendingProviderId] = useState<string>("");
  const [pendingProviderName, setPendingProviderName] = useState<string>("");
  const [selectedProviderId, setSelectedProviderId] = useState<string>("");
  const [selectedProviderName, setSelectedProviderName] = useState<string>("");
  const [completedBookingData, setCompletedBookingData] = useState<any>(null);
  
  // Use real authentication state
  const { user, isAuthenticated, isLoading } = useAuth();
  const [notificationCount] = useState(3);
  const [messageCount] = useState(1);

  // Show loading state while auth is loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleBookingClick = (serviceId?: string) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Store the service they wanted to book
      if (serviceId) {
        setPendingBookingService(serviceId);
      }
      // Show auth modal first
      setIsBookingAuthModalOpen(true);
      return;
    }

    // User is authenticated, proceed with booking
    if (serviceId) {
      setSelectedService(serviceId);
    }
    setIsBookingModalOpen(true);
  };

  const handleServiceSelect = (serviceId: string, providerId?: string, providerName?: string) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Phase 5.2: Store service AND provider info for Berry Stars
      setPendingBookingService(serviceId);
      setPendingProviderId(providerId || "");
      setPendingProviderName(providerName || "");
      // Show auth modal first
      setIsBookingAuthModalOpen(true);
      return;
    }

    // User is authenticated, proceed with booking
    setSelectedService(serviceId);
    setSelectedProviderId(providerId || "");
    setSelectedProviderName(providerName || "");
    setIsBookingModalOpen(true);
  };

  const handleAuthSuccess = () => {
    // Phase 5.2: After successful authentication, restore both service AND provider selection
    setIsBookingAuthModalOpen(false);
    setSelectedService(pendingBookingService || "house-cleaning");
    setSelectedProviderId(pendingProviderId);
    setSelectedProviderName(pendingProviderName);
    setIsBookingModalOpen(true);
    // Clear pending state
    setPendingBookingService("");
    setPendingProviderId("");
    setPendingProviderName("");
  };

  const handleDemoClick = () => {
    const howItWorksSection = document.getElementById('how-it-works');
    howItWorksSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEditBooking = () => {
    setIsConfirmationOpen(false);
    // Retain the selected service to open the correct service card
    if (completedBookingData?.serviceId) {
      setSelectedService(completedBookingData.serviceId);
    }
    setIsBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Enhanced Header with authentication state */}
      <EnhancedHeader 
        onBookingClick={handleBookingClick}
        onServiceSelect={handleServiceSelect}
      />

      <main>
        {/* Enhanced Hero Section */}
        <EnhancedHero 
          onBookingClick={handleBookingClick}
          onDemoClick={() => setIsDemoVideoOpen(true)}
        />

        {/* Comprehensive Services Section */}
        <ComprehensiveServices onServiceSelect={handleServiceSelect} />




        {/* Featured Providers Section */}
        <BerryStarsSection onBookService={handleServiceSelect} />

        {/* Trust & Safety Section */}
        <TrustSafetySection />


      </main>

      {/* Footer */}
      <Footer />

      {/* Booking Authentication Modal - shows when user tries to book without being logged in */}
      <BookingAuthModal
        isOpen={isBookingAuthModalOpen}
        onClose={() => {
          setIsBookingAuthModalOpen(false);
          setPendingBookingService("");
          setPendingProviderId("");
          setPendingProviderName("");
        }}
        onSuccess={handleAuthSuccess}
        message="Please sign in to continue with your booking"
      />

      {/* Standardized Modern Service Modal */}
      {isBookingModalOpen && (
        <ModernServiceModal
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedService("");
            setSelectedProviderId("");
            setSelectedProviderName("");
          }}
          serviceId={selectedService || "house-cleaning"}
          preSelectedProviderId={selectedProviderId}
          preSelectedProviderName={selectedProviderName}
          editBookingData={completedBookingData}
          onBookingComplete={(bookingData) => {
            console.log("Booking completed:", bookingData);
            
            // Generate booking ID and enhance booking data
            const enhancedBookingData = {
              ...bookingData,
              bookingId: `BE${Date.now().toString().slice(-6)}`,
              timestamp: new Date().toISOString(),
              status: 'confirmed'
            };
            
            setCompletedBookingData(enhancedBookingData);
            setIsBookingModalOpen(false);
            setSelectedProviderId("");
            setSelectedProviderName("");
            setIsConfirmationOpen(true);
          }}
        />
      )}

      {/* Booking Confirmation Modal */}
      {isConfirmationOpen && completedBookingData && (
        <BookingConfirmation
          isOpen={isConfirmationOpen}
          onClose={() => {
            setIsConfirmationOpen(false);
            setCompletedBookingData(null);
            setSelectedService("");
          }}
          onEditBooking={handleEditBooking}
          bookingData={completedBookingData}
        />
      )}

      {/* Demo Video Modal */}
      <DemoVideoModal
        isOpen={isDemoVideoOpen}
        onClose={() => setIsDemoVideoOpen(false)}
      />
    </div>
  );
}
