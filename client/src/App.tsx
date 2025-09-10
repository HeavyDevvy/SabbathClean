import { Switch, Route } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import EnhancedHome from "@/pages/enhanced-home";
import MinimalistHome from "@/pages/minimalist-home";
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
import ServicesPage from "@/pages/services";
import PaymentPage from "@/pages/payment";
import MobileApp from "@/pages/mobile-app";
import TrackingPage from "@/pages/tracking";
import Contact from "@/pages/contact";
import Support from "@/pages/support";

function Router() {
  return (
    <Switch>
      <Route path="/" component={EnhancedHome} />
      <Route path="/minimalist" component={MinimalistHome} />
      <Route path="/old-home" component={Home} />
      <Route path="/auth" component={Auth} />
      <Route path="/booking" component={Booking} />
      <Route path="/booking-confirmation" component={BookingConfirmation} />
      <Route path="/bookings" component={Bookings} />
      <Route path="/services" component={ServicesPage} />
      <Route path="/payment" component={PaymentPage} />
      <Route path="/providers" component={Providers} />
      <Route path="/provider-onboarding" component={EnhancedProviderOnboarding} />
      <Route path="/provider-training" component={ProviderTraining} />
      <Route path="/provider-dashboard" component={ProviderDashboard} />
      <Route path="/profile" component={Profile} />
      <Route path="/notifications" component={NotificationSettings} />
      <Route path="/mobile-app" component={MobileApp} />
      <Route path="/tracking" component={TrackingPage} />
      <Route path="/tracking/:bookingId" component={TrackingPage} />
      <Route path="/contact" component={Contact} />
      <Route path="/support" component={Support} />
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
