import { Switch, Route } from "wouter";
import { lazy, Suspense } from "react";
import React from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";

// Eagerly load critical pages
import EnhancedHome from "@/pages/enhanced-home";
import Auth from "@/pages/auth";
import Profile from "@/pages/profile";
import CartCheckout from "@/pages/cart-checkout";
import OrderConfirmation from "@/pages/order-confirmation";
import NotFound from "@/pages/not-found";

// Lazy load less frequently accessed pages
const Home = lazy(() => import("@/pages/home"));
const MinimalistHome = lazy(() => import("@/pages/minimalist-home"));
const Booking = lazy(() => import("@/pages/booking"));
const BookingConfirmation = lazy(() => import("@/pages/booking-confirmation"));
const Providers = lazy(() => import("@/pages/providers"));
const EnhancedProviderOnboarding = lazy(() => import("@/pages/enhanced-provider-onboarding"));
const ProviderTraining = lazy(() => import("@/pages/provider-training"));
import ProviderDashboard from "@/pages/provider-dashboard";
const Offline = lazy(() => import("@/pages/offline"));
const Bookings = lazy(() => import("@/pages/bookings"));
const NotificationSettings = lazy(() => import("@/components/notification-settings"));
const ServicesPage = lazy(() => import("@/pages/services"));
const PaymentPage = lazy(() => import("@/pages/payment"));
const MobileApp = lazy(() => import("@/pages/mobile-app"));
const TrackingPage = lazy(() => import("@/pages/tracking"));
const Contact = lazy(() => import("@/pages/contact"));
const Support = lazy(() => import("@/pages/support"));
const Help = lazy(() => import("@/pages/help"));
const About = lazy(() => import("@/pages/about"));
const Safety = lazy(() => import("@/pages/safety"));
const Feedback = lazy(() => import("@/pages/feedback"));
const Careers = lazy(() => import("@/pages/careers"));
const Press = lazy(() => import("@/pages/press"));
const ProviderSupport = lazy(() => import("@/pages/provider-support"));
const BerryStars = lazy(() => import("@/pages/berry-stars"));
const ProviderEarnings = lazy(() => import("@/pages/provider-earnings"));
const Quote = lazy(() => import("@/pages/quote"));
const AdminPortal = lazy(() => import("@/pages/admin-portal"));
const VerifyEmail = lazy(() => import("@/pages/verify-email"));
const ResetPassword = lazy(() => import("@/pages/reset-password"));
const Wallet = lazy(() => import("@/pages/wallet"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#44062D]"></div>
  </div>
);

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={EnhancedHome} />
        <Route path="/minimalist" component={MinimalistHome} />
        <Route path="/cart-checkout" component={CartCheckout} />
        <Route path="/order-confirmation/:orderId" component={OrderConfirmation} />
        <Route path="/old-home" component={Home} />
        <Route path="/auth" component={Auth} />
        <Route path="/booking" component={Booking} />
        <Route path="/booking-confirmation" component={BookingConfirmation} />
        <Route path="/bookings" component={Bookings} />
        <Route path="/services" component={ServicesPage} />
        <Route path="/quote" component={Quote} />
        <Route path="/payment" component={PaymentPage} />
        <Route path="/admin" component={AdminPortal} />
        <Route path="/admin-portal" component={AdminPortal} />
        <Route path="/verify-email" component={VerifyEmail} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/providers" component={Providers} />
        <Route path="/provider-onboarding" component={EnhancedProviderOnboarding} />
        <Route path="/provider-training" component={ProviderTraining} />
        <Route path="/provider-dashboard" component={ProviderDashboard} />
        <Route path="/profile" component={Profile} />
        <Route path="/wallet" component={Wallet} />
        <Route path="/notifications" component={NotificationSettings} />
        <Route path="/mobile-app" component={MobileApp} />
        <Route path="/tracking" component={TrackingPage} />
        <Route path="/tracking/:bookingId" component={TrackingPage} />
        <Route path="/contact" component={Contact} />
        <Route path="/support" component={Support} />
        <Route path="/help" component={Help} />
        <Route path="/about" component={About} />
        <Route path="/safety" component={Safety} />
        <Route path="/feedback" component={Feedback} />
        <Route path="/careers" component={Careers} />
        <Route path="/press" component={Press} />
        <Route path="/provider-support" component={ProviderSupport} />
        <Route path="/berry-stars" component={BerryStars} />
        <Route path="/provider-earnings" component={ProviderEarnings} />
        <Route path="/offline" component={Offline} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <ErrorBoundary>
                <Router />
              </ErrorBoundary>
            </TooltipProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }>{
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {}
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-6">
          <div className="max-w-md text-center space-y-4">
            <h1 className="text-2xl font-semibold">Something went wrong</h1>
            <p className="text-gray-600">Please refresh the page or navigate back to the home page.</p>
            <a href="/" className="inline-block px-4 py-2 rounded bg-[#44062D] text-white">Go Home</a>
          </div>
        </div>
      );
    }
    return this.props.children as any;
  }
}

export default App;
