import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Star, Users, CheckCircle } from "lucide-react";

interface HeroSectionProps {
  onBookService?: () => void;
  onLearnMore?: () => void;
}

export default function HeroSection({ onBookService, onLearnMore }: HeroSectionProps) {
  const trustIndicators = [
    { icon: Shield, text: "Vetted professionals", count: "100%" },
    { icon: CheckCircle, text: "Insured services", count: "All providers" },
    { icon: Star, text: "Satisfaction guaranteed", count: "4.8/5 rating" },
    { icon: Users, text: "Trusted by families", count: "10,000+" }
  ];

  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              All the help your{" "}
              <span className="text-blue-600">home needs</span>
            </h1>
            
            <p className="mt-6 text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl">
              Connect with verified, insured professionals for house cleaning, repairs, 
              gardening, and specialized care services. Book in minutes, get quality results.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                onClick={onBookService}
                className="text-lg px-8 py-4 bg-blue-600 hover:bg-blue-700"
                data-testid="hero-button-book-now"
              >
                Book a Service Now
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={onLearnMore}
                className="text-lg px-8 py-4"
                data-testid="hero-button-how-it-works"
              >
                How It Works
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="mt-12 grid grid-cols-3 gap-8">
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl font-bold text-blue-600" data-testid="stat-services">245+</div>
                <div className="text-sm text-gray-600">Services Completed Today</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl font-bold text-blue-600" data-testid="stat-providers">500+</div>
                <div className="text-sm text-gray-600">Verified Providers</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl font-bold text-blue-600" data-testid="stat-rating">4.8★</div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
            </div>
          </div>

          {/* Hero Image/Visual */}
          <div className="relative">
            <div className="relative z-10">
              <img
                src="/api/placeholder/600/400"
                alt="Professional home service providers at work"
                className="rounded-2xl shadow-2xl w-full"
                data-testid="hero-image"
              />
              
              {/* Floating service cards */}
              <div className="absolute -top-4 -left-4 bg-white rounded-xl shadow-lg p-4 animate-bounce">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Service Complete</div>
                    <div className="text-xs text-gray-600">House Cleaning</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg p-4 animate-pulse">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">5 Star Rating</div>
                    <div className="text-xs text-gray-600">Maria S. - Cleaner</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-20">
          <p className="text-center text-gray-600 mb-8 text-lg">Trusted by thousands of South African families</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustIndicators.map((indicator, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="flex flex-col items-center space-y-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <indicator.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="font-semibold text-gray-900" data-testid={`trust-${index}`}>
                    {indicator.count}
                  </div>
                  <div className="text-sm text-gray-600">{indicator.text}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}