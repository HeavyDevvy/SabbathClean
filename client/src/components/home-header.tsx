import { Button } from "@/components/ui/button";
import { User, Bell, MessageCircle, Menu, Search } from "lucide-react";
import { useState } from "react";

interface HomeHeaderProps {
  isAuthenticated?: boolean;
  user?: {
    firstName: string;
    lastName: string;
    role: string;
  };
  notificationCount?: number;
  messageCount?: number;
  onBookService?: () => void;
}

export default function HomeHeader({ 
  isAuthenticated = false,
  user,
  notificationCount = 0,
  messageCount = 0,
  onBookService
}: HomeHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <h1 className="text-2xl font-bold text-blue-600" data-testid="logo">
              Berry Events
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#services" className="text-gray-700 hover:text-blue-600 font-medium" data-testid="nav-services">
              Services
            </a>
            <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 font-medium" data-testid="nav-how-it-works">
              How It Works
            </a>
            <a href="#providers" className="text-gray-700 hover:text-blue-600 font-medium" data-testid="nav-become-provider">
              Become a Provider
            </a>
            <a href="#support" className="text-gray-700 hover:text-blue-600 font-medium" data-testid="nav-support">
              Support
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Button variant="ghost" data-testid="button-login">Sign In</Button>
                <Button onClick={onBookService} data-testid="button-book-service">
                  Book Service
                </Button>
              </>
            ) : (
              <>
                {/* Search */}
                <Button variant="ghost" size="icon" data-testid="button-search">
                  <Search className="h-5 w-5" />
                </Button>

                {/* Messages */}
                <Button variant="ghost" size="icon" className="relative" data-testid="button-messages">
                  <MessageCircle className="h-5 w-5" />
                  {messageCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {messageCount}
                    </span>
                  )}
                </Button>

                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                </Button>

                {/* User Profile */}
                <Button variant="ghost" size="icon" data-testid="button-profile">
                  <User className="h-5 w-5" />
                </Button>

                {/* Book Service Button */}
                <Button onClick={onBookService} data-testid="button-book-service">
                  Book Service
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              data-testid="button-mobile-menu"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              <a
                href="#services"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                data-testid="mobile-nav-services"
              >
                Services
              </a>
              <a
                href="#how-it-works"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                data-testid="mobile-nav-how-it-works"
              >
                How It Works
              </a>
              <a
                href="#providers"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                data-testid="mobile-nav-become-provider"
              >
                Become a Provider
              </a>
              <a
                href="#support"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                data-testid="mobile-nav-support"
              >
                Support
              </a>
              
              {!isAuthenticated ? (
                <div className="mt-4 flex flex-col space-y-2 px-3">
                  <Button variant="ghost" className="justify-start" data-testid="mobile-button-login">
                    Sign In
                  </Button>
                  <Button onClick={onBookService} className="justify-start" data-testid="mobile-button-book-service">
                    Book Service
                  </Button>
                </div>
              ) : (
                <div className="mt-4 flex flex-col space-y-2 px-3">
                  <div className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700">
                    <User className="h-4 w-4" />
                    <span>{user?.firstName} {user?.lastName}</span>
                  </div>
                  <Button variant="ghost" className="justify-start" data-testid="mobile-button-messages">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Messages {messageCount > 0 && `(${messageCount})`}
                  </Button>
                  <Button variant="ghost" className="justify-start" data-testid="mobile-button-notifications">
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications {notificationCount > 0 && `(${notificationCount})`}
                  </Button>
                  <Button onClick={onBookService} className="justify-start" data-testid="mobile-button-book-service">
                    Book Service
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}