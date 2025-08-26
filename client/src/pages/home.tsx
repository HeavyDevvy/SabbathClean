import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import HomeHeader from "@/components/home-header";
import HeroSection from "@/components/hero-section";
import ServicesSection from "@/components/services-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CheckCircle, Users, Clock, Shield, 
  ArrowRight, Star, MapPin, Phone, Mail 
} from "lucide-react";
import type { Service, ServiceProvider } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";

export default function HomePage() {
  const [, setLocation] = useLocation();
  const [isAuthenticated] = useState(false); // Mock auth state

  // Fetch featured providers
  const { data: providers = [] } = useQuery<ServiceProvider[]>({
    queryKey: ["/api/providers?verified=true"],
  });

  // Fetch platform stats
  const { data: stats } = useQuery<any>({
    queryKey: ["/api/admin/stats"],
  });

  const handleBookService = (serviceId?: string) => {
    if (serviceId) {
      setLocation(`/book/${serviceId}`);
    } else {
      setLocation('/book');
    }
  };

  const handleLearnMore = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  const workSteps = [
    {
      step: 1,
      title: "Choose Your Service",
      description: "Select from our wide range of home services including cleaning, repairs, gardening, and specialized care.",
      icon: CheckCircle
    },
    {
      step: 2,
      title: "Get Matched",
      description: "Our algorithm matches you with verified, insured professionals in your area based on your needs and schedule.",
      icon: Users
    },
    {
      step: 3,
      title: "Book & Relax",
      description: "Confirm your booking, communicate directly with your provider, and enjoy professional service delivered to your door.",
      icon: Clock
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      location: "Cape Town",
      rating: 5,
      text: "Maria has been cleaning our home for 6 months now. Always punctual, thorough, and professional. Highly recommended!",
      service: "House Cleaning",
      avatar: "/api/placeholder/60/60"
    },
    {
      name: "David Smith", 
      location: "Johannesburg",
      rating: 5,
      text: "John transformed our garden completely. His attention to detail and plant knowledge is exceptional. Garden looks amazing!",
      service: "Garden Maintenance",
      avatar: "/api/placeholder/60/60"
    },
    {
      name: "Lisa Williams",
      location: "Durban", 
      rating: 5,
      text: "The plumbing emergency service was lifesaver. Quick response, professional work, and fair pricing. Will use again.",
      service: "Plumbing Repairs",
      avatar: "/api/placeholder/60/60"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <HomeHeader 
        isAuthenticated={isAuthenticated}
        notificationCount={3}
        messageCount={1}
        onBookService={() => handleBookService()}
      />

      <main>
        {/* Hero Section */}
        <HeroSection 
          onBookService={() => handleBookService()}
          onLearnMore={handleLearnMore}
        />

        {/* Services Section */}
        <ServicesSection onSelectService={handleBookService} />

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 lg:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                How It Works
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Getting professional help for your home has never been easier. 
                Our simple 3-step process connects you with trusted professionals in minutes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              {workSteps.map((step, index) => (
                <div key={step.step} className="text-center relative">
                  {/* Step Number */}
                  <div className="relative mb-8">
                    <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-white border-2 border-blue-600 rounded-full flex items-center justify-center text-blue-600 font-bold">
                      {step.step}
                    </div>
                    {/* Connector Line */}
                    {index < workSteps.length - 1 && (
                      <div className="hidden md:block absolute top-10 left-1/2 w-full h-0.5 bg-gray-300 -ml-10" />
                    )}
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button 
                size="lg" 
                onClick={() => handleBookService()}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="how-it-works-cta"
              >
                Start Booking Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Providers Section */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Meet Our Top Providers
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                All our professionals are background-checked, insured, and rated by our community. 
                Here are some of our highest-rated service providers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {providers.slice(0, 6).map((provider: any) => (
                <Card key={provider.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="text-center pb-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
                      <img 
                        src={provider.profileImages[0] || "/api/placeholder/80/80"}
                        alt={`${provider.user?.firstName} ${provider.user?.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardTitle className="text-lg">
                      {provider.user?.firstName} {provider.user?.lastName}
                    </CardTitle>
                    <CardDescription>
                      {provider.businessName || 'Independent Professional'}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="text-center">
                    <div className="flex items-center justify-center mb-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < Math.floor(provider.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                        <span className="ml-2 text-sm text-gray-600">
                          {provider.rating} ({provider.totalReviews} reviews)
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-6">
                      <div className="flex items-center justify-center">
                        <Shield className="w-4 h-4 mr-2" />
                        <span>{provider.completedJobs} jobs completed</span>
                      </div>
                      <div className="flex items-center justify-center">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{provider.responseTime} min response time</span>
                      </div>
                      <div className="flex items-center justify-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{provider.serviceAreas.slice(0, 2).join(', ')}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center mb-6">
                      {provider.services.slice(0, 2).map((serviceId: string) => (
                        <span 
                          key={serviceId}
                          className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full"
                        >
                          {serviceId.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </span>
                      ))}
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {provider.bio}
                    </p>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      data-testid={`view-provider-${provider.id}`}
                    >
                      View Profile
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => setLocation('/providers')}
                data-testid="view-all-providers"
              >
                View All Providers
              </Button>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 lg:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                What Our Customers Say
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Don't just take our word for it. Here's what real customers have to say 
                about their experience with our platform and service providers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <img 
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full mr-4"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                        <p className="text-sm text-gray-600">{testimonial.location}</p>
                      </div>
                    </div>

                    <div className="flex items-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-600">{testimonial.service}</span>
                    </div>

                    <p className="text-gray-700 italic">"{testimonial.text}"</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-24 bg-blue-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Join thousands of satisfied customers who trust us with their home service needs. 
              Book your first service today and experience the difference.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => handleBookService()}
                className="text-lg px-8 py-4"
                data-testid="cta-book-service"
              >
                Book a Service
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => setLocation('/providers')} 
                className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-blue-600"
                data-testid="cta-become-provider"
              >
                Become a Provider
              </Button>
            </div>

            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-blue-500">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {stats.totalUsers.toLocaleString()}+
                  </div>
                  <div className="text-blue-100">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {stats.activeProviders}+
                  </div>
                  <div className="text-blue-100">Verified Providers</div>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                      {stats.completedBookings.toLocaleString()}+
                    </div>
                    <div className="text-blue-100">Services Completed</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {stats.averageRating}★
                  </div>
                  <div className="text-blue-100">Average Rating</div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <h3 className="text-xl font-bold mb-4">HomeServices</h3>
              <p className="text-gray-400 mb-4">
                Connecting South African families with trusted, verified home service professionals.
              </p>
              <div className="flex space-x-4">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400">+27 (0) 800 123 456</span>
              </div>
              <div className="flex space-x-4 mt-2">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400">hello@homeservices.co.za</span>
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">House Cleaning</a></li>
                <li><a href="#" className="hover:text-white">Garden Maintenance</a></li>
                <li><a href="#" className="hover:text-white">Repairs & Maintenance</a></li>
                <li><a href="#" className="hover:text-white">Elder Care</a></li>
                <li><a href="#" className="hover:text-white">Full-time Placements</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">How It Works</a></li>
                <li><a href="#" className="hover:text-white">Become a Provider</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Press</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Safety</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">© 2025 HomeServices. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <span className="text-gray-400">Made with ❤️ in South Africa</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}