import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ModernServiceModal from "@/components/modern-service-modal";
import AnimatedServiceCard from "@/components/animated-service-card";
import CustomServiceContact from "@/components/custom-service-contact";
import { useState, useMemo } from "react";
import { 
  Home, 
  TreePine, 
  Droplet, 
  Zap, 
  ChefHat, 
  Coffee,
  Car,
  Heart,
  Baby,
  PaintBucket,
  Wrench,
  Shield,
  Star,
  Clock,
  ArrowRight,
  CheckCircle2,
  Truck,
  Users,
  Sparkles,
  Calendar,
  MapPin,
  Search,
  Filter
} from "lucide-react";

interface ServiceType {
  name: string;
  description: string;
  duration: string;
  priceRange: string;
}

interface Service {
  id: string;
  category: string;
  title: string;
  description: string;
  price: string;
  duration: string;
  popular?: boolean;
  urgent?: boolean;
  serviceTypes: string[];
  features: string[];
  icon: React.ComponentType<any>;
  gradient: string;
  bookingSteps: number;
}

interface ComprehensiveServicesProps {
  onServiceSelect: (serviceId: string) => void;
}

// Organize services by categories for better display
const indoorServices: Service[] = [
  // HOUSE CLEANING SERVICES
  {
    id: "cleaning",
    category: "Indoor Services",
    title: "House Cleaning",
    description: "Complete cleaning services from regular maintenance to deep cleaning with professional-grade equipment",
    price: "From R75/hour",
    duration: "2-6 hours",
    popular: true,
    serviceTypes: [
      "Regular House Cleaning (Weekly/Bi-weekly/Monthly)",
      "Deep Cleaning (Spring cleaning, move-in/move-out)", 
      "Office Cleaning (Daily/Weekly/Monthly contracts)",
      "Carpet & Upholstery Cleaning",
      "Window Cleaning (Interior/Exterior)",
      "Post-Construction Cleaning",
      "Event Cleanup Services"
    ],
    features: ["Professional equipment", "Eco-friendly products", "Insured cleaners", "Flexible scheduling"],
    icon: Home,
    gradient: "from-blue-500 to-cyan-500",
    bookingSteps: 5
  },

  // PLUMBING SERVICES
  {
    id: "plumbing",
    category: "Indoor Services",
    title: "Plumbing Services",
    description: "Professional plumbing solutions from emergency repairs to complete installations with certified plumbers",
    price: "From R120/hour",
    duration: "1-4 hours",
    urgent: true,
    serviceTypes: [
      "Emergency Repairs (24/7 availability)",
      "Installation Services (taps, toilets, showers)",
      "Drain Cleaning & Unblocking",
      "Leak Detection & Repair",
      "Water Heater Services",
      "Pipe Replacement & Maintenance",
      "Bathroom & Kitchen Plumbing"
    ],
    features: ["24/7 emergency service", "Licensed plumbers", "Parts included", "Insurance coverage"],
    icon: Droplet,
    gradient: "from-cyan-500 to-blue-600",
    bookingSteps: 4
  },

  // ELECTRICAL SERVICES
  {
    id: "electrical",
    category: "Indoor Services",
    title: "Electrical Services",
    description: "Safe and certified electrical work including installations, repairs, and compliance certificates",
    price: "From R150/hour",
    duration: "1-8 hours",
    urgent: true,
    serviceTypes: [
      "Emergency Electrical Repairs",
      "Installation (lights, outlets, ceiling fans)",
      "Electrical Inspections & Certificates",
      "DB Board & Circuit Repairs",
      "Smart Home Installation",
      "Solar Panel Installation & Maintenance",
      "Appliance Installation & Repair"
    ],
    features: ["Licensed electricians", "Safety certificates", "Emergency response", "Code compliance"],
    icon: Zap,
    gradient: "from-yellow-500 to-orange-500",
    bookingSteps: 4
  }
];

const outdoorServices: Service[] = [
  // GARDEN CARE
  {
    id: "garden-care",
    category: "Outdoor Services",
    title: "Garden Care",
    description: "Professional garden maintenance and landscaping services to keep your outdoor spaces beautiful",
    price: "From R90/hour",
    duration: "2-8 hours",
    serviceTypes: [
      "Regular Garden Maintenance",
      "Landscaping Design & Installation",
      "Tree Trimming & Removal",
      "Lawn Care & Mowing",
      "Irrigation System Installation",
      "Garden Cleanup Services",
      "Plant Care & Consultation"
    ],
    features: ["Garden specialists", "Professional tools", "Plant expertise", "Design consultation"],
    icon: TreePine,
    gradient: "from-green-600 to-emerald-600",
    bookingSteps: 4
  },

  // POOL CLEANING & MAINTENANCE
  {
    id: "pool-cleaning",
    category: "Outdoor Services",
    title: "Pool Cleaning & Maintenance",
    description: "Professional pool cleaning, chemical balancing, and maintenance services to keep your pool crystal clear and safe",
    price: "From R100/hour",
    duration: "1-4 hours",
    serviceTypes: [
      "Regular Pool Cleaning (Weekly/Bi-weekly)",
      "Chemical Balancing & Testing",
      "Filter Cleaning & Maintenance",
      "Pool Vacuuming & Brushing",
      "Green Pool Recovery",
      "Equipment Repair & Replacement",
      "Pool Opening & Closing Services"
    ],
    features: ["Certified technicians", "Chemical expertise", "Equipment maintenance", "Water testing"],
    icon: Droplet,
    gradient: "from-cyan-500 to-blue-600",
    bookingSteps: 4
  }
];

const specializedServices: Service[] = [
  // CHEF & CATERING SERVICES
  {
    id: "chef-catering",
    category: "Specialized Services",
    title: "Chef & Catering",
    description: "Professional chefs specializing in authentic African cuisine and international dishes for events and daily meals with complete dietary accommodation",
    price: "From R400/event",
    duration: "2-12 hours",
    popular: true,
    serviceTypes: [
      "🍽️ Personal Chef (daily/weekly meal prep)",
      "🎉 Event Catering (parties, corporate events, weddings)",
      "👨‍🍳 Private Cooking Classes (individual/group sessions)",
      "🌍 African Cuisine Specialists (South African, West African, East African, North African, Central African)",
      "🥗 Dietary Requirements (Halaal, Kosher, Vegan, Vegetarian, Keto, Gluten-Free, Diabetic-Friendly)",
      "🍷 Full Service Experience (waitering, bartending, setup)",
      "📋 Custom Menu Design & Consultation"
    ],
    features: [
      "🍖 Traditional African Cuisine Experts", 
      "🥘 Popular Menu Items: Braai, Bobotie, Potjiekos, Boerewors, Chakalaka, Pap & Morogo, Jollof Rice, Injera, Tagine",
      "✅ Dietary Accommodations: Halaal/Kosher certified chefs available",
      "🛒 Ingredient Sourcing: Fresh local ingredients, specialty African spices and imported items",
      "👥 Full Service Teams: Professional waitering, bartending, and event setup staff"
    ],
    icon: ChefHat,
    gradient: "from-green-500 to-emerald-500",
    bookingSteps: 4
  },

  // WAITERING SERVICES
  {
    id: "waitering",
    category: "Specialized Services", 
    title: "Waitering Services",
    description: "Professional event staff and waitering services for parties, corporate events, and special occasions",
    price: "From R85/hour",
    duration: "4-12 hours",
    serviceTypes: [
      "Event Waitering Staff",
      "Corporate Event Service",
      "Private Party Servers",
      "Bartending Services",
      "Event Setup & Cleanup",
      "Professional Table Service",
      "Cocktail Party Staff"
    ],
    features: ["Trained professionals", "Event specialists", "Bar service", "Setup assistance"],
    icon: Users,
    gradient: "from-indigo-500 to-purple-500",
    bookingSteps: 4
  },

  // MOVING SERVICES
  {
    id: "moving",
    category: "Specialized Services",
    title: "Moving Services",
    description: "Complete moving solutions from local relocations to long-distance moves with professional teams",
    price: "From R600/day",
    duration: "4-12 hours",
    serviceTypes: [
      "Local Moving (same city)",
      "Long-distance Moving (intercity/interstate)",
      "Office Relocation",
      "Furniture Moving & Assembly",
      "Packing & Unpacking Services",
      "Storage Solutions",
      "Piano & Specialty Item Moving"
    ],
    features: ["Professional movers", "Insured service", "Packing materials", "Storage options"],
    icon: Truck,
    gradient: "from-purple-500 to-pink-500",
    bookingSteps: 5
  },

  // AU PAIR SERVICES
  {
    id: "au-pair",
    category: "Specialized Services",
    title: "Au Pair Services",
    description: "Trusted childcare providers offering flexible care solutions from occasional babysitting to live-in arrangements",
    price: "From R65/hour",
    duration: "4 hours - 12 months",
    serviceTypes: [
      "Live-in Au Pair (6-12 month contracts)",
      "Part-time Childcare",
      "After-school Care",
      "Weekend & Holiday Care",
      "Overnight Babysitting",
      "Educational Support & Tutoring",
      "Activity Planning & Outings"
    ],
    features: ["Background checked", "Experienced caregivers", "Flexible schedules", "Educational support"],
    icon: Baby,
    gradient: "from-pink-500 to-rose-500",
    bookingSteps: 4
  }
];

// Combine all services for compatibility
const services: Service[] = [...indoorServices, ...outdoorServices, ...specializedServices];

export default function ComprehensiveServices({ onServiceSelect }: ComprehensiveServicesProps) {
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Categories for filtering
  const categories = ["All", "Indoor Services", "Outdoor Services", "Specialized Services"];

  // Filter services based on search term and category
  const filteredServices = useMemo(() => {
    let filtered = services;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(service => 
        service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.serviceTypes.some(type => type.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return filtered;
  }, [searchTerm, selectedCategory]);

  // Group filtered services by category for display
  const filteredIndoorServices = filteredServices.filter(s => s.category === "Indoor Services");
  const filteredOutdoorServices = filteredServices.filter(s => s.category === "Outdoor Services");
  const filteredSpecializedServices = filteredServices.filter(s => s.category === "Specialized Services");

  return (
    <section className="py-16 lg:py-24" style={{ backgroundColor: '#EED1C4' }} data-testid="comprehensive-services-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="text-white px-4 py-2 text-sm font-semibold border-0 mb-4" style={{ backgroundColor: '#C56B86' }}>
            <Sparkles className="h-4 w-4 mr-2" />
            Complete Home Services
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6" style={{ color: '#44062D' }}>
            Everything your home needs,
            <span className="block" style={{ color: '#C56B86' }}>
              all in one platform
            </span>
          </h2>
          <p className="text-xl max-w-3xl mx-auto leading-relaxed" style={{ color: '#3C0920' }}>
            From emergency repairs to regular maintenance, event catering to childcare - 
            professional services delivered by verified South African specialists.
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-12 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
          <div className="relative flex-1 max-w-md mx-auto sm:mx-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search services, features, or descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12"
              data-testid="search-services-homepage"
            />
          </div>
          
          <div className="flex space-x-2 justify-center sm:justify-start">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                data-testid={`filter-${category.toLowerCase().replace(' ', '-')}`}
                className="h-12"
              >
                <Filter className="h-3 w-3 mr-1" />
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Results Summary */}
        {searchTerm && (
          <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-blue-800">
              <strong>{filteredServices.length}</strong> service{filteredServices.length !== 1 ? 's' : ''} found for "{searchTerm}"
              {selectedCategory !== "All" && ` in ${selectedCategory}`}
            </p>
          </div>
        )}

        {/* Indoor Services Section */}
        <div className="mb-16">
          <div className="flex items-center mb-8">
            <Home className="h-8 w-8 mr-3 text-blue-600" />
            <h3 className="text-3xl font-bold text-gray-900">Indoor Services</h3>
            <Badge className="ml-4 bg-blue-100 text-blue-700 border-blue-200">
              {filteredIndoorServices.length} services
            </Badge>
          </div>
          {filteredIndoorServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredIndoorServices.map((service, index) => (
              <AnimatedServiceCard
                key={service.id}
                service={service}
                index={index}
                theme="blue"
                onServiceSelect={onServiceSelect}
                onModalOpen={(id) => {
                  setSelectedServiceId(id);
                  setShowServiceModal(true);
                }}
              />
              ))}
            </div>
          ) : (
            <Card><CardContent className="p-6 text-center text-gray-600">No Indoor services match your search/filter.</CardContent></Card>
          )}
        </div>

        {/* Outdoor Services Section */}
        <div className="mb-16">
          <div className="flex items-center mb-8">
            <TreePine className="h-8 w-8 mr-3 text-green-600" />
            <h3 className="text-3xl font-bold text-gray-900">Outdoor Services</h3>
            <Badge className="ml-4 bg-green-100 text-green-700 border-green-200">
              {filteredOutdoorServices.length} services
            </Badge>
          </div>
          {filteredOutdoorServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOutdoorServices.map((service, index) => (
              <AnimatedServiceCard
                key={service.id}
                service={service}
                index={index}
                theme="green"
                onServiceSelect={onServiceSelect}
                onModalOpen={(id) => {
                  setSelectedServiceId(id);
                  setShowServiceModal(true);
                }}
              />
              ))}
            </div>
          ) : (
            <Card><CardContent className="p-6 text-center text-gray-600">No Outdoor services match your search/filter.</CardContent></Card>
          )}
        </div>

        {/* Specialized Services Section */}
        <div className="mb-16">
          <div className="flex items-center mb-8">
            <Star className="h-8 w-8 mr-3 text-purple-600" />
            <h3 className="text-3xl font-bold text-gray-900">Specialized Services</h3>
            <Badge className="ml-4 bg-purple-100 text-purple-700 border-purple-200">
              {filteredSpecializedServices.length} services
            </Badge>
          </div>
          {filteredSpecializedServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredSpecializedServices.map((service, index) => (
              <AnimatedServiceCard
                key={service.id}
                service={service}
                index={index}
                theme="purple"
                onServiceSelect={onServiceSelect}
                onModalOpen={(id) => {
                  setSelectedServiceId(id);
                  setShowServiceModal(true);
                }}
              />
              ))}
            </div>
          ) : (
            <Card><CardContent className="p-6 text-center text-gray-600">No Specialized services match your search/filter.</CardContent></Card>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="text-center rounded-3xl p-8 lg:p-12 text-white" style={{ backgroundColor: '#44062D' }}>
          <h3 className="text-3xl font-bold mb-4">
            Need a custom service solution?
          </h3>
          <p className="text-lg mb-6 max-w-2xl mx-auto" style={{ color: '#EED1C4' }}>
            Our platform connects you with verified professionals for any home service need. 
            Book multiple services together for better coordination and pricing.
          </p>
          <CustomServiceContact />
        </div>
      </div>

      {/* Modern Service Modal */}
      <ModernServiceModal
        isOpen={showServiceModal}
        onClose={() => setShowServiceModal(false)}
        serviceId={selectedServiceId}
        onBookingComplete={(bookingData) => {
          console.log("Booking completed:", bookingData);
          setShowServiceModal(false);
        }}
      />
    </section>
  );
}
