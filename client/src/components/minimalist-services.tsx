import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ModernServiceModal from "@/components/modern-service-modal";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, 
  TreePine, 
  Droplet, 
  Zap, 
  ChefHat, 
  Coffee,
  Wrench,
  Shield,
  ArrowRight,
  Star,
  Clock
} from "lucide-react";

interface MinimalistServicesProps {
  onServiceSelect: (serviceId: string) => void;
}

// Simplified service structure focusing on core offerings
const services = [
  {
    id: "cleaning",
    title: "House Cleaning",
    description: "Professional cleaning services for your home",
    price: "From R75/hour",
    duration: "2-4 hours",
    popular: true,
    icon: Home,
    features: ["Regular & deep cleaning", "Eco-friendly products", "Insured professionals"]
  },
  {
    id: "garden-care", 
    title: "Garden Care",
    description: "Complete garden maintenance and landscaping",
    price: "From R180/hour",
    duration: "2-6 hours", 
    icon: TreePine,
    features: ["Lawn mowing", "Garden cleanup", "Plant care"]
  },
  {
    id: "plumbing",
    title: "Plumbing",
    description: "Quick plumbing repairs and installations",
    price: "From R350/hour",
    duration: "1-3 hours",
    urgent: true,
    icon: Droplet,
    features: ["24/7 emergency", "Licensed plumbers", "Fixed pricing"]
  },
  {
    id: "electrical",
    title: "Electrical",
    description: "Safe electrical repairs and installations", 
    price: "From R280/hour",
    duration: "1-4 hours",
    urgent: true,
    icon: Zap,
    features: ["Certified electricians", "Safety guaranteed", "Transparent pricing"]
  },
  {
    id: "chef-catering",
    title: "Chef & Catering", 
    description: "Authentic African cuisine for your events",
    price: "From R450/event",
    duration: "3-8 hours",
    icon: ChefHat,
    features: ["Traditional recipes", "Fresh ingredients", "Event planning"]
  },
  {
    id: "handyman",
    title: "Handyman",
    description: "General repairs and home maintenance",
    price: "From R250/hour", 
    duration: "1-5 hours",
    icon: Wrench,
    features: ["Furniture assembly", "Wall mounting", "General repairs"]
  }
];

export default function MinimalistServices({ onServiceSelect }: MinimalistServicesProps) {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [clickedCard, setClickedCard] = useState<string | null>(null);

  const handleServiceClick = (serviceId: string) => {
    setClickedCard(serviceId);
    // Small delay for click animation
    setTimeout(() => {
      setSelectedService(serviceId);
      setIsModalOpen(true);
      onServiceSelect(serviceId);
      setClickedCard(null);
    }, 150);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedService(null);
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Professional Home Services
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Book trusted, verified professionals for all your home service needs. 
            Quality guaranteed, transparent pricing.
          </p>
        </div>

        {/* Services Grid - Animated Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <AnimatePresence>
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  ease: [0.22, 1, 0.36, 1]
                }}
                whileHover={{ 
                  y: -8,
                  transition: { duration: 0.3, ease: "easeOut" }
                }}
                whileTap={{ 
                  scale: 0.98,
                  transition: { duration: 0.1 }
                }}
                onHoverStart={() => setHoveredCard(service.id)}
                onHoverEnd={() => setHoveredCard(null)}
              >
                <Card
                  className="group relative overflow-hidden border-0 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer bg-white h-full"
                  onClick={() => handleServiceClick(service.id)}
                  data-testid={`service-card-${service.id}`}
                  style={{
                    transform: clickedCard === service.id ? 'scale(0.95)' : 'scale(1)',
                    transition: 'transform 0.15s ease-out'
                  }}
                >
                  {/* Animated Background Gradient */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-blue-100/0 group-hover:from-blue-50/50 group-hover:to-blue-100/30"
                    initial={false}
                    animate={{
                      opacity: hoveredCard === service.id ? 1 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                  
                  {/* Animated Border */}
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: hoveredCard === service.id 
                        ? 'linear-gradient(45deg, transparent, rgba(59, 130, 246, 0.1), transparent)'
                        : 'transparent',
                      transition: 'all 0.3s ease'
                    }}
                  />

                  <CardContent className="relative p-8 h-full flex flex-col">
                    {/* Animated Service Icon */}
                    <div className="mb-6">
                      <motion.div
                        className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center relative overflow-hidden"
                        whileHover={{ 
                          scale: 1.1,
                          rotate: [0, -10, 10, -5, 0],
                          transition: { duration: 0.6 }
                        }}
                        style={{
                          background: hoveredCard === service.id 
                            ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(147, 197, 253, 0.15))'
                            : undefined
                        }}
                      >
                        <motion.div
                          animate={{
                            rotate: hoveredCard === service.id ? 360 : 0,
                          }}
                          transition={{ duration: 0.8, ease: "easeInOut" }}
                        >
                          <service.icon className="w-8 h-8 text-blue-600" />
                        </motion.div>
                        
                        {/* Ripple Effect */}
                        <motion.div
                          className="absolute inset-0 rounded-2xl border-2 border-blue-300"
                          initial={{ scale: 1, opacity: 0 }}
                          animate={{ 
                            scale: hoveredCard === service.id ? 1.3 : 1, 
                            opacity: hoveredCard === service.id ? [0, 0.5, 0] : 0 
                          }}
                          transition={{ duration: 1.5, repeat: hoveredCard === service.id ? Infinity : 0 }}
                        />
                      </motion.div>
                    </div>

                    {/* Animated Badges */}
                    <motion.div 
                      className="flex flex-wrap gap-2 mb-4"
                      initial={false}
                    >
                      {service.popular && (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: index * 0.1 + 0.2 }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                            <motion.div
                              animate={{ rotate: hoveredCard === service.id ? 360 : 0 }}
                              transition={{ duration: 0.5 }}
                            >
                              <Star className="w-3 h-3 mr-1" />
                            </motion.div>
                            Popular
                          </Badge>
                        </motion.div>
                      )}
                      {service.urgent && (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: index * 0.1 + 0.3 }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                            <motion.div
                              animate={{ 
                                rotate: hoveredCard === service.id ? [0, 15, -15, 0] : 0 
                              }}
                              transition={{ duration: 0.6, repeat: hoveredCard === service.id ? Infinity : 0 }}
                            >
                              <Clock className="w-3 h-3 mr-1" />
                            </motion.div>
                            24/7 Available
                          </Badge>
                        </motion.div>
                      )}
                    </motion.div>

                    {/* Animated Service Info */}
                    <motion.h3 
                      className="text-2xl font-bold text-gray-900 mb-3"
                      whileHover={{ 
                        scale: 1.02,
                        transition: { duration: 0.2 }
                      }}
                    >
                      {service.title}
                    </motion.h3>
                    
                    <motion.p 
                      className="text-gray-600 mb-4 leading-relaxed"
                      initial={{ opacity: 0.8 }}
                      animate={{ 
                        opacity: hoveredCard === service.id ? 1 : 0.8 
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {service.description}
                    </motion.p>

                    {/* Animated Features */}
                    <motion.ul className="space-y-2 mb-6 flex-1">
                      {service.features.map((feature, featureIndex) => (
                        <motion.li 
                          key={featureIndex} 
                          className="flex items-center text-sm text-gray-600"
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: index * 0.1 + featureIndex * 0.05 + 0.4 }}
                          whileHover={{ x: 5, transition: { duration: 0.2 } }}
                        >
                          <motion.div
                            whileHover={{ 
                              scale: 1.2,
                              rotate: 360,
                              transition: { duration: 0.3 }
                            }}
                          >
                            <Shield className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          </motion.div>
                          {feature}
                        </motion.li>
                      ))}
                    </motion.ul>

                    {/* Animated Pricing & CTA */}
                    <motion.div 
                      className="flex items-center justify-between"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div>
                        <motion.p 
                          className="text-2xl font-bold text-blue-600"
                          whileHover={{ 
                            scale: 1.1,
                            transition: { duration: 0.2 }
                          }}
                        >
                          {service.price}
                        </motion.p>
                        <motion.p 
                          className="text-sm text-gray-500"
                          animate={{ 
                            opacity: hoveredCard === service.id ? 1 : 0.7 
                          }}
                        >
                          {service.duration}
                        </motion.p>
                      </div>
                      
                      <motion.div 
                        className="flex items-center text-blue-600"
                        whileHover={{ scale: 1.05 }}
                        animate={{
                          color: hoveredCard === service.id ? '#1d4ed8' : '#2563eb'
                        }}
                      >
                        <span className="text-sm font-medium mr-2">Book Now</span>
                        <motion.div
                          animate={{ 
                            x: hoveredCard === service.id ? 5 : 0,
                            scale: hoveredCard === service.id ? 1.1 : 1
                          }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                          <ArrowRight className="w-4 h-4" />
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Trust Indicators - Animated */}
        <motion.div 
          className="bg-gray-50 rounded-3xl p-8 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { number: "50,000+", label: "Happy Customers" },
              { number: "1,500+", label: "Verified Professionals" },
              { number: "4.9★", label: "Average Rating" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
              >
                <motion.div 
                  className="text-3xl font-bold text-blue-600 mb-2"
                  whileInView={{ 
                    textShadow: "0 0 8px rgba(59, 130, 246, 0.3)"
                  }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  {stat.number}
                </motion.div>
                <motion.div 
                  className="text-gray-600"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                >
                  {stat.label}
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* How It Works - Animated */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.h3 
            className="text-2xl font-bold text-gray-900 mb-8"
            initial={{ y: -20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            How It Works
          </motion.h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Select Service",
                description: "Choose from our professional home services"
              },
              {
                step: "2", 
                title: "Book & Pay",
                description: "Schedule your service and pay securely"
              },
              {
                step: "3",
                title: "Enjoy Results", 
                description: "Relax while professionals handle the work"
              }
            ].map((step, index) => (
              <motion.div 
                key={index}
                className="space-y-4 group cursor-pointer"
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <motion.div 
                  className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto relative overflow-hidden"
                  whileHover={{ 
                    scale: 1.1,
                    backgroundColor: "#dbeafe",
                    transition: { duration: 0.3 }
                  }}
                >
                  <motion.span 
                    className="text-blue-600 font-bold text-lg"
                    whileHover={{ 
                      scale: 1.2,
                      transition: { duration: 0.2 }
                    }}
                  >
                    {step.step}
                  </motion.span>
                  
                  {/* Pulse animation on hover */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-blue-300"
                    initial={{ scale: 1, opacity: 0 }}
                    whileHover={{ 
                      scale: 1.4, 
                      opacity: [0, 0.5, 0],
                      transition: { duration: 1, repeat: Infinity }
                    }}
                  />
                </motion.div>
                
                <motion.h4 
                  className="font-semibold text-gray-900"
                  whileHover={{ 
                    color: "#2563eb",
                    transition: { duration: 0.2 }
                  }}
                >
                  {step.title}
                </motion.h4>
                
                <motion.p 
                  className="text-gray-600"
                  initial={{ opacity: 0.8 }}
                  whileHover={{ 
                    opacity: 1,
                    transition: { duration: 0.2 }
                  }}
                >
                  {step.description}
                </motion.p>
              </motion.div>
            ))}
          </div>

          {/* Animated connecting lines */}
          <div className="hidden md:block relative -mt-16 mb-16">
            <motion.div
              className="absolute top-6 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 2, delay: 0.5 }}
              viewport={{ once: true }}
            >
              <svg className="w-full h-4" viewBox="0 0 400 20">
                <motion.path
                  d="M50 10 Q200 10 350 10"
                  stroke="#e5e7eb"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="5,5"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  transition={{ duration: 2, delay: 0.8 }}
                />
              </svg>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Service Modal */}
      {selectedService && (
        <ModernServiceModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          serviceId={selectedService}
          onBookingComplete={(bookingData) => {
            console.log('Booking completed:', bookingData);
          }}
        />
      )}
    </section>
  );
}