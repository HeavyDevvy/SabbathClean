import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Search, Bell, User, Calendar, Settings, Home, Briefcase, LogOut, CreditCard, ChevronDown, Sparkles, Droplets, Zap, TreePine, ChefHat, Users, Wrench, Scissors, Smartphone, MessageSquare, Shield, Wallet } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { useToast } from "@/hooks/use-toast";
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
import logoImage from "@assets/Untitled design (1)_1762495302156.png";

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

export default function EnhancedHeader({ 
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
    { id: "house-cleaning", name: "House Cleaning", icon: Sparkles },
    { id: "plumbing", name: "Plumbing Services", icon: Droplets },
    { id: "electrical", name: "Electrical Services", icon: Zap },
    { id: "garden-maintenance", name: "Garden Maintenance", icon: TreePine },
    { id: "chef-catering", name: "Chef & Catering", icon: ChefHat },
    { id: "event-staff", name: "Event Staffing", icon: Users },
    { id: "handyman", name: "Handyman Services", icon: Wrench },
    { id: "beauty-wellness", name: "Beauty & Wellness", icon: Scissors }
  ];

  const handleServiceSelect = (serviceId: string) => {
    if (onServiceSelect) {
      onServiceSelect(serviceId);
    } else {
      onBookingClick();
    }
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="flex items-center space-x-3">
              <img 
                src={logoImage} 
                alt="Berry Events Logo" 
                className="h-8"
                style={{ width: 'auto' }}
              />
              <div className="hidden sm:block">
                <span className="text-xl font-bold text-gray-900">Berry Events</span>
                <p className="text-xs text-gray-500 -mt-1">All your home services</p>
              </div>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search services, providers, or help..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                data-testid="search-input"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium flex items-center"
              data-testid="nav-home"
            >
              <Home className="h-4 w-4 mr-1" />
              Home
            </Link>
            <Link 
              href="/services" 
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium flex items-center"
              data-testid="nav-services"
            >
              <Briefcase className="h-4 w-4 mr-1" />
              Services
            </Link>
            {/* Admin Portal - Always visible */}
            <Link 
              href="/admin" 
              className="text-purple-600 hover:text-purple-700 transition-colors duration-200 font-medium flex items-center"
              data-testid="nav-admin-portal"
            >
              <Shield className="h-4 w-4 mr-1" />
              Admin Portal
            </Link>
            {!isAuthenticated && (
              <Link 
                href="/auth"
                className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
                data-testid="nav-sign-in"
              >
                Sign In
              </Link>
            )}
            {isAuthenticated && user?.isProvider && (
              <Link 
                href="/provider-dashboard" 
                className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
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
              <Search className="h-5 w-5" />
            </Button>

            {isAuthenticated ? (
              <>


                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative"
                  onClick={() => setLocation("/notifications")}
                  data-testid="button-notifications"
                >
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs p-0 flex items-center justify-center">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </Badge>
                  )}
                </Button>



                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative h-10 w-10 rounded-full" data-testid="button-user-menu">
                      {user?.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={`${user.firstName} ${user.lastName}`}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
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
                    <DropdownMenuItem onClick={() => setIsProfileModalOpen(true)}>
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
                <div className="border-l border-gray-200 pl-4 ml-4">
                  <span className="text-sm text-gray-600 mr-2">Service provider?</span>
                  <Button
                    onClick={() => setLocation("/provider-onboarding")}
                    variant="outline"
                    className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white font-medium"
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
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
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
}