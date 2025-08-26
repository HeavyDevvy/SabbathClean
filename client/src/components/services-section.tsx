import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Home, Leaf, Shirt, Wrench, Heart, Users, 
  Clock, MapPin, Star, Shield 
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Service } from "@shared/schema";

interface ServicesSectionProps {
  onSelectService?: (serviceId: string) => void;
}

export default function ServicesSection({ onSelectService }: ServicesSectionProps) {
  // Mock services data - in real app, this would come from API
  const services: Service[] = [
    {
      id: 'house-cleaning',
      name: 'House Cleaning',
      description: 'Professional house cleaning service for homes and apartments',
      category: 'indoor',
      subcategory: 'cleaning',
      duration: 120,
      basePrice: 350,
      priceUnit: 'job',
      requirements: ['Access to property', 'Cleaning supplies available'],
      addons: [
        { id: 'deep-clean', name: 'Deep Clean', description: 'Extra thorough cleaning', price: 100 },
        { id: 'windows', name: 'Window Cleaning', description: 'Interior window cleaning', price: 50 }
      ],
      isActive: true,
      icon: 'home'
    },
    {
      id: 'garden-maintenance',
      name: 'Garden Maintenance', 
      description: 'Complete garden care including pruning, weeding, and lawn care',
      category: 'outdoor',
      subcategory: 'gardening',
      duration: 180,
      basePrice: 400,
      priceUnit: 'job',
      requirements: ['Garden tools provided', 'Water access'],
      addons: [
        { id: 'pruning', name: 'Tree Pruning', description: 'Professional tree pruning', price: 150 },
        { id: 'fertilizing', name: 'Fertilizing', description: 'Garden fertilization', price: 80 }
      ],
      isActive: true,
      icon: 'leaf'
    },
    {
      id: 'laundry-ironing',
      name: 'Laundry & Ironing',
      description: 'Professional laundry washing, drying, and ironing services',
      category: 'indoor',
      subcategory: 'laundry',
      duration: 150,
      basePrice: 200,
      priceUnit: 'job',
      requirements: ['Washing machine available', 'Iron and board provided'],
      addons: [
        { id: 'dry-cleaning', name: 'Dry Clean Items', description: 'Special care items', price: 120 },
        { id: 'folding', name: 'Professional Folding', description: 'Expert folding service', price: 30 }
      ],
      isActive: true,
      icon: 'shirt'
    },
    {
      id: 'plumbing-repairs',
      name: 'Plumbing Repairs',
      description: 'Professional plumbing services for leaks, installations, and repairs',
      category: 'maintenance',
      subcategory: 'plumbing',
      duration: 120,
      basePrice: 450,
      priceUnit: 'hour',
      requirements: ['Access to plumbing', 'Parts additional cost'],
      addons: [
        { id: 'emergency', name: 'Emergency Service', description: '24/7 emergency call-out', price: 200 },
        { id: 'parts', name: 'Parts & Materials', description: 'Additional parts cost', price: 0 }
      ],
      isActive: true,
      icon: 'wrench'
    },
    {
      id: 'elder-care',
      name: 'Elder Care',
      description: 'Compassionate elder care and companionship services',
      category: 'specialized',
      subcategory: 'care',
      duration: 240,
      basePrice: 300,
      priceUnit: 'hour',
      requirements: ['Background check completed', 'First aid certification'],
      addons: [
        { id: 'medication', name: 'Medication Management', description: 'Medication assistance', price: 50 },
        { id: 'transport', name: 'Transportation', description: 'Medical appointments transport', price: 100 }
      ],
      isActive: true,
      icon: 'heart'
    },
    {
      id: 'full-time-housekeeper',
      name: 'Full-time Housekeeper',
      description: 'Full-time residential housekeeping and household management',
      category: 'fulltime',
      subcategory: 'housekeeper',
      duration: 480,
      basePrice: 15000,
      priceUnit: 'job',
      requirements: ['Live-in accommodation', 'Full background check'],
      addons: [
        { id: 'cooking', name: 'Cooking Services', description: 'Meal preparation included', price: 2000 },
        { id: 'childcare', name: 'Child Care', description: 'Basic childcare assistance', price: 3000 }
      ],
      isActive: true,
      icon: 'users'
    }
  ];

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'home': return Home;
      case 'leaf': return Leaf;
      case 'shirt': return Shirt;
      case 'wrench': return Wrench;
      case 'heart': return Heart;
      case 'users': return Users;
      default: return Home;
    }
  };

  const categoryColors = {
    indoor: 'bg-blue-100 text-blue-600',
    outdoor: 'bg-green-100 text-green-600',
    specialized: 'bg-purple-100 text-purple-600',
    maintenance: 'bg-orange-100 text-orange-600',
    fulltime: 'bg-indigo-100 text-indigo-600'
  };

  const categories = [
    { id: 'indoor', name: 'Indoor Services', description: 'House cleaning, laundry, organizing' },
    { id: 'outdoor', name: 'Outdoor Services', description: 'Garden maintenance, car washing, pool cleaning' },
    { id: 'maintenance', name: 'Repairs & Maintenance', description: 'Plumbing, electrical, handyman services' },
    { id: 'specialized', name: 'Specialized Care', description: 'Elder care, pet care, mom\'s helper' },
    { id: 'fulltime', name: 'Full-time Placements', description: 'Housekeeper, nanny, carer positions' }
  ];

  return (
    <section id="services" className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Professional Home Services
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            From regular house cleaning to specialized care, find the perfect professional 
            for every home service need. All providers are verified, insured, and rated by our community.
          </p>
        </div>

        {/* Service Categories Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
          {categories.map((category) => (
            <div
              key={category.id}
              className="text-center p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
              data-testid={`category-${category.id}`}
            >
              <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${categoryColors[category.id as keyof typeof categoryColors]}`}>
                <Home className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
              <p className="text-sm text-gray-600">{category.description}</p>
            </div>
          ))}
        </div>

        {/* Featured Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => {
            const IconComponent = getServiceIcon(service.icon);
            return (
              <Card 
                key={service.id} 
                className="group hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-200"
                data-testid={`service-card-${service.id}`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${categoryColors[service.category as keyof typeof categoryColors]}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900" data-testid={`price-${service.id}`}>
                        {formatCurrency(service.basePrice)}
                      </div>
                      <div className="text-sm text-gray-600">per {service.priceUnit}</div>
                    </div>
                  </div>
                  
                  <CardTitle className="text-xl">{service.name}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {service.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {/* Service Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{Math.floor(service.duration / 60)}h {service.duration % 60 > 0 ? `${service.duration % 60}m` : ''}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Shield className="w-4 h-4 mr-2" />
                      <span>Insured & Background Checked</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="w-4 h-4 mr-2" />
                      <span>4.8+ Average Rating</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>Available Nationwide</span>
                    </div>
                  </div>

                  {/* Add-ons Preview */}
                  {service.addons.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Popular Add-ons:</h4>
                      <div className="space-y-1">
                        {service.addons.slice(0, 2).map((addon) => (
                          <div key={addon.id} className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">{addon.name}</span>
                            <span className="text-gray-900 font-medium">
                              {addon.price > 0 ? `+${formatCurrency(addon.price)}` : 'Quote'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <Button 
                      onClick={() => onSelectService?.(service.id)}
                      className="flex-1"
                      data-testid={`book-${service.id}`}
                    >
                      Book Now
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      data-testid={`learn-more-${service.id}`}
                    >
                      Details
                    </Button>
                  </div>

                  {/* Service Requirements */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="text-xs font-semibold text-gray-900 mb-2">Requirements:</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {service.requirements.slice(0, 2).map((req, index) => (
                        <li key={index} className="flex items-center">
                          <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-6">
            Can't find what you're looking for? We offer custom services to meet your specific needs.
          </p>
          <Button 
            variant="outline" 
            size="lg"
            data-testid="button-custom-service"
          >
            Request Custom Service
          </Button>
        </div>
      </div>
    </section>
  );
}