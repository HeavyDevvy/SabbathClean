import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Router, Route, Switch } from "wouter";
import HomePage from "@/pages/home";
import BookingPage from "@/pages/booking";
import ProvidersPage from "@/pages/providers";
import DashboardPage from "@/pages/dashboard";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/book" component={BookingPage} />
          <Route path="/book/:serviceId" component={BookingPage} />
          <Route path="/providers" component={ProvidersPage} />
          <Route path="/dashboard" component={DashboardPage} />
          <Route path="/dashboard/:section" component={DashboardPage} />
          <Route>
            {/* 404 Page */}
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
                <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
                <a href="/" className="text-blue-600 hover:text-blue-800 font-medium">
                  Go back home
                </a>
              </div>
            </div>
          </Route>
        </Switch>
      </Router>
    </QueryClientProvider>
  );
}

export default App;