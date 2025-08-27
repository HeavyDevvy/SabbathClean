import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import EnhancedHeader from "@/components/enhanced-header";
import ModernServiceModal from "@/components/modern-service-modal";
import { 
  Home as HomeIcon, 
  Wrench, 
  Zap, 
  ChefHat, 
  Truck, 
  Baby, 
  Scissors, 
  Users,
  Search,
  Filter,
  Star,
  Clock,
  MapPin
} from "lucide-react";

const allServices = [
  {
    id: "cleaning",
    title: "House Cleaning",
    description: "Professional cleaning services for your home",
    price: "From R75/hour",
    rating: 4.8,
    providers: 45,
    icon: HomeIcon,
    category: "Indoor",
    tags: ["Regular", "Deep Clean", "Eco-Friendly"]
  },
  {
    id: "plumbing",
    title: "Plumbing Services", 
    description: "Expert plumbing repairs and installations",
    price: "From R120/hour",
    rating: 4.7,
    providers: 32,
    icon: Wrench,
    category: "Maintenance",
    tags: ["Emergency", "Repairs", "Installation"]
  },
  {
    id: "electrical",
    title: "Electrical Services",
    description: "Certified electrical work and repairs",
    price: "From R150/hour", 
    rating: 4.9,
    providers: 28,
    icon: Zap,
    category: "Maintenance",
    tags: ["Certified", "Installation", "Repairs"]
  },
  {
    id: "chef-catering",
    title: "Chef & Catering",
    description: "Professional chefs for events and daily meals",
    price: "From R400/event",
    rating: 4.8,
    providers: 18,
    icon: ChefHat,
    category: "Specialized",
    tags: ["African Cuisine", "Events", "Halaal"]
  },
  {
    id: "moving",
    title: "Moving Services",
    description: "Professional moving and relocation services",
    price: "From R600/day",
    rating: 4.6,
    providers: 15,
    icon: Truck,
    category: "Specialized",
    tags: ["Local", "Long Distance", "Packing"]
  },
  {
    id: "au-pair",
    title: "Au Pair Services",
    description: "Trusted childcare and au pair services",
    price: "From R65/hour",
    rating: 4.9,
    providers: 22,
    icon: Baby,
    category: "Specialized", 
    tags: ["Childcare", "Live-in", "Babysitting"]
  },
  {
    id: "garden-care",
    title: "Garden Care",
    description: "Professional garden maintenance and landscaping",
    price: "From R90/hour",
    rating: 4.7,
    providers: 20,
    icon: Scissors,
    category: "Outdoor",
    tags: ["Landscaping", "Maintenance", "Design"]
  },
  {
    id: "waitering",
    title: "Waitering Services",
    description: "Professional event staff and waitering",
    price: "From R85/hour",
    rating: 4.8,
    providers: 25,
    icon: Users,
    category: "Specialized",
    tags: ["Events", "Corporate", "Parties"]
  }
];

const categories = ["All", "Indoor", "Outdoor", "Maintenance", "Specialized"];

export default function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState("");

  const filteredServices = allServices.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleBookService = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setIsBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <EnhancedHeader onBookingClick={() => setIsBookingModalOpen(true)} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Professional Home Services
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Browse our comprehensive range of home services provided by verified professionals
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="search-services"
            />
          </div>
          
          <div className="flex space-x-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                data-testid={`filter-${category.toLowerCase()}`}
              >
                <Filter className="h-3 w-3 mr-1" />
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredServices.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <service.icon className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="secondary">{service.category}</Badge>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{service.description}</p>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-yellow-500">
                      <Star className="h-4 w-4 fill-current mr-1" />
                      <span className="font-medium">{service.rating}</span>
                    </div>
                    <div className="text-gray-500">
                      {service.providers} providers
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {service.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-green-600 font-semibold">
                    {service.price}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleBookService(service.id)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white text-base font-semibold"
                    data-testid={`book-${service.id}`}
                  >
                    Book Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No services found matching your criteria.</p>
          </div>
        )}
      </div>

      <ModernServiceModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        serviceId={selectedServiceId || "house-cleaning"}
        onBookingComplete={(bookingData) => {
          console.log("Booking completed:", bookingData);
          setIsBookingModalOpen(false);
          setSelectedServiceId(""); // Clear selected service to prevent card interference
        }}
      />
    </div>
  );
}