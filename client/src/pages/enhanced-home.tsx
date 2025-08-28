import { useState } from "react";
import EnhancedHeader from "@/components/enhanced-header";
import EnhancedHero from "@/components/enhanced-hero";
import ComprehensiveServices from "@/components/comprehensive-services";
import VisualCuisineExplorer from "@/components/visual-cuisine-explorer";
import ModernServiceModal from "@/components/modern-service-modal";
import BookingConfirmation from "@/components/booking-confirmation";
import DemoVideoModal from "@/components/demo-video-modal";
import BerryStarsSection from "@/components/berry-stars-section";
import HowItWorksSection from "@/components/how-it-works-section";
import TrustSafetySection from "@/components/trust-safety-section";
import CompetitiveAdvantageSection from "@/components/competitive-advantage-section";
import Footer from "@/components/footer";

export default function EnhancedHome() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isDemoVideoOpen, setIsDemoVideoOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");
  const [completedBookingData, setCompletedBookingData] = useState<any>(null);
  
  // Mock user data - replace with actual auth
  const [user] = useState({
    firstName: "John",
    lastName: "Doe", 
    profileImage: "",
    isProvider: false,
  });
  
  const [isAuthenticated] = useState(true);
  const [notificationCount] = useState(3);
  const [messageCount] = useState(1);

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
        user={user}
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

        {/* Visual Cuisine Explorer Section */}
        <VisualCuisineExplorer onBookCuisine={handleServiceSelect} />

        {/* How It Works Section */}
        <HowItWorksSection onBookNowClick={handleBookingClick} />

        {/* Featured Providers Section */}
        <BerryStarsSection onBookService={handleServiceSelect} />

        {/* Trust & Safety Section */}
        <TrustSafetySection />

        {/* Competitive Advantage Section */}
        <CompetitiveAdvantageSection />
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