import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, ShoppingBag } from "lucide-react";
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
import berryLogo from "@assets/Untitled (Logo) (2)_1763529143099.png";

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
    <header className="sticky top-0 z-50" style={{ backgroundColor: '#F7F2EF' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-transparent">
              <img src={berryLogo} alt="Berry Events Logo" className="w-full h-full object-cover" />
            </div>
            <div className="hidden sm:block">
              <div className="text-2xl font-bold" style={{ color: '#44062D' }}>Berry Events</div>
              <div className="text-xs" style={{ color: '#3C0920' }}>All your Home Services In One</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/pricing" 
              className="transition-colors duration-200 text-sm font-medium"
              style={{ color: '#3C0920' }}
            >
              Pricing
            </Link>
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Button
                  onClick={() => setLocation("/auth")}
                  variant="ghost"
                  className="font-medium"
                  style={{ color: '#3C0920' }}
                  data-testid="button-sign-in"
                >
                  Sign In
                </Button>
                
                <Button
                  onClick={onBookingClick}
                  className="font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-white"
                  style={{ backgroundColor: '#C56B86' }}
                  data-testid="button-book-service"
                >
                  Book Now
                </Button>

                <div className="pl-6 ml-4" style={{ borderLeft: '1px solid #EED1C4' }}>
                  <span className="text-sm mr-3" style={{ color: '#3C0920' }}>Are you a provider?</span>
                  <Button
                    onClick={() => setLocation("/provider-onboarding")}
                    variant="outline"
                    className="border-2 font-medium rounded-xl px-6 py-3 transition-all duration-300"
                    style={{ borderColor: '#C56B86', color: '#44062D' }}
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
                  className="font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-white"
                  style={{ backgroundColor: '#C56B86' }}
                  data-testid="button-book-service"
                >
                  Book Now
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="flex items-center space-x-2" 
                      data-testid="button-user-menu"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user?.profileImage} alt={user?.firstName} />
                        <AvatarFallback className="text-sm font-semibold text-white" style={{ backgroundColor: '#C56B86' }}>
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium" style={{ color: '#44062D' }}>
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
          <div className="md:hidden" style={{ borderTop: '1px solid #EED1C4' }}>
            <div className="py-4 space-y-3">
              <Link 
                href="/services" 
                className="block px-4 py-2 font-medium"
                style={{ color: '#3C0920' }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Services
              </Link>
              <Link 
                href="/pricing" 
                className="block px-4 py-2 font-medium"
                style={{ color: '#3C0920' }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link 
                href="/about" 
                className="block px-4 py-2 font-medium"
                style={{ color: '#3C0920' }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              
              <div className="pt-3 px-4 space-y-3" style={{ borderTop: '1px solid #EED1C4' }}>
                {!isAuthenticated ? (
                  <>
                    <Button
                      onClick={() => {
                        setLocation("/auth");
                        setIsMobileMenuOpen(false);
                      }}
                      variant="ghost"
                      className="w-full text-left justify-start"
                      style={{ color: '#3C0920' }}
                    >
                      Sign In
                    </Button>
                    
                    <Button
                      onClick={() => {
                        onBookingClick();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-white rounded-xl"
                      style={{ backgroundColor: '#C56B86' }}
                    >
                      Book Now
                    </Button>
                    
                    <div className="text-center pt-2">
                      <span className="text-sm block mb-2" style={{ color: '#3C0920' }}>Are you a worker?</span>
                      <Button
                        onClick={() => {
                          setLocation("/provider-onboarding");
                          setIsMobileMenuOpen(false);
                        }}
                        variant="outline"
                        className="w-full border-2 rounded-xl"
                        style={{ borderColor: '#C56B86', color: '#44062D' }}
                      >
                        Apply Now
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="px-4 py-2" style={{ borderBottom: '1px solid #EED1C4' }}>
                      <p className="text-sm font-medium" style={{ color: '#44062D' }}>
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs" style={{ color: '#3C0920' }}>{user?.email}</p>
                    </div>

                    <Button
                      onClick={() => {
                        onBookingClick();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-white rounded-xl"
                      style={{ backgroundColor: '#C56B86' }}
                    >
                      Book Now
                    </Button>

                    <Button
                      onClick={() => {
                        setLocation("/profile");
                        setIsMobileMenuOpen(false);
                      }}
                      variant="ghost"
                      className="w-full text-left justify-start"
                      style={{ color: '#3C0920' }}
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
                      className="w-full text-left justify-start"
                      style={{ color: '#3C0920' }}
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
                      className="w-full text-left justify-start text-red-600 hover:text-red-700"
                      style={{ backgroundColor: 'transparent' }}
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
