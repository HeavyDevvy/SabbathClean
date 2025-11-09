// ADDED: Multi-service booking feature
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
import BookingCart from "@/components/booking-cart";
import { Button } from "@/components/ui/button";
import { 
  Menu,
  X
} from "lucide-react";
import { aggregatePayments, type ServiceDraft } from "@/lib/paymentAggregator";

export default function MinimalistHome() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isDemoVideoOpen, setIsDemoVideoOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");
  const [completedBookingData, setCompletedBookingData] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // ADDED: Multi-service booking feature - Track up to 3 service bookings
  const [bookingDrafts, setBookingDrafts] = useState<ServiceDraft[]>([]);
  const [currentDraft, setCurrentDraft] = useState<ServiceDraft | null>(null);
  const [editingDraft, setEditingDraft] = useState<ServiceDraft | null>(null);
  const [editingDraftIndex, setEditingDraftIndex] = useState<number | null>(null);
  
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

  // ADDED: Cart management handlers
  const handleRemoveService = (index: number) => {
    setBookingDrafts(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditService = (draft: ServiceDraft, index: number) => {
    // Store the draft and its index for editing
    setEditingDraft(draft);
    setEditingDraftIndex(index);
    // Open modal with the service
    setSelectedService(draft.serviceId);
    setIsBookingModalOpen(true);
  };

  const handleAddServiceFromCart = () => {
    // Clear selected service to show service selection
    setSelectedService("");
    setEditingDraft(null);
    setEditingDraftIndex(null);
    setIsBookingModalOpen(true);
  };

  const handleProceedToCheckout = () => {
    // Process final booking with all drafts
    if (bookingDrafts.length > 0) {
      // Aggregate all services
      const aggregated = aggregatePayments(bookingDrafts);
      
      // Create a consolidated booking with all services
      const consolidatedBooking = {
        bookingId: `BE${Date.now().toString().slice(-6)}`,
        timestamp: new Date().toISOString(),
        status: 'confirmed',
        multiService: true,
        services: aggregated.lineItems,
        aggregatedPayment: aggregated,
        totalCost: aggregated.grandTotal,
        commission: aggregated.commission
      };
      
      setCompletedBookingData(consolidatedBooking);
      setIsConfirmationOpen(true);
      // Clear cart after checkout
      setBookingDrafts([]);
    }
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

        {/* Services Section with Cart */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Services Grid - Takes 2 columns on large screens */}
            <div className="lg:col-span-2">
              <div data-section="services" id="services">
                <MinimalistServices 
                  onServiceSelect={handleServiceSelect} 
                  bookedServices={bookedServices}
                />
              </div>
            </div>

            {/* Booking Cart - Takes 1 column on large screens, sticky */}
            <div className="lg:col-span-1">
              <BookingCart
                bookingDrafts={bookingDrafts}
                onRemoveService={handleRemoveService}
                onEditService={handleEditService}
                onAddService={handleAddServiceFromCart}
                onProceedToCheckout={handleProceedToCheckout}
                maxServices={3}
              />
            </div>
          </div>
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
            setEditingDraft(null);
            setEditingDraftIndex(null);
          }}
          serviceId={selectedService || "house-cleaning"}
          editBookingData={editingDraft || completedBookingData}
          bookedServices={bookedServices}
          pendingDrafts={bookingDrafts}
          onAddAnotherService={handleAddAnotherService}
          onBookingComplete={(bookingData) => {
            console.log("Booking completed:", bookingData);
            
            // ADDED: Multi-service booking feature - Create final ServiceDraft
            const serviceDraft: ServiceDraft = {
              serviceId: bookingData.serviceId,
              serviceName: bookingData.serviceName,
              pricing: bookingData.pricing,
              selectedProvider: bookingData.selectedProvider,
              preferredDate: bookingData.preferredDate,
              timePreference: bookingData.timePreference,
              selectedAddOns: bookingData.selectedAddOns
            };
            
            // Handle edit vs new service
            if (editingDraft && editingDraftIndex !== null) {
              // Update existing draft
              setBookingDrafts(prev => {
                const updated = [...prev];
                updated[editingDraftIndex] = serviceDraft;
                return updated;
              });
              setEditingDraft(null);
              setEditingDraftIndex(null);
              setIsBookingModalOpen(false);
            } else {
              // Combine with any pending drafts
              const allDrafts = [...bookingDrafts, serviceDraft];
              
              // Finalize booking with aggregated data
              const isMultiService = allDrafts.length > 1;
              const aggregated = isMultiService ? aggregatePayments(allDrafts) : null;
              
              const enhancedBookingData = {
                ...bookingData,
                bookingId: `BE${Date.now().toString().slice(-6)}`,
                timestamp: new Date().toISOString(),
                status: 'confirmed',
                ...(isMultiService && {
                  multiService: true,
                  services: aggregated!.lineItems,
                  aggregatedPayment: aggregated
                })
              };
              
              setCompletedBookingData(enhancedBookingData);
              setIsBookingModalOpen(false);
              setIsConfirmationOpen(true);
              // Reset drafts after confirmation
              setBookingDrafts([]);
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