import { Button } from "@/components/ui/button";
import { Shield, UserCheck, Clock } from "lucide-react";
import heroImage from "@assets/homepage-hero.png";

interface HeroProps {
  onBookingClick: () => void;
}

export default function Hero({ onBookingClick }: HeroProps) {
  return (
    <section className="bg-background py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left: Text Content */}
          <div className="text-center lg:text-left mb-12 lg:mb-0 space-y-8">
            <h1 className="text-5xl font-bold text-foreground sm:text-6xl lg:text-7xl leading-tight">
              All the help your home needs.
            </h1>
            <p className="text-xl text-foreground/80 leading-relaxed">
              Whether you need a quick clean, or full-time help, Berry Events connects you with reliable professionals you can trust.
            </p>
            
            {/* Simple trust badges */}
            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-8 text-sm text-foreground/70">
              <div className="flex items-center gap-2">
                <Shield className="text-success h-5 w-5" />
                <span>Fully Insured</span>
              </div>
              <div className="flex items-center gap-2">
                <UserCheck className="text-secondary h-5 w-5" />
                <span>Background Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="text-accent h-5 w-5" />
                <span>Same Day Booking</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex justify-center lg:justify-start pt-4">
              <Button 
                onClick={onBookingClick}
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground px-10 py-7 text-lg font-semibold rounded-xl shadow-lg transition-all hover:shadow-xl"
                data-testid="button-book-service-hero"
              >
                Quick Quote
              </Button>
            </div>
          </div>

          {/* Right: Image */}
          <div className="relative">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src={heroImage}
                alt="Happy couple using Berry Events services" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
