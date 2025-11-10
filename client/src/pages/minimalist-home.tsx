// ADDED: Multi-service booking feature
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
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
import { CartDrawer } from "@/components/cart-drawer";
import { 
  Menu,
  X
} from "lucide-react";
import { aggregatePayments, type ServiceDraft } from "@/lib/paymentAggregator";

export default function MinimalistHome() {
  const { addToCart, itemCount } = useCart();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isDemoVideoOpen, setIsDemoVideoOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");
  const [completedBookingData, setCompletedBookingData] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // ADDED: Multi-service booking feature - Track up to 3 service bookings
  const [bookingDrafts, setBookingDrafts] = useState<ServiceDraft[]>([]);
  const [currentDraft, setCurrentDraft] = useState<ServiceDraft | null>(null);
  
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

  // ADDED: Multi-service booking feature - Handle "Add Another Service" button
  const handleAddAnotherService = (draftData: any) => {
    // Maximum 3 services per booking session
    if (bookingDrafts.length >= 3) {
      return; // Should not happen as button is disabled, but safety check
    }
    
    // Convert draft to ServiceDraft format and store
    const serviceDraft: ServiceDraft = {
      serviceId: draftData.serviceId,
      serviceName: draftData.serviceName,
      pricing: draftData.pricing,
      selectedProvider: draftData.selectedProvider,
      preferredDate: draftData.preferredDate,
      timePreference: draftData.timePreference,
      selectedAddOns: draftData.selectedAddOns || []
    };
    
    // Add to drafts array
    setBookingDrafts(prev => [...prev, serviceDraft]);
    
    // Close modal and clear selected service to return to service selection
    setIsBookingModalOpen(false);
    setSelectedService("");
  };
  
  // ADDED: Multi-service booking feature - Extract booked service IDs
  const bookedServices = bookingDrafts.map(draft => draft.serviceId);

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
              <CartDrawer />
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
              <div className="flex justify-center pb-2">
                <CartDrawer />
              </div>
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
          <MinimalistServices 
            onServiceSelect={handleServiceSelect} 
            bookedServices={bookedServices}
          />
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
          bookedServices={bookedServices}
          pendingDrafts={bookingDrafts}
          onAddAnotherService={handleAddAnotherService}
          onBookingComplete={async (bookingData) => {
            console.log("Booking completed:", bookingData);
            
            // Add service to cart (new shopping cart system)
            try {
              const cartItem = {
                serviceId: bookingData.serviceId || selectedService,
                serviceName: bookingData.serviceName || "Service",
                serviceType: bookingData.serviceType || selectedService || 'general',
                scheduledDate: bookingData.preferredDate || new Date().toISOString().split('T')[0],
                scheduledTime: bookingData.timePreference || "09:00",
                duration: bookingData.duration || null,
                basePrice: String(bookingData.pricing?.basePrice || bookingData.totalCost || 0),
                addOnsPrice: String(bookingData.pricing?.addOnsPrice || 0),
                subtotal: String(bookingData.pricing?.totalPrice || bookingData.totalCost || 0),
                serviceDetails: JSON.stringify({
                  propertyType: bookingData.propertyType,
                  address: bookingData.address,
                  cleaningType: bookingData.cleaningType,
                  propertySize: bookingData.propertySize,
                  materials: bookingData.materials,
                  recurringSchedule: bookingData.recurringSchedule,
                  gardenSize: bookingData.gardenSize,
                  gardenCondition: bookingData.gardenCondition,
                  urgency: bookingData.urgency,
                  electricalIssue: bookingData.electricalIssue,
                  cuisineType: bookingData.cuisineType,
                  eventSize: bookingData.eventSize,
                }),
                selectedAddOns: bookingData.selectedAddOns || [],
                comments: bookingData.specialRequests || null,
                providerId: bookingData.selectedProvider?.id ? String(bookingData.selectedProvider.id) : null,
              };
              
              console.log("Adding to cart:", cartItem);
              await addToCart(cartItem);
              
              // Close modal after successful cart add
              setIsBookingModalOpen(false);
              setSelectedService("");
            } catch (error) {
              console.error("Failed to add to cart:", error);
            }
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