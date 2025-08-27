import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Play, 
  Shield, 
  UserCheck, 
  Clock, 
  Sparkles, 
  Star,
  CheckCircle2,
  TrendingUp,
  Award
} from "lucide-react";

interface EnhancedHeroProps {
  onBookingClick: () => void;
  onDemoClick?: () => void;
}

export default function EnhancedHero({ onBookingClick, onDemoClick }: EnhancedHeroProps) {
  const trustIndicators = [
    { icon: Shield, text: "Fully Insured", color: "bg-green-100 text-green-600" },
    { icon: UserCheck, text: "Background Verified", color: "bg-blue-100 text-blue-600" },
    { icon: Clock, text: "Same Day Booking", color: "bg-purple-100 text-purple-600" },
    { icon: Award, text: "Quality Guaranteed", color: "bg-yellow-100 text-yellow-600" },
  ];

  const stats = [
    { value: "10K+", label: "Happy Customers", icon: Star },
    { value: "4.9/5", label: "Average Rating", icon: TrendingUp },
    { value: "2 min", label: "Booking Time", icon: Clock },
    { value: "500+", label: "Verified Providers", icon: UserCheck },
  ];

  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16 lg:py-24 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-blue-200 to-purple-200 rounded-full blur-3xl opacity-20 -translate-y-32 translate-x-32"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-r from-green-200 to-blue-200 rounded-full blur-3xl opacity-20 translate-y-32 -translate-x-32"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 lg:items-center">
          {/* Content Column */}
          <div className="lg:col-span-6">
            {/* Hero Badge */}
            <div className="mb-6">
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 text-sm font-semibold border-0">
                <Sparkles className="h-4 w-4 mr-2" />
                South Africa's #1 Home Services Platform
              </Badge>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              All the help your
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                home needs
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl text-gray-600 leading-relaxed mb-8 max-w-2xl">
              From cleaning to gardening, plumbing to catering - connect with vetted, insured professionals 
              in your area. Book instantly, pay securely, and get the job done right.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Button 
                onClick={onBookingClick}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                data-testid="button-book-service-now"
              >
                <Calendar className="mr-2 h-5 w-5" />
                Book Service Now
              </Button>
              
              <Button 
                variant="outline"
                size="lg" 
                className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold px-8 py-4 rounded-xl transition-all duration-200 hover:scale-105 transform"
                onClick={onDemoClick || (() => {
                  const demoSection = document.getElementById('how-it-works');
                  demoSection?.scrollIntoView({ behavior: 'smooth' });
                })}
                data-testid="button-watch-demo"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch How It Works
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {trustIndicators.map((indicator, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${indicator.color}`}>
                    <indicator.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 leading-tight">
                    {indicator.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Column */}
          <div className="mt-12 lg:mt-0 lg:col-span-6">
            <div className="relative">
              {/* Main Hero Image */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                  alt="Professional home cleaning service" 
                  className="w-full h-[500px] object-cover" 
                />
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

                {/* Floating Service Cards */}
                <div className="absolute top-6 left-6 bg-white rounded-lg p-4 shadow-lg backdrop-blur-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Live Tracking</p>
                      <p className="text-sm text-gray-600">Provider en route</p>
                    </div>
                  </div>
                </div>

                <div className="absolute top-6 right-6 bg-white rounded-lg p-4 shadow-lg backdrop-blur-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Star className="h-6 w-6 text-green-600 fill-current" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">5.0 Rating</p>
                      <p className="text-sm text-gray-600">Nomsa M.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Card */}
              <div className="absolute -bottom-6 left-6 right-6 bg-white rounded-xl p-6 shadow-2xl border">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <stat.icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900" data-testid={`stat-${stat.label.toLowerCase().replace(' ', '-')}`}>
                        {stat.value}
                      </div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-20 blur-xl"></div>
              <div className="absolute -bottom-8 -left-4 w-32 h-32 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full opacity-20 blur-xl"></div>
            </div>
          </div>
        </div>

        {/* Additional Trust Section */}
        <div className="mt-20 text-center">
          <p className="text-gray-500 text-sm mb-6">Trusted by leading organizations</p>
          <div className="flex items-center justify-center space-x-8 opacity-60">
            <div className="text-2xl font-bold text-gray-400">PropertyFox</div>
            <div className="text-2xl font-bold text-gray-400">Seeff</div>
            <div className="text-2xl font-bold text-gray-400">Pam Golding</div>
            <div className="text-2xl font-bold text-gray-400">RE/MAX</div>
          </div>
        </div>
      </div>
    </section>
  );
}