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
import { Plus, Calendar, Users, Sparkles, Play, Zap } from "lucide-react";
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
            className="w-12 h-12 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border-2 border-white"
            data-testid="floating-tutorial-button"
            title="Start Tutorial"
          >
            <Play className="h-4 w-4 text-white" />
          </Button>
        )}
        <Button
          onClick={() => setShowRecommendations(!showRecommendations)}
          className="w-12 h-12 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border-2 border-white"
          data-testid="floating-recommendations-button"
          title="Smart Recommendations"
        >
          <Zap className="h-4 w-4 text-white" />
        </Button>
        <Button
          onClick={() => setIsProviderOnboardingOpen(true)}
          className="w-12 h-12 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 border-2 border-white"
          data-testid="floating-provider-button"
          title="Become a Provider"
        >
          <Users className="h-4 w-4 text-white" />
        </Button>
        <Button
          onClick={() => openBooking()}
          className="w-14 h-14 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-2 border-white"
          data-testid="floating-book-button"
          title="Book Service"
        >
          <Calendar className="h-5 w-5 text-white" />
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
