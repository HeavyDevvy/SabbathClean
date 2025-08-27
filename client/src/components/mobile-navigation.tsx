import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Home, 
  Calendar, 
  Users, 
  User, 
  Menu, 
  Bell, 
  Settings,
  ChefHat,
  Briefcase,
  GraduationCap,
  X
} from "lucide-react";

export default function MobileNavigation() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems = [
    { path: "/", icon: Home, label: "Home", badge: null },
    { path: "/booking", icon: Calendar, label: "Book Service", badge: null },
    { path: "/providers", icon: Users, label: "Providers", badge: null },
    { path: "/profile", icon: User, label: "Profile", badge: null },
    { path: "/notifications", icon: Bell, label: "Notifications", badge: "New" },
    { path: "/provider-onboarding", icon: Briefcase, label: "Become Provider", badge: null },
    { path: "/provider-training", icon: GraduationCap, label: "Training", badge: null },
  ];

  const currentPath = location;

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-4 gap-1 p-2">
          <Link href="/" className={`flex flex-col items-center p-2 rounded-lg ${currentPath === '/' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}>
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          
          <Link href="/booking" className={`flex flex-col items-center p-2 rounded-lg ${currentPath === '/booking' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}>
            <Calendar className="h-5 w-5" />
            <span className="text-xs mt-1">Book</span>
          </Link>
          
          <Link href="/providers" className={`flex flex-col items-center p-2 rounded-lg ${currentPath === '/providers' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}>
            <Users className="h-5 w-5" />
            <span className="text-xs mt-1">Providers</span>
          </Link>
          
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center p-2 rounded-lg text-gray-600">
                <Menu className="h-5 w-5" />
                <span className="text-xs mt-1">More</span>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Berry Events</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <nav className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPath === item.path;
                  
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                      data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <div className="flex items-center">
                        <Icon className="h-5 w-5 mr-3" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">App Features</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Offline booking drafts
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    Push notifications
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                    Quick home shortcuts
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Navigation Header */}
      <div className="hidden md:block fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <ChefHat className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">Berry Events</span>
            </Link>

            <nav className="hidden md:flex space-x-8">
              {navigationItems.slice(0, 5).map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;
                
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                    data-testid={`desktop-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                    {item.badge && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center space-x-4">
              <Link href="/notifications">
                <Button variant="outline" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-red-500">
                    3
                  </Badge>
                </Button>
              </Link>
              
              <Link href="/profile">
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for fixed navigation */}
      <div className="h-16 hidden md:block" />
      <div className="h-20 md:hidden" />
    </>
  );
}