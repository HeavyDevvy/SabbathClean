import { Button } from "@/components/ui/button";
import { Home, User, Plus } from "lucide-react";
import { Link } from "wouter";

interface HeaderProps {
  onBookingClick?: () => void;
}

export default function Header({ onBookingClick }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Home className="text-white h-5 w-5" />
            </div>
            <span className="ml-3 text-xl font-bold text-primary">Berry Events</span>
            <span className="ml-2 text-sm text-neutral">Our Home Experts</span>
          </Link>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <a href="#services" className="text-neutral hover:text-primary transition-colors duration-200" data-testid="link-services">
                Services
              </a>
              <Link href="/providers" className="text-neutral hover:text-primary transition-colors duration-200" data-testid="link-providers">
                Our Home Experts
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
