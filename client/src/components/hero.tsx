import { Button } from "@/components/ui/button";
import { Calendar, Play, Shield, UserCheck, Clock, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

interface HeroProps {
  onBookingClick: () => void;
}

export default function Hero({ onBookingClick }: HeroProps) {
  const [, setLocation] = useLocation();
  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-green-50 py-16 lg:py-24">
      <div className="absolute inset-0 bg-black bg-opacity-5"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
              All the help your home needs.
            </h1>
            <p className="mt-6 text-xl text-neutral leading-8">
              Whether you need a quick clean, or full-time help, Berry Events connects you with reliable professionals you can trust.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={onBookingClick}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                data-testid="button-book-service-now"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Book Service Now
              </Button>
              <Button 
                variant="outline"
                size="lg" 
                className="border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-200 hover:scale-105 transform"
                onClick={() => {
                  const demoSection = document.getElementById('demo-section');
                  demoSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                data-testid="button-watch-how-it-works"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch How It Works
              </Button>
            </div>
            <div className="mt-8 flex items-center space-x-6 text-sm text-neutral">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                  <Shield className="text-green-600 h-4 w-4" />
                </div>
                Fully Insured
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                  <UserCheck className="text-blue-600 h-4 w-4" />
                </div>
                Background Verified
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                  <Clock className="text-purple-600 h-4 w-4" />
                </div>
                Same Day Booking
              </div>
            </div>
          </div>
          <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
            <img 
              src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
              alt="Clean modern home interior" 
              className="w-full rounded-2xl shadow-2xl" 
            />
            <div className="absolute bottom-4 left-4 right-4 bg-white rounded-xl p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary" data-testid="text-customers-count">50K+</div>
                  <div className="text-sm text-neutral">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary" data-testid="text-average-rating">4.9/5</div>
                  <div className="text-sm text-neutral">Average Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent" data-testid="text-booking-time">2 min</div>
                  <div className="text-sm text-neutral">Booking Time</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
