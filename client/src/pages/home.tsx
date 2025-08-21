import Header from "@/components/header";
import Hero from "@/components/hero";
import Services from "@/components/services";
import { AnimatedBookingDemo } from "@/components/animated-booking-demo";
import FeaturedProviders from "@/components/featured-providers";
import Testimonials from "@/components/testimonials";
import DynamicPricing from "@/components/dynamic-pricing";
import CompetitiveAdvantage from "@/components/competitive-advantage";
import Footer from "@/components/footer";
import ServiceSpecificBooking from "@/components/service-specific-booking";
import ProviderOnboarding from "@/components/provider-onboarding";
import MobileNavigation from "@/components/mobile-navigation";
import RecommendationEngine from "@/components/recommendation-engine";
import OnboardingTutorial, { useOnboarding } from "@/components/onboarding-tutorial";
import { useState } from "react";
import { Plus, Calendar, Users, Sparkles, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");
  const [isProviderOnboardingOpen, setIsProviderOnboardingOpen] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  
  const { 
    hasCompletedTutorial, 
    showTutorial, 
    startTutorial, 
    completeTutorial, 
    setShowTutorial 
  } = useOnboarding();

  const openBooking = (service?: string) => {
    if (service) setSelectedService(service);
    setIsBookingOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileNavigation />
      <Header onBookingClick={() => openBooking()} />
      <main>
        <Hero onBookingClick={() => openBooking()} />
        <Services onServiceSelect={openBooking} />
        <section id="demo-section" className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <AnimatedBookingDemo />
          </div>
        </section>
        <FeaturedProviders />
        <Testimonials />
        <DynamicPricing onBookingClick={() => openBooking()} />
        
        {/* Personalized Recommendations Section */}
        <section className="py-16 bg-gradient-to-br from-purple-50 to-blue-50">
          <div className="container mx-auto px-4">
            <RecommendationEngine
              userId="demo-user"
              onBookService={(serviceId, providerId) => {
                setSelectedService(serviceId);
                openBooking();
              }}
              onViewProvider={(providerId) => {
                console.log("View provider:", providerId);
              }}
            />
          </div>
        </section>
        
        <CompetitiveAdvantage />
      </main>
      <Footer />
      
      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
        {!hasCompletedTutorial && (
          <Button
            onClick={startTutorial}
            className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 bg-purple-600 hover:bg-purple-700"
            data-testid="floating-tutorial-button"
            title="Start Tutorial"
          >
            <Play className="h-5 w-5" />
          </Button>
        )}
        <Button
          onClick={() => setShowRecommendations(!showRecommendations)}
          className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 bg-yellow-600 hover:bg-yellow-700"
          data-testid="floating-recommendations-button"
          title="Smart Recommendations"
        >
          <Sparkles className="h-5 w-5" />
        </Button>
        <Button
          onClick={() => setIsProviderOnboardingOpen(true)}
          className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 bg-green-600 hover:bg-green-700"
          data-testid="floating-provider-button"
          title="Become a Provider"
        >
          <Users className="h-5 w-5" />
        </Button>
        <Button
          onClick={() => openBooking()}
          className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
          data-testid="floating-book-button"
          title="Book Service"
        >
          <Calendar className="h-5 w-5" />
        </Button>
      </div>

      <ServiceSpecificBooking 
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        serviceId={selectedService}
      />
      
      <ProviderOnboarding 
        isOpen={isProviderOnboardingOpen}
        onClose={() => setIsProviderOnboardingOpen(false)}
      />
      
      {/* Interactive Onboarding Tutorial */}
      <OnboardingTutorial
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        onComplete={completeTutorial}
      />
    </div>
  );
}
