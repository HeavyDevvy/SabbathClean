import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, ShoppingBag, Settings } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SweepSouthStyleHeaderProps {
  onBookingClick: () => void;
  onProviderSignupClick?: () => void;
}

export default function SweepSouthStyleHeader({ onBookingClick, onProviderSignupClick }: SweepSouthStyleHeaderProps) {
  const [, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const getUserInitials = () => {
    if (!user) return "?";
    return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Berry Events</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/services" 
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
            >
              Services
            </Link>
            <Link 
              href="/pricing" 
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
            >
              Pricing
            </Link>
            <Link 
              href="/about" 
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
            >
              About
            </Link>
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Button
                  onClick={() => setLocation("/auth")}
                  variant="ghost"
                  className="text-gray-700 hover:text-blue-600 font-medium"
                  data-testid="button-sign-in"
                >
                  Sign In
                </Button>
                
                <Button
                  onClick={onBookingClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                  data-testid="button-book-service"
                >
                  Book a Service
                </Button>

                <div className="border-l border-gray-200 pl-4 ml-4">
                  <span className="text-sm text-gray-600 mr-2">Are you a worker?</span>
                  <Button
                    onClick={() => setLocation("/provider-onboarding")}
                    variant="outline"
                    className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-medium"
                    data-testid="button-apply-now"
                  >
                    Apply Now
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Button
                  onClick={onBookingClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                  data-testid="button-book-service"
                >
                  Book a Service
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="flex items-center space-x-2" 
                      data-testid="button-user-menu"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.profileImage} alt={user?.firstName} />
                        <AvatarFallback className="bg-blue-600 text-white text-sm">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-gray-700">
                        {user?.firstName || "Account"}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setLocation("/profile")} data-testid="menu-item-profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>My Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation("/bookings")} data-testid="menu-item-bookings">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      <span>My Bookings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} data-testid="menu-item-logout">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            variant="ghost"
            size="sm"
            className="md:hidden"
            data-testid="button-mobile-menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100">
            <div className="py-4 space-y-3">
              <Link 
                href="/services" 
                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Services
              </Link>
              <Link 
                href="/pricing" 
                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link 
                href="/about" 
                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              
              <div className="border-t border-gray-100 pt-3 px-4 space-y-3">
                {!isAuthenticated ? (
                  <>
                    <Button
                      onClick={() => {
                        setLocation("/auth");
                        setIsMobileMenuOpen(false);
                      }}
                      variant="ghost"
                      className="w-full text-left justify-start text-gray-700"
                    >
                      Sign In
                    </Button>
                    
                    <Button
                      onClick={() => {
                        onBookingClick();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Book a Service
                    </Button>
                    
                    <div className="text-center pt-2">
                      <span className="text-sm text-gray-600 block mb-2">Are you a worker?</span>
                      <Button
                        onClick={() => {
                          setLocation("/provider-onboarding");
                          setIsMobileMenuOpen(false);
                        }}
                        variant="outline"
                        className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                      >
                        Apply Now
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>

                    <Button
                      onClick={() => {
                        onBookingClick();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Book a Service
                    </Button>

                    <Button
                      onClick={() => {
                        setLocation("/profile");
                        setIsMobileMenuOpen(false);
                      }}
                      variant="ghost"
                      className="w-full text-left justify-start text-gray-700"
                    >
                      <User className="mr-2 h-4 w-4" />
                      My Profile
                    </Button>

                    <Button
                      onClick={() => {
                        setLocation("/bookings");
                        setIsMobileMenuOpen(false);
                      }}
                      variant="ghost"
                      className="w-full text-left justify-start text-gray-700"
                    >
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      My Bookings
                    </Button>

                    <Button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      variant="ghost"
                      className="w-full text-left justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
