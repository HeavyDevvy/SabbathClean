import { useState, useEffect } from "react";
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
import heroImage1 from "@assets/pensive-housewife-keeps-lips-folded-dreams-about-rest-leans-basket-with-laundry-detergents-holds-mop-going-wash-floor-wears-hoodie-rubber-gloves-focused-away-stands-against-pink-wall_1763407062587.jpg";
import heroImage2 from "@assets/handyman-using-wrench-fix_1763409051041.jpg";
import heroImage3 from "@assets/male-electrician-works-switchboard-with-electrical-connecting-cable (1)_1763409060358.jpg";
import heroImage4 from "@assets/garden-seasonal-maintenance_1763409073401.jpg";
import heroImage5 from "@assets/sushi-set-table_1763409085332.jpg";
import heroImage6 from "@assets/waiter-waitress-holding-serving-tray-with-glass-cocktail_1763409096437.jpg";
import heroImage7 from "@assets/delivery-service-personnel-transferring-package-from-truck_1763409112008.jpg";
import heroImage8 from "@assets/mother-observes-daughter-coloring-notebook-home_1763409119215.jpg";

interface EnhancedHeroProps {
  onBookingClick: () => void;
  onDemoClick?: () => void;
}

export default function EnhancedHero({ onBookingClick, onDemoClick }: EnhancedHeroProps) {
  const heroImages = [
    { src: heroImage1, alt: "Professional home cleaning service" },
    { src: heroImage2, alt: "Handyman plumbing service" },
    { src: heroImage3, alt: "Professional electrical service" },
    { src: heroImage4, alt: "Garden maintenance and care" },
    { src: heroImage5, alt: "Professional chef and catering service" },
    { src: heroImage6, alt: "Professional waitering service" },
    { src: heroImage7, alt: "Moving and delivery service" },
    { src: heroImage8, alt: "Au pair and childcare service" },
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [heroImages.length]);
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
    <section className="relative py-16 lg:py-24 overflow-hidden" style={{ backgroundColor: '#F7F2EF' }}>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 lg:items-center">
          {/* Content Column */}
          <div className="lg:col-span-6">
            {/* Hero Badge */}
            <div className="mb-6">
              <Badge className="text-white px-4 py-2 text-sm font-semibold border-0" style={{ backgroundColor: '#C56B86' }}>
                <Sparkles className="h-4 w-4 mr-2" />
                South Africa's #1 Home Services Platform
              </Badge>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ color: '#44062D' }}>
              All the help your
              <span className="block" style={{ color: '#C56B86' }}>
                home needs
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl leading-relaxed mb-8 max-w-2xl" style={{ color: '#3C0920' }}>
              From cleaning to gardening, plumbing to catering - connect with vetted, insured professionals 
              in your area. Book instantly, pay securely, and get the job done right.
            </p>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Button 
                size="lg" 
                className="text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                style={{ backgroundColor: '#C56B86' }}
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
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: '#C56B86' }}>
                    <indicator.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium leading-tight" style={{ color: '#3C0920' }}>
                    {indicator.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Column */}
          <div className="mt-12 lg:mt-0 lg:col-span-6">
            <div className="relative">
              {/* Main Hero Image Carousel */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl h-[700px]">
                {heroImages.map((image, index) => (
                  <img 
                    key={index}
                    src={image.src} 
                    alt={image.alt} 
                    className={`w-full h-full object-cover absolute top-0 left-0 transition-opacity duration-1000 ${
                      index === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                    }`}
                    style={{ 
                      imageRendering: '-webkit-optimize-contrast',
                      backfaceVisibility: 'hidden',
                      transform: 'translateZ(0)'
                    }}
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding="async"
                  />
                ))}
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-20"></div>

                {/* Carousel Indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
                  {heroImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentImageIndex 
                          ? 'bg-white w-8' 
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Floating Service Cards */}
                <div className="absolute top-6 left-6 bg-white rounded-lg p-4 shadow-lg backdrop-blur-sm z-30">
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

                <div className="absolute top-6 right-6 bg-white rounded-lg p-4 shadow-lg backdrop-blur-sm z-30">
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

              {/* Stats Card - Static, stays on top while images rotate behind */}
              <div className="absolute -bottom-6 left-6 right-6 bg-white rounded-xl p-6 shadow-2xl border z-40">
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