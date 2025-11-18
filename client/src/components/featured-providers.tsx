import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MapPin, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { ServiceProvider } from "@shared/schema";
import { OptimizedImage } from "@/components/ui/optimized-image";

export default function FeaturedProviders() {
  const { data: providers, isLoading } = useQuery<ServiceProvider[]>({
    queryKey: ["/api/providers"],
  });

  if (isLoading) {
    return (
      <section id="providers" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="mt-4 text-neutral">Loading providers...</p>
          </div>
        </div>
      </section>
    );
  }

  const featuredProviders = providers?.slice(0, 4) || [];

  return (
    <section id="providers" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Meet Our Verified Professionals</h2>
          <p className="mt-4 text-lg text-neutral">Background-checked, insured, and highly-rated service providers</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProviders.map((provider) => (
            <Card key={provider.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300" data-testid={`card-featured-provider-${provider.id}`}>
              <OptimizedImage
                src={provider.profileImage || "https://images.unsplash.com/photo-1494790108755-2616b612b588?w=300"} 
                alt="Professional service provider"
                className="w-full h-48 object-cover"
                containerClassName="w-full h-48"
              />
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">Provider {provider.id.slice(-1)}</h3>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-accent fill-current" />
                    <span className="ml-1 text-sm font-medium">{provider.rating}</span>
                  </div>
                </div>
                <p className="text-neutral text-sm mb-3">
                  {provider.servicesOffered[0]?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Specialist
                </p>
                <div className="flex items-center text-xs text-neutral mb-3">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>Available in {provider.location}</span>
                </div>
                <div className="flex items-center text-xs text-secondary mb-3">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  <span>Background Verified</span>
                </div>
                <p className="text-xs text-neutral">{provider.bio}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/providers">
            <Button 
              variant="outline"
              className="border-2 border-primary text-primary hover:bg-primary hover:text-white"
              data-testid="button-view-all-professionals"
            >
              View All Professionals
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
