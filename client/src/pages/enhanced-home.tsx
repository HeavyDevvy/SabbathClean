import { useState } from "react";
import EnhancedHeader from "@/components/enhanced-header";
import EnhancedHero from "@/components/enhanced-hero";
import ComprehensiveServices from "@/components/comprehensive-services";
import ModernServiceModal from "@/components/modern-service-modal";
import BerryStarsSection from "@/components/berry-stars-section";
import HowItWorksSection from "@/components/how-it-works-section";
import TrustSafetySection from "@/components/trust-safety-section";
import CompetitiveAdvantageSection from "@/components/competitive-advantage-section";
import Footer from "@/components/footer";

export default function EnhancedHome() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");
  
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
          onDemoClick={handleDemoClick}
        />

        {/* Comprehensive Services Section */}
        <ComprehensiveServices onServiceSelect={handleServiceSelect} />

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
          onBookingComplete={(bookingData) => {
            console.log("Booking completed:", bookingData);
            setIsBookingModalOpen(false);
            setSelectedService(""); // Clear selected service to prevent card interference
          }}
        />
      )}
    </div>
  );
}