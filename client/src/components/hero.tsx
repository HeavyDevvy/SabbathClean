import { Button } from "@/components/ui/button";
import { Calendar, Play, Shield, UserCheck, Clock, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import heroImage from "@assets/stock_images/professional_female__eea5c596.jpg";

interface HeroProps {
  onBookingClick: () => void;
}

export default function Hero({ onBookingClick }: HeroProps) {
  const [, setLocation] = useLocation();
  return (
    <section className="bg-background py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
          {/* Left: Text Content */}
          <div className="text-center lg:text-left mb-12 lg:mb-0">
            <h1 className="text-4xl font-bold text-foreground sm:text-5xl lg:text-6xl leading-tight mb-6">
              All the help your home needs.
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Whether you need a quick clean, or full-time help, Berry Events connects you with reliable professionals you can trust.
            </p>
            
            {/* Simple trust badges */}
            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-6 text-sm text-muted-foreground mb-8">
              <div className="flex items-center gap-2">
                <Shield className="text-success h-5 w-5" />
                <span>Fully Insured</span>
              </div>
              <div className="flex items-center gap-2">
                <UserCheck className="text-primary h-5 w-5" />
                <span>Background Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="text-accent h-5 w-5" />
                <span>Same Day Booking</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex justify-center lg:justify-start">
              <Button 
                onClick={onBookingClick}
                size="lg"
                className="bg-primary hover:bg-accent text-primary-foreground px-8 py-6 text-lg font-semibold rounded-lg transition-colors"
                data-testid="button-book-service-hero"
              >
                Book a Service
              </Button>
            </div>
          </div>

          {/* Right: Image */}
          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
              <img 
                src={heroImage}
                alt="Professional Berry Events service provider" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
