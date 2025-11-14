import { Button } from "@/components/ui/button";
import { Calendar, Play, Shield, UserCheck, Clock, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

interface HeroProps {
  onBookingClick: () => void;
}

export default function Hero({ onBookingClick }: HeroProps) {
  const [, setLocation] = useLocation();
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-foreground sm:text-6xl lg:text-7xl leading-tight mb-8">
            All the help your home needs.
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed mb-12 max-w-3xl mx-auto">
            Whether you need a quick clean, or full-time help, Berry Events connects you with reliable professionals you can trust.
          </p>
          
          {/* Simple trust badges */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground mb-12">
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
        </div>
      </div>
    </section>
  );
}
