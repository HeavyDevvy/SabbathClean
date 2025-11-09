import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Calendar, Star } from "lucide-react";
import berryLogo from "@assets/Untitled design (2)_1762495887852.png";

interface MinimalistHeroProps {
  onGetStarted: () => void;
}

export default function MinimalistHero({ onGetStarted }: MinimalistHeroProps) {
  const [address, setAddress] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleQuickBooking = () => {
    if (address.trim()) {
      // Scroll to services section
      const servicesSection = document.querySelector('[data-section="services"]');
      if (servicesSection) {
        servicesSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 500);
  };

  return (
    <section className="relative bg-white pt-20 pb-16 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-white"></div>
      
      {/* Floating particles animation */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-200/30 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              opacity: 0 
            }}
            animate={{
              y: [null, -50, -100],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeOut"
            }}
          />
        ))}
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[600px]">
          {/* Content */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Trust Badge */}
            <motion.div 
              className="inline-flex items-center space-x-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm border border-green-200"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 4px 12px rgba(34, 197, 94, 0.2)",
                transition: { duration: 0.2 }
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Star className="w-4 h-4 fill-current" />
              </motion.div>
              <span className="font-medium">Trusted by 50,000+ South Africans</span>
            </motion.div>

            {/* Main Headline */}
            <div className="space-y-4">
              <motion.h1 
                className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  Home Services
                </motion.span>
                <motion.span 
                  className="block text-blue-600"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  whileHover={{ 
                    textShadow: "0 0 20px rgba(59, 130, 246, 0.4)",
                    transition: { duration: 0.3 }
                  }}
                >
                  Made Simple
                </motion.span>
              </motion.h1>
              
              <motion.p 
                className="text-xl text-gray-600 leading-relaxed max-w-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                Book trusted professionals for cleaning, repairs, and maintenance. 
                Quality guaranteed, transparent pricing, same-day availability.
              </motion.p>
            </div>

            {/* Quick Booking Form */}
            <motion.div 
              className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 max-w-md"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              whileHover={{ 
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                transition: { duration: 0.3 }
              }}
            >
              <div className="space-y-4">
                <motion.div 
                  className="relative"
                  whileFocus={{ scale: 1.02 }}
                >
                  <motion.div
                    animate={{ 
                      color: isTyping ? "#3b82f6" : "#9ca3af",
                      scale: isTyping ? 1.1 : 1
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" />
                  </motion.div>
                  <Input
                    type="text"
                    placeholder="Enter your address"
                    value={address}
                    onChange={handleInputChange}
                    className="pl-10 h-12 text-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    data-testid="address-input"
                  />
                  
                  {/* Typing indicator */}
                  <AnimatePresence>
                    {isTyping && (
                      <motion.div
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex space-x-1">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-1 h-1 bg-blue-500 rounded-full"
                              animate={{ y: [0, -3, 0] }}
                              transition={{ 
                                duration: 0.6, 
                                repeat: Infinity,
                                delay: i * 0.1 
                              }}
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    onClick={handleQuickBooking}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-300"
                    disabled={!address.trim()}
                    data-testid="quick-book-button"
                  >
                    <motion.div
                      animate={{ 
                        rotate: address.trim() ? 0 : [0, 10, -10, 0] 
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      <Search className="w-5 h-5 mr-2" />
                    </motion.div>
                    Find Services
                    
                    {/* Button loading effect when clicked */}
                    <motion.div
                      className="absolute inset-0 bg-white/20 rounded-xl"
                      initial={{ scale: 0, opacity: 0 }}
                      whileTap={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.1 }}
                    />
                  </Button>
                </motion.div>
              </div>
              
              <motion.p 
                className="text-sm text-gray-500 text-center mt-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
              >
                Available today • No hidden fees
              </motion.p>
            </motion.div>

            {/* Quick Stats */}
            <motion.div 
              className="grid grid-cols-3 gap-6 pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6, duration: 0.5 }}
            >
              {[
                { value: "<2mins", label: "Average booking time" },
                { value: "4.9★", label: "Customer rating" },
                { value: "24/7", label: "Support available" }
              ].map((stat, index) => (
                <motion.div 
                  key={index}
                  className="text-center"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1.8 + index * 0.1, duration: 0.3 }}
                  whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                >
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Visual */}
          <motion.div 
            className="relative lg:pl-8"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <div className="relative">
              {/* Main Image Placeholder */}
              <motion.div 
                className="aspect-[4/5] bg-gradient-to-br from-blue-100 to-blue-50 rounded-3xl shadow-2xl overflow-hidden relative"
                whileHover={{ 
                  scale: 1.02,
                  rotate: [0, 1, -1, 0],
                  transition: { duration: 0.6 }
                }}
              >
                {/* Berry Events Logo Background */}
                <div className="absolute inset-0 flex items-center justify-center p-12">
                  <motion.img
                    src={berryLogo}
                    alt="Berry Events Logo"
                    className="w-full h-full object-contain opacity-30 rounded-2xl"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.3 }}
                    transition={{ delay: 1.2, duration: 0.8 }}
                  />
                  
                  {/* Overlay gradient to ensure text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-100/50 via-transparent to-blue-100/50 rounded-3xl" />
                </div>

                {/* Content overlay */}
                <div className="relative z-10 text-center space-y-6 p-8 h-full flex flex-col justify-center">
                  <motion.div 
                    className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg"
                    animate={{ 
                      boxShadow: ["0 4px 20px rgba(59, 130, 246, 0.3)", "0 8px 30px rgba(59, 130, 246, 0.5)", "0 4px 20px rgba(59, 130, 246, 0.3)"]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    >
                      <Star className="w-10 h-10 text-white fill-current" />
                    </motion.div>
                  </motion.div>
                  
                  <motion.h3 
                    className="text-2xl font-bold text-blue-900"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4 }}
                  >
                    Quality Guaranteed
                  </motion.h3>
                  
                  <motion.p 
                    className="text-blue-700 text-lg"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.6 }}
                  >
                    Professional services you can trust
                  </motion.p>

                  {/* Achievement badges */}
                  <motion.div 
                    className="flex justify-center space-x-4 mt-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.8 }}
                  >
                    <div className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-blue-900">
                      Verified ✓
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-blue-900">
                      Insured ✓
                    </div>
                  </motion.div>
                </div>

                {/* Animated border effect */}
                <motion.div
                  className="absolute inset-0 rounded-3xl"
                  style={{
                    background: "linear-gradient(45deg, transparent, rgba(59, 130, 246, 0.1), transparent, rgba(59, 130, 246, 0.1), transparent)",
                    backgroundSize: "400% 400%"
                  }}
                  animate={{
                    backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"]
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>

              {/* Floating Cards */}
              <motion.div 
                className="absolute -top-4 -left-4 bg-white p-4 rounded-xl shadow-lg border border-gray-100"
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 1.8, duration: 0.5 }}
                whileHover={{ 
                  scale: 1.05,
                  rotate: 2,
                  transition: { duration: 0.2 }
                }}
              >
                <div className="flex items-center space-x-3">
                  <motion.div 
                    className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center"
                    whileHover={{ rotate: 360, transition: { duration: 0.3 } }}
                  >
                    <Calendar className="w-5 h-5 text-green-600" />
                  </motion.div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Same Day</div>
                    <div className="text-xs text-gray-600">Available today</div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="absolute -bottom-4 -right-4 bg-white p-4 rounded-xl shadow-lg border border-gray-100"
                initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 2, duration: 0.5 }}
                whileHover={{ 
                  scale: 1.05,
                  rotate: -2,
                  transition: { duration: 0.2 }
                }}
              >
                <div className="flex items-center space-x-3">
                  <motion.div 
                    className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"
                    whileHover={{ rotate: 360, transition: { duration: 0.3 } }}
                  >
                    <Star className="w-5 h-5 text-blue-600 fill-current" />
                  </motion.div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Verified</div>
                    <div className="text-xs text-gray-600">All professionals</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
