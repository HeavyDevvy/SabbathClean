import { Button } from "@/components/ui/button";
import { Calendar, Play, Shield, UserCheck, Clock, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

interface HeroProps {
  onBookingClick: () => void;
}

export default function Hero({ onBookingClick }: HeroProps) {
  const [, setLocation] = useLocation();
  return (
    <section className="relative bg-gradient-to-br from-background via-white to-primary-foreground/20 py-20 lg:py-32">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-16">
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
            <h1 className="text-5xl font-bold text-foreground sm:text-6xl lg:text-7xl leading-tight">
              All the help your home needs.
            </h1>
            <p className="mt-8 text-xl text-muted-foreground leading-relaxed">
              Whether you need a quick clean, or full-time help, Berry Events connects you with reliable professionals you can trust.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={onBookingClick}
                size="lg"
                className="bg-primary hover:bg-accent text-primary-foreground transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl rounded-xl h-14 px-8 text-lg font-semibold"
                data-testid="button-book-service-now"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Book Service Now
              </Button>
              <Button 
                variant="outline"
                size="lg" 
                className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 rounded-xl h-14 px-8 text-lg font-semibold"
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
            <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                  <Shield className="text-success h-5 w-5" />
                </div>
                <span className="font-medium">Fully Insured</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <UserCheck className="text-primary h-5 w-5" />
                </div>
                <span className="font-medium">Background Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                  <Clock className="text-accent h-5 w-5" />
                </div>
                <span className="font-medium">Same Day Booking</span>
              </div>
            </div>
          </div>
          <div className="mt-16 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
            <img 
              src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
              alt="Clean modern home interior" 
              className="w-full rounded-3xl shadow-2xl" 
            />
            <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary" data-testid="text-customers-count">50K+</div>
                  <div className="text-xs text-muted-foreground font-medium mt-1">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary" data-testid="text-average-rating">4.9/5</div>
                  <div className="text-xs text-muted-foreground font-medium mt-1">Average Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent" data-testid="text-booking-time">2 min</div>
                  <div className="text-xs text-muted-foreground font-medium mt-1">Booking Time</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
