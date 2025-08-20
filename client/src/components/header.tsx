import { Button } from "@/components/ui/button";
import { User, Plus } from "lucide-react";
import { Link } from "wouter";
import berryLogo from "@assets/PHOTO-2025-07-11-15-55-28_1755621947509.jpg";

interface HeaderProps {
  onBookingClick?: () => void;
}

export default function Header({ onBookingClick }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <div className="w-10 h-10 rounded-lg overflow-hidden">
              <img src={berryLogo} alt="Berry Events Logo" className="w-full h-full object-cover" />
            </div>
            <span className="ml-3 text-xl font-bold text-primary">Berry Events</span>
            <span className="ml-2 text-sm text-neutral">- All your Home Services In One</span>
          </Link>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <a href="#services" className="text-neutral hover:text-primary transition-colors duration-200" data-testid="link-services">
                Services
              </a>
              <Link href="/providers" className="text-neutral hover:text-primary transition-colors duration-200" data-testid="link-providers">
                Our Home Experts
              </Link>
              <Link href="/provider-training" className="text-neutral hover:text-primary transition-colors duration-200" data-testid="link-training">
                Training Center
              </Link>
              <a href="#pricing" className="text-neutral hover:text-primary transition-colors duration-200" data-testid="link-pricing">
                Pricing
              </a>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/provider-onboarding" className="text-primary hover:text-primary/80 transition-colors duration-200 text-sm font-medium" data-testid="link-become-provider">
              Become a Provider
            </Link>
            <Link href="/profile">
              <Button variant="ghost" className="text-neutral hover:text-primary" data-testid="button-profile">
                <span className="hidden sm:inline">Sign In</span>
                <User className="h-4 w-4 sm:hidden" />
              </Button>
            </Link>
            <Button 
              onClick={onBookingClick}
              className="bg-primary text-white hover:bg-blue-700"
              data-testid="button-book-now"
            >
              <span className="hidden sm:inline">Book Now</span>
              <Plus className="h-4 w-4 sm:hidden" />
            </Button>
          </div>
        </div>
      </nav>
    </header>
  );
}
