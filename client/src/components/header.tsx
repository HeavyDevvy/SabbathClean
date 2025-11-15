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
    <header className="bg-card shadow-sm sticky top-0 z-50 border-b border-border">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-transparent">
              <img src={berryLogo} alt="Berry Events Logo" className="w-full h-full object-cover" />
            </div>
            <div className="hidden sm:block">
              <div className="text-2xl font-bold text-foreground">Berry Events</div>
              <div className="text-xs text-foreground/60">All your Home Services In One</div>
            </div>
          </Link>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link href="/providers" className="text-foreground/70 hover:text-foreground transition-colors duration-200 text-sm font-medium" data-testid="link-providers">
                Our Experts
              </Link>
              <a href="#pricing" className="text-foreground/70 hover:text-foreground transition-colors duration-200 text-sm font-medium" data-testid="link-pricing">
                Pricing
              </a>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/provider-onboarding" className="text-foreground/80 hover:text-foreground transition-colors duration-200 text-sm font-medium" data-testid="link-become-provider">
              Become a Provider
            </Link>
            
            {/* Dynamic Authentication UI */}
            {!isLoading && (
              user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-foreground/70 hover:text-foreground" data-testid="button-user-menu">
                      <span className="hidden sm:inline mr-2">
                        Hello, {user.firstName || 'User'}
                      </span>
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <Link href="/profile">
                      <DropdownMenuItem data-testid="link-profile-settings">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Profile Settings</span>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="text-destructive"
                      data-testid="button-logout"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/auth">
                  <Button variant="ghost" className="text-foreground/70 hover:text-foreground" data-testid="button-signin">
                    <span className="hidden sm:inline">Sign In</span>
                    <User className="h-4 w-4 sm:hidden" />
                  </Button>
                </Link>
              )
            )}
            
            <Button 
              onClick={onBookingClick}
              className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl shadow-sm"
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
