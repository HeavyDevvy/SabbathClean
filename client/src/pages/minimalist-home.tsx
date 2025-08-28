import { useState } from "react";
import MinimalistHero from "@/components/minimalist-hero";
import MinimalistServices from "@/components/minimalist-services";
import ModernServiceModal from "@/components/modern-service-modal";
import BookingConfirmation from "@/components/booking-confirmation";
import DemoVideoModal from "@/components/demo-video-modal";
import BerryStarsSection from "@/components/berry-stars-section";
import HowItWorksSection from "@/components/how-it-works-section";
import TrustSafetySection from "@/components/trust-safety-section";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { 
  Menu,
  X
} from "lucide-react";

export default function MinimalistHome() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isDemoVideoOpen, setIsDemoVideoOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");
  const [completedBookingData, setCompletedBookingData] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
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
      {/* Clean Navigation Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="text-2xl font-bold text-blue-600">Berry Events</div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                Sign In
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Get Started
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-4 py-3 space-y-3">
              <Button variant="outline" className="w-full">Sign In</Button>
              <Button className="w-full bg-blue-600">Get Started</Button>
            </div>
          </div>
        )}
      </header>

      <main className="pt-16">
        {/* Hero Section */}
        <MinimalistHero onGetStarted={handleBookingClick} />

        {/* Services Section */}
        <div data-section="services" id="services">
          <MinimalistServices onServiceSelect={handleServiceSelect} />
        </div>

        {/* How It Works Section */}
        <HowItWorksSection onBookNowClick={handleBookingClick} />

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
          bookingData={completedBookingData}
          onEditBooking={handleEditBooking}
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