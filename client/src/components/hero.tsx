import { Button } from "@/components/ui/button";
import { Calendar, Play, Shield, UserCheck, Clock } from "lucide-react";

interface HeroProps {
  onBookingClick: () => void;
}

export default function Hero({ onBookingClick }: HeroProps) {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-green-50 py-16 lg:py-24">
      <div className="absolute inset-0 bg-black bg-opacity-5"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
              Premium Home Services
              <span className="text-primary block">In Just 2 Minutes</span>
            </h1>
            <p className="mt-6 text-xl text-neutral leading-8">
              Book trusted, verified domestic services instantly. Our background-checked professionals deliver exceptional cleaning, maintenance, and care for your home.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={onBookingClick}
                size="lg"
                className="bg-primary text-white hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                data-testid="button-book-service-now"
              >
                <Calendar className="mr-2 h-5 w-5" />
                Book Service Now
              </Button>
              <Button 
                variant="outline"
                size="lg" 
                className="border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-200"
                data-testid="button-watch-how-it-works"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch How It Works
              </Button>
            </div>
            <div className="mt-8 flex items-center space-x-6 text-sm text-neutral">
              <div className="flex items-center">
                <Shield className="text-secondary mr-2 h-4 w-4" />
                Fully Insured
              </div>
              <div className="flex items-center">
                <UserCheck className="text-secondary mr-2 h-4 w-4" />
                Background Verified
              </div>
              <div className="flex items-center">
                <Clock className="text-secondary mr-2 h-4 w-4" />
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
