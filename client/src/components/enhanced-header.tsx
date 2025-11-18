import { useState, memo } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Search, Bell, User, Calendar, Settings, Home, LayoutGrid, LogOut, CreditCard, ChevronDown, Sparkles, Droplets, Zap, TreePine, ChefHat, Users, Wrench, Scissors, Smartphone, MessageSquare, Shield, Wallet, Truck, Baby } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { useNotifications } from "@/hooks/useNotifications";
import { OptimizedImage } from "@/components/ui/optimized-image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AuthModal from "./auth-modal";
import UserProfileModal from "./user-profile-modal";
import { CartDrawer } from "./cart-drawer";
import logo from "@assets/berry-logo.png";

interface EnhancedHeaderProps {
  onBookingClick: () => void;
  onServiceSelect?: (serviceId: string) => void;
  isAuthenticated?: boolean;
  user?: {
    firstName: string;
    lastName: string;
    profileImage?: string;
    isProvider?: boolean;
  };
  notificationCount?: number;
  messageCount?: number;
}

const EnhancedHeader = memo(function EnhancedHeader({ 
  onBookingClick, 
  onServiceSelect,
  isAuthenticated = false, 
  user,
  notificationCount = 0,
  messageCount = 0 
}: EnhancedHeaderProps) {
  const [, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const { toast } = useToast();
  const { itemCount } = useCart();
  const { unreadCount } = useNotifications(isAuthenticated);

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await authClient.logout();
    },
    onSuccess: () => {
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
      setLocation("/");
      window.location.reload();
    },
    onError: () => {
      toast({
        title: "Logout Error",
        description: "There was an error signing out. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const services = [
    { id: "cleaning", name: "House Cleaning", icon: Sparkles },
    { id: "plumbing", name: "Plumbing Services", icon: Droplets },
    { id: "electrical", name: "Electrical Services", icon: Zap },
    { id: "garden-care", name: "Garden Care", icon: TreePine },
    { id: "chef-catering", name: "Chef & Catering", icon: ChefHat },
    { id: "event-staff", name: "Event Staffing", icon: Users },
    { id: "moving", name: "Moving Services", icon: Truck },
    { id: "au-pair", name: "Au Pair Services", icon: Baby }
  ];

  const handleServiceSelect = (serviceId: string) => {
    if (onServiceSelect) {
      onServiceSelect(serviceId);
    } else {
      onBookingClick();
    }
  };

  return (
    <header className="sticky top-0 z-50 shadow-sm" style={{ backgroundColor: '#44062D' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-auto py-2">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="flex items-center space-x-3">
              <img src={logo} alt="Berry Events logo" className="h-[90px] w-[90px] object-contain" loading="eager" data-critical="true" />
              <div className="hidden sm:block">
                <span className="text-base font-bold text-white">Berry Events</span>
                <p className="text-[10px] text-[#EED1C4] -mt-1">All your home services</p>
              </div>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
              <input
                type="text"
                placeholder="Search services, providers, or help..."
                className="w-full pl-9 pr-4 py-1.5 text-sm border border-white/20 rounded-lg focus:ring-2 focus:ring-[#C56B86] focus:border-transparent bg-white/10 text-white placeholder-white/60"
                data-testid="search-input"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className="text-white hover:text-[#EED1C4] transition-colors duration-200 font-medium flex items-center text-sm"
              data-testid="nav-home"
            >
              <Home className="h-3.5 w-3.5 mr-1" />
              Home
            </Link>
            <Link 
              href="/services" 
              className="text-white hover:text-[#EED1C4] transition-colors duration-200 font-medium flex items-center text-sm"
              data-testid="nav-services"
            >
              <LayoutGrid className="h-3.5 w-3.5 mr-1" />
              Services
            </Link>
            {!isAuthenticated && (
              <Link 
                href="/auth"
                className="text-white hover:text-[#EED1C4] transition-colors duration-200 font-medium text-sm"
                data-testid="nav-sign-in"
              >
                Sign In
              </Link>
            )}
            {isAuthenticated && user?.isProvider && (
              <Link 
                href="/provider-dashboard" 
                className="text-white hover:text-[#EED1C4] transition-colors duration-200 font-medium text-sm"
                data-testid="nav-provider-dashboard"
              >
                Provider Hub
              </Link>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search Toggle - Tablet */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsSearchVisible(!isSearchVisible)}
              data-testid="button-search-toggle"
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Shopping Cart - Always visible with notification badge */}
            <div className="relative">
              <CartDrawer />
              {itemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs p-0 flex items-center justify-center animate-pulse">
                  {itemCount > 9 ? '9+' : itemCount}
                </Badge>
              )}
            </div>

            {isAuthenticated ? (
              <>


                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative text-white hover:text-[#EED1C4]"
                  onClick={() => setLocation("/notifications")}
                  data-testid="button-notifications"
                >
                  <Bell className="h-4 w-4 text-white" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] p-0 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </Button>



                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full" data-testid="button-user-menu">
                      {user?.profileImage ? (
                        <OptimizedImage
                          src={user.profileImage}
                          alt={`${user.firstName} ${user.lastName}`}
                          className="h-8 w-8 rounded-full object-cover"
                          containerClassName="h-8 w-8 rounded-full"
                          skeletonClassName="rounded-full"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#C56B86' }}>
                          <span className="text-white font-semibold text-xs">
                            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                          </span>
                        </div>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user?.isProvider ? 'Service Provider' : 'Customer'}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setLocation("/profile")} data-testid="link-profile-settings">
                      <User className="mr-2 h-4 w-4" />
                      Profile & Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation("/bookings")}>
                      <Calendar className="mr-2 h-4 w-4" />
                      My Bookings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation("/wallet")} data-testid="nav-wallet">
                      <Wallet className="mr-2 h-4 w-4" />
                      My Wallet
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation("/settings")}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="text-red-600"
                      data-testid="button-logout"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <div className="border-l border-white/20 pl-4 ml-4">
                  <span className="text-xs text-white/80 mr-2">Service provider?</span>
                  <Button
                    onClick={() => setLocation("/provider-onboarding")}
                    variant="outline"
                    size="sm"
                    className="border-[#C56B86] text-[#C56B86] hover:bg-[#C56B86] hover:text-white font-medium text-xs"
                    data-testid="button-join-as-provider"
                  >
                    Join as Provider
                  </Button>
                </div>
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
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Search Bar */}
        {isSearchVisible && (
          <div className="lg:hidden py-3 border-t border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search services or providers..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                data-testid="search-input-mobile"
              />
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100">
            <div className="py-4 space-y-3">
              {/* Mobile Search */}
              <div className="px-4 lg:hidden">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search services..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
              </div>

              {/* Navigation Links */}
              <Link 
                href="/services" 
                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Services
              </Link>
              
              {/* Shopping Cart - Mobile */}
              <div className="px-4">
                <CartDrawer />
              </div>
              
              <Link 
                href="/auth" 
                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In
              </Link>

              {isAuthenticated ? (
                <>
                  <Link 
                    href="/bookings" 
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Bookings
                  </Link>
                  <Link 
                    href="/messages" 
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 font-medium flex items-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Messages
                    {messageCount > 0 && (
                      <Badge className="ml-auto bg-green-500">{messageCount}</Badge>
                    )}
                  </Link>
                  <Link 
                    href="/profile" 
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link 
                    href="/wallet" 
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 font-medium flex items-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                    data-testid="mobile-nav-wallet"
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    My Wallet
                  </Link>
                  {user?.isProvider && (
                    <Link 
                      href="/provider-dashboard" 
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Provider Dashboard
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link 
                    href="/auth" 
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/provider-onboarding" 
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Become a Provider
                  </Link>
                </>
              )}

              {/* Mobile CTA Buttons */}
              <div className="px-4 pt-4 space-y-3">
                <Button
                  onClick={() => {
                    onBookingClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-white font-semibold hover:opacity-90"
                  style={{ backgroundColor: '#8B4789' }}
                  data-testid="button-book-service-mobile"
                >
                  Book a Service
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
        }}
      />

      {/* User Profile Modal */}
      {currentUser && (
        <UserProfileModal 
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={currentUser}
        />
      )}
    </header>
  );
});

export default EnhancedHeader;