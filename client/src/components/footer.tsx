import { Button } from "@/components/ui/button";
import AppStoreCards from "@/components/app-store-cards";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Mail, 
  Phone, 
  MapPin,
  ArrowRight,
  Heart,
  Shield,
  Star
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Services",
      links: [
        { name: "House Cleaning", href: "/#services" },
        { name: "Garden Maintenance", href: "/#services" },
        { name: "Plumbing Services", href: "/#services" },
        { name: "Electrical Work", href: "/#services" },
        { name: "Chef & Catering", href: "/#services" },
        { name: "Elder Care", href: "/#services" },
      ]
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "/about" },
        { name: "How It Works", href: "/#how-it-works" },
        { name: "Trust & Safety", href: "/#trust-safety" },
        { name: "Careers", href: "/careers" },
        { name: "Press", href: "/press" },
        { name: "Contact", href: "/contact" },
      ]
    },
    {
      title: "Providers",
      links: [
        { name: "Become a Provider", href: "/provider-onboarding" },
        { name: "Provider Dashboard", href: "/provider-dashboard" },
        { name: "Training Center", href: "/provider-training" },
        { name: "Provider Support", href: "/provider-support" },
        { name: "Berry Stars Program", href: "/berry-stars" },
        { name: "Earnings", href: "/provider-earnings" },
      ]
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", href: "/help" },
        { name: "Customer Support", href: "/support" },
        { name: "Emergency Hotline", href: "tel:0800237779" },
        { name: "Safety Resources", href: "/safety" },
        { name: "Report Issue", href: "/report" },
        { name: "Feedback", href: "/feedback" },
      ]
    }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-white mb-4">
              Stay connected with Berry Events
            </h3>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Get the latest updates on new services, special offers, and home care tips 
              delivered straight to your inbox.
            </p>
            
            <div className="max-w-md mx-auto">
              <div className="flex gap-3">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                  data-testid="input-newsletter-email"
                />
                <Button 
                  className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-6 py-3 rounded-lg shadow-lg"
                  data-testid="button-newsletter-subscribe"
                >
                  Subscribe
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <p className="text-blue-100 text-sm mt-3">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">B</span>
                </div>
                <div className="ml-3">
                  <div className="text-2xl font-bold">Berry Events</div>
                  <div className="text-gray-400 text-sm">All your home services</div>
                </div>
              </div>
              
              <p className="text-gray-300 mb-6 leading-relaxed">
                South Africa's premier home services platform, connecting you with 
                verified professionals for all your domestic needs. Quality service, 
                every time.
              </p>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div className="text-sm text-gray-300">Fully Insured</div>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Star className="h-5 w-5" />
                  </div>
                  <div className="text-sm text-gray-300">Top Rated</div>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Heart className="h-5 w-5" />
                  </div>
                  <div className="text-sm text-gray-300">Trusted</div>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex space-x-4">
                <a 
                  href="https://facebook.com/berryevents" 
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors duration-200"
                  aria-label="Facebook"
                  data-testid="link-facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a 
                  href="https://twitter.com/berryevents" 
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-400 transition-colors duration-200"
                  aria-label="Twitter"
                  data-testid="link-twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a 
                  href="https://instagram.com/berryevents" 
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors duration-200"
                  aria-label="Instagram"
                  data-testid="link-instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Links Sections */}
            {footerSections.map((section, index) => (
              <div key={index} className="lg:col-span-1">
                <h4 className="text-lg font-semibold text-white mb-6">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a 
                        href={link.href} 
                        className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                        data-testid={`link-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Information Bar */}
      <div className="bg-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start">
              <Phone className="h-5 w-5 text-blue-400 mr-3" />
              <div>
                <div className="text-white font-medium">Customer Support</div>
                <div className="text-gray-300 text-sm">0800 BERRY (23779)</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center md:justify-start">
              <Mail className="h-5 w-5 text-green-400 mr-3" />
              <div>
                <div className="text-white font-medium">Email Us</div>
                <div className="text-gray-300 text-sm">support@berryevents.co.za</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center md:justify-start">
              <MapPin className="h-5 w-5 text-purple-400 mr-3" />
              <div>
                <div className="text-white font-medium">Service Areas</div>
                <div className="text-gray-300 text-sm">Cape Town, Johannesburg, Durban</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile App Download Section */}
      <div className="bg-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              Download the Berry Events Mobile App
            </h3>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Book services faster, track your appointments, and get instant notifications on your mobile device. 
              Available for iOS and Android.
            </p>
          </div>
          
          {/* App Store Cards */}
          <div className="max-w-4xl mx-auto">
            <AppStoreCards />
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-black py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © {currentYear} Berry Events. All rights reserved.
            </div>
            
            <div className="flex flex-wrap gap-6 text-sm">
              <a href="/privacy" className="text-gray-400 hover:text-white transition-colors duration-200">
                Privacy Policy
              </a>
              <a href="/terms" className="text-gray-400 hover:text-white transition-colors duration-200">
                Terms of Service
              </a>
              <a href="/cookies" className="text-gray-400 hover:text-white transition-colors duration-200">
                Cookie Policy
              </a>
              <a href="/legal" className="text-gray-400 hover:text-white transition-colors duration-200">
                Legal
              </a>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-800 text-center">
            <p className="text-gray-500 text-xs">
              Berry Events is a registered trademark. Licensed and regulated by the Companies and Intellectual Property Commission (CIPC). 
              All service providers are independent contractors and are fully insured.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}