import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import EnhancedHeader from "@/components/enhanced-header";
import EnhancedHero from "@/components/enhanced-hero";
import ComprehensiveServices from "@/components/comprehensive-services";

import ModernServiceModal from "@/components/modern-service-modal";
import BookingConfirmation from "@/components/booking-confirmation";
import DemoVideoModal from "@/components/demo-video-modal";
import BerryStarsSection from "@/components/berry-stars-section";
import TrustSafetySection from "@/components/trust-safety-section";

import Footer from "@/components/footer";

export default function EnhancedHome() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isDemoVideoOpen, setIsDemoVideoOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");
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
    if (serviceId) {
      setSelectedService(serviceId);
    }
    setIsBookingModalOpen(true);
  };

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    setIsBookingModalOpen(true);
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
        isAuthenticated={isAuthenticated}
        user={user || undefined}
        notificationCount={notificationCount}
        messageCount={messageCount}
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

      {/* Standardized Modern Service Modal */}
      {isBookingModalOpen && (
        <ModernServiceModal
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedService("");
          }}
          serviceId={selectedService || "house-cleaning"}
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