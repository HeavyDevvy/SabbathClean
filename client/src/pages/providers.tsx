import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import HomeHeader from "@/components/home-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Star, MapPin, Clock, Shield, Phone, MessageCircle,
  Filter, Search, ArrowRight, Check
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { ServiceProvider, Service } from "@shared/schema";

export default function ProvidersPage() {
  const [, setLocation] = useLocation();
  const [filters, setFilters] = useState({
    serviceId: '',
    location: '',
    verified: true
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch providers
  const { data: providers = [], isLoading } = useQuery<ServiceProvider[]>({
    queryKey: ["/api/providers", filters],
    queryFn: async (): Promise<ServiceProvider[]> => {
      const params = new URLSearchParams();
      if (filters.serviceId) params.append('serviceId', filters.serviceId);
      if (filters.location) params.append('location', filters.location);
      if (filters.verified) params.append('verified', 'true');
      
      const response = await fetch(`/api/providers?${params}`);
      return response.json();
    }
  });

  // Fetch services for filter
  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const filteredProviders = providers.filter((provider: ServiceProvider) => {
    const fullName = `${provider.user?.firstName} ${provider.user?.lastName}`.toLowerCase();
    const businessName = provider.businessName?.toLowerCase() || '';
    const bio = provider.bio.toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return fullName.includes(query) || businessName.includes(query) || bio.includes(query);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <HomeHeader isAuthenticated={true} onBookService={() => setLocation('/book')} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Find Professional Service Providers
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Browse our network of verified, insured professionals. All providers are background-checked 
            and rated by our community for your peace of mind.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Name, business, or service..."
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                      data-testid="search-providers"
                    />
                  </div>
                </div>

                {/* Service Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Type
                  </label>
                  <select
                    value={filters.serviceId}
                    onChange={(e) => setFilters(prev => ({ ...prev, serviceId: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    data-testid="filter-service"
                  >
                    <option value="">All Services</option>
                    {services.map((service: any) => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={filters.location}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Enter city or area..."
                    className="w-full p-2 border border-gray-300 rounded-md"
                    data-testid="filter-location"
                  />
                </div>

                {/* Verification Filter */}
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.verified}
                      onChange={(e) => setFilters(prev => ({ ...prev, verified: e.target.checked }))}
                      className="w-4 h-4 text-blue-600"
                      data-testid="filter-verified"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Verified providers only
                    </span>
                  </label>
                </div>

                {/* Clear Filters */}
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setFilters({ serviceId: '', location: '', verified: true });
                    setSearchQuery('');
                  }}
                  className="w-full"
                  data-testid="clear-filters"
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Provider Grid */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {filteredProviders.length} Providers Found
                </h2>
                <p className="text-gray-600 mt-1">
                  Showing providers in your area
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => setLocation('/providers/join')}
                  data-testid="become-provider-cta"
                >
                  Become a Provider
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="text-center pb-4">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded mx-auto w-24 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mx-auto w-32"></div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-10 bg-gray-200 rounded w-full"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Providers Grid */}
            {!isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProviders.map((provider: any) => (
                  <Card key={provider.id} className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader className="text-center pb-4">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
                        <img 
                          src={provider.profileImages[0] || "/api/placeholder/80/80"}
                          alt={`${provider.user?.firstName} ${provider.user?.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardTitle className="text-lg">
                        {provider.user?.firstName} {provider.user?.lastName}
                      </CardTitle>
                      <CardDescription>
                        {provider.businessName || 'Independent Professional'}
                      </CardDescription>

                      {/* Verification Badge */}
                      {provider.isVerified && (
                        <div className="inline-flex items-center bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                          <Check className="w-3 h-3 mr-1" />
                          Verified & Insured
                        </div>
                      )}
                    </CardHeader>

                    <CardContent>
                      {/* Rating */}
                      <div className="flex items-center justify-center mb-4">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < Math.floor(provider.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                          <span className="ml-2 text-sm text-gray-600">
                            {provider.rating} ({provider.totalReviews} reviews)
                          </span>
                        </div>
                      </div>

                      {/* Key Stats */}
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center justify-center">
                          <Shield className="w-4 h-4 mr-2" />
                          <span>{provider.completedJobs} jobs completed</span>
                        </div>
                        <div className="flex items-center justify-center">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>{provider.responseTime} min response time</span>
                        </div>
                        <div className="flex items-center justify-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{provider.serviceAreas.slice(0, 2).join(', ')}</span>
                        </div>
                      </div>

                      {/* Services */}
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1 justify-center">
                          {provider.services.slice(0, 3).map((serviceId: string) => (
                            <span 
                              key={serviceId}
                              className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full"
                            >
                              {serviceId.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                            </span>
                          ))}
                          {provider.services.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{provider.services.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bio */}
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2 text-center">
                        {provider.bio}
                      </p>

                      {/* Starting Rate */}
                      <div className="text-center mb-4">
                        <div className="text-lg font-bold text-blue-600">
                          Starting from {formatCurrency(Math.min(...Object.values(provider.hourlyRates) as number[]))}
                        </div>
                        <div className="text-xs text-gray-500">per hour</div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        <Button 
                          className="w-full"
                          onClick={() => setLocation(`/providers/${provider.id}`)}
                          data-testid={`view-provider-${provider.id}`}
                        >
                          View Profile & Book
                        </Button>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            data-testid={`contact-provider-${provider.id}`}
                          >
                            <MessageCircle className="w-4 h-4 mr-1" />
                            Message
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            data-testid={`call-provider-${provider.id}`}
                          >
                            <Phone className="w-4 h-4 mr-1" />
                            Call
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* No Results */}
            {!isLoading && filteredProviders.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No providers found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search criteria or location to find more providers.
                </p>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setFilters({ serviceId: '', location: '', verified: true });
                    setSearchQuery('');
                  }}
                  data-testid="reset-search"
                >
                  Reset Search
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Become a Provider CTA */}
        <section className="mt-16 bg-blue-600 rounded-2xl p-8 lg:p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Join Our Provider Network
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Are you a skilled professional looking to grow your business? 
            Join thousands of providers earning more with flexible schedules.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="secondary"
              size="lg"
              onClick={() => setLocation('/providers/join')}
              data-testid="join-provider-network"
            >
              Apply to Become a Provider
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-blue-600"
              data-testid="learn-more-provider"
            >
              Learn More
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 text-blue-100">
            <div>
              <div className="text-3xl font-bold text-white mb-2">R15,000+</div>
              <div>Average monthly earnings</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">85%</div>
              <div>Provider commission rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">4.8★</div>
              <div>Average provider rating</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}