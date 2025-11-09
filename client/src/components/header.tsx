import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, Plus, Sparkles, LogOut, Shield, Settings } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { useToast } from "@/hooks/use-toast";
import berryLogo from "@assets/berry-events-new-logo.jpg";

interface HeaderProps {
  onBookingClick?: () => void;
}

export default function Header({ onBookingClick }: HeaderProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Check authentication status
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: async () => {
      try {
        return await authClient.getCurrentUser();
      } catch (error) {
        return null;
      }
    },
    retry: false
  });

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

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <div className="w-10 h-10 rounded-lg overflow-hidden">
              <img src={berryLogo} alt="Berry Events Logo" className="w-full h-full object-contain" />
            </div>
            <span className="ml-3 text-xl font-bold text-gray-900">Berry Events</span>
            <span className="ml-2 text-sm text-gray-600">- All your Home Services In One</span>
          </Link>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/providers" className="text-neutral hover:text-primary transition-colors duration-200" data-testid="link-providers">
                Our Home Experts
              </Link>
              <Link href="/provider-training" className="text-neutral hover:text-primary transition-colors duration-200" data-testid="link-training">
                Training Center
              </Link>
              <a href="#pricing" className="text-neutral hover:text-primary transition-colors duration-200" data-testid="link-pricing">
                Pricing
              </a>
              {/* Admin Portal - Always accessible */}
              <Link href="/admin" className="text-purple-600 hover:text-purple-700 transition-colors duration-200 text-sm font-medium" data-testid="link-admin-portal">
                <Shield className="h-4 w-4 inline mr-1" />
                Admin Portal
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/provider-onboarding" className="text-primary hover:text-primary/80 transition-colors duration-200 text-sm font-medium" data-testid="link-become-provider">
              Become a Provider
            </Link>
            
            {/* Dynamic Authentication UI */}
            {!isLoading && (
              user ? (
                // User is logged in - Show user menu with logout
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-gray-600 hover:text-gray-900" data-testid="button-user-menu">
                      <span className="hidden sm:inline mr-2">
                        Hello, {user.firstName || 'User'}
                      </span>
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Profile Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="text-red-600"
                      data-testid="button-logout"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                // User is not logged in - Show Sign In button
                <Link href="/auth">
                  <Button variant="ghost" className="text-gray-600 hover:text-gray-900" data-testid="button-signin">
                    <span className="hidden sm:inline">Sign In</span>
                    <User className="h-4 w-4 sm:hidden" />
                  </Button>
                </Link>
              )
            )}
            
            <Button 
              onClick={onBookingClick}
              className="bg-blue-600 hover:bg-blue-700 text-white"
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
