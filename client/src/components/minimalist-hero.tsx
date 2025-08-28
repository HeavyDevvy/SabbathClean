import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search, MapPin, Calendar, Star } from "lucide-react";

interface MinimalistHeroProps {
  onGetStarted: () => void;
}

export default function MinimalistHero({ onGetStarted }: MinimalistHeroProps) {
  const [address, setAddress] = useState("");

  const handleQuickBooking = () => {
    if (address.trim()) {
      // Scroll to services section
      const servicesSection = document.querySelector('[data-section="services"]');
      if (servicesSection) {
        servicesSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="relative bg-white pt-20 pb-16 overflow-hidden">
      {/* Background Elements - Subtle */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-white"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[600px]">
          {/* Content */}
          <div className="space-y-8">
            {/* Trust Badge */}
            <div className="inline-flex items-center space-x-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm border border-green-200">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-medium">Trusted by 50,000+ South Africans</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Home Services
                <span className="block text-blue-600">Made Simple</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Book trusted professionals for cleaning, repairs, and maintenance. 
                Quality guaranteed, transparent pricing, same-day availability.
              </p>
            </div>

            {/* Quick Booking Form */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 max-w-md">
              <div className="space-y-4">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Enter your address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="pl-10 h-12 text-lg border-gray-200 focus:border-blue-500"
                    data-testid="address-input"
                  />
                </div>
                <Button 
                  onClick={handleQuickBooking}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
                  disabled={!address.trim()}
                  data-testid="quick-book-button"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Find Services
                </Button>
              </div>
              <p className="text-sm text-gray-500 text-center mt-3">
                Available today • No hidden fees
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">2hrs</div>
                <div className="text-sm text-gray-600">Average booking time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">4.9★</div>
                <div className="text-sm text-gray-600">Customer rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">24/7</div>
                <div className="text-sm text-gray-600">Support available</div>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="relative lg:pl-8">
            <div className="relative">
              {/* Main Image Placeholder */}
              <div className="aspect-[4/5] bg-gradient-to-br from-blue-100 to-blue-50 rounded-3xl shadow-2xl flex items-center justify-center">
                <div className="text-center space-y-4 p-8">
                  <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
                    <Star className="w-12 h-12 text-white fill-current" />
                  </div>
                  <h3 className="text-2xl font-bold text-blue-900">Quality Guaranteed</h3>
                  <p className="text-blue-700">Professional services you can trust</p>
                </div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -top-4 -left-4 bg-white p-4 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Same Day</div>
                    <div className="text-xs text-gray-600">Available today</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-blue-600 fill-current" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Verified</div>
                    <div className="text-xs text-gray-600">All professionals</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}