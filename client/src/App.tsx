import { Switch, Route } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Auth from "@/pages/auth";
import Booking from "@/pages/booking";
import BookingConfirmation from "@/pages/booking-confirmation";
import Providers from "@/pages/providers";
import Profile from "@/pages/profile";
import ProviderOnboarding from "@/pages/provider-onboarding";
import EnhancedProviderOnboarding from "@/pages/enhanced-provider-onboarding";
import ProviderTraining from "@/pages/provider-training";
import ProviderDashboard from "@/pages/provider-dashboard";
import NotFound from "@/pages/not-found";
import Offline from "@/pages/offline";
import Bookings from "@/pages/bookings";
import NotificationSettings from "@/components/notification-settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={Auth} />
      <Route path="/booking" component={Booking} />
      <Route path="/booking-confirmation" component={BookingConfirmation} />
      <Route path="/bookings" component={Bookings} />
      <Route path="/providers" component={Providers} />
      <Route path="/provider-onboarding" component={EnhancedProviderOnboarding} />
      <Route path="/provider-training" component={ProviderTraining} />
      <Route path="/provider-dashboard" component={ProviderDashboard} />
      <Route path="/profile" component={Profile} />
      <Route path="/notifications" component={NotificationSettings} />
      <Route path="/offline" component={Offline} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
