import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ArrowRight } from "lucide-react";

interface AnimatedServiceCardProps {
  service: any;
  index: number;
  onServiceSelect: (id: string) => void;
  onModalOpen: (id: string) => void;
  theme: 'blue' | 'green' | 'purple';
}

export default function AnimatedServiceCard({ 
  service, 
  index, 
  onServiceSelect, 
  onModalOpen,
  theme 
}: AnimatedServiceCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const themeColors = {
    blue: {
      border: 'hover:border-primary/30',
      shadow: 'hover:shadow-primary/20',
      gradient: 'rgba(59, 130, 246, 0.05)',
      gradientEnd: 'rgba(147, 51, 234, 0.05)'
    },
    green: {
      border: 'hover:border-green-400/30', 
      shadow: 'hover:shadow-green-500/20',
      gradient: 'rgba(34, 197, 94, 0.05)',
      gradientEnd: 'rgba(22, 163, 74, 0.05)'
    },
    purple: {
      border: 'hover:border-purple-400/30',
      shadow: 'hover:shadow-purple-500/20', 
      gradient: 'rgba(147, 51, 234, 0.05)',
      gradientEnd: 'rgba(126, 34, 206, 0.05)'
    }
  };

  const currentTheme = themeColors[theme];

  return (
    <Card 
      className={`bg-white border border-gray-100 ${currentTheme.border} hover:shadow-2xl transition-all duration-500 ease-out group cursor-pointer rounded-2xl overflow-hidden h-full flex flex-col hover:-translate-y-4 hover:scale-[1.02] transform hover:rotate-1 ${currentTheme.shadow} animate-fade-in-up ${theme === 'green' ? 'bounce-on-hover' : theme === 'purple' ? 'pulse-on-hover' : ''}`}
      style={{
        animationDelay: `${index * (theme === 'green' ? 150 : theme === 'purple' ? 120 : 100)}ms`,
        animationFillMode: 'both'
      }}
      data-testid={`service-card-${service.id}`} 
      onClick={() => {
        onModalOpen(service.id);
      }}
      onMouseEnter={(e) => {
        setIsHovered(true);
        e.currentTarget.style.background = `linear-gradient(135deg, ${currentTheme.gradient} 0%, ${currentTheme.gradientEnd} 100%)`;
      }}
      onMouseLeave={(e) => {
        setIsHovered(false);
        e.currentTarget.style.background = 'white';
      }}
    >
      <CardContent className="p-6 flex flex-col h-full">
        {/* Enhanced Service Header with Micro-interactions */}
        <div className="relative mb-4">
          <div className={`w-16 h-16 bg-gradient-to-br ${service.gradient} rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-125 group-hover:shadow-2xl group-hover:rotate-12 transition-all duration-500 ease-out mx-auto relative overflow-hidden ${isHovered ? 'animate-pulse-glow' : ''}`}>
            <div className="absolute inset-0 bg-white/20 transform scale-0 group-hover:scale-100 transition-transform duration-500 rounded-2xl animate-shimmer"></div>
            <service.icon className="h-8 w-8 text-white relative z-10 group-hover:scale-110 group-hover:animate-bounce-gentle transition-transform duration-300" />
          </div>
          {(service.popular || service.urgent) && (
            <div className="absolute -top-1 -right-1 animate-bounce-gentle">
              {service.popular && (
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 text-xs px-1.5 py-0.5 animate-pulse-glow">
                  <Star className="h-2 w-2 mr-0.5 animate-wiggle" />
                  Hot
                </Badge>
              )}
              {service.urgent && (
                <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 text-xs px-1.5 py-0.5 animate-pulse-glow">
                  24/7
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Enhanced Service Info with Animations */}
        <div className="mb-4 text-center">
          <span className="text-xs bg-gradient-to-r from-primary/10 to-purple-600/10 text-primary px-3 py-1 rounded-full font-medium border border-primary/20 mb-3 inline-block transition-all duration-300 group-hover:scale-105">
            {service.category}
          </span>
          <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors duration-300 group-hover:scale-105 transform">{service.title}</h4>
          <p className="text-gray-600 text-sm leading-relaxed mb-3 group-hover:text-gray-700 transition-colors">{service.description}</p>
          
          <div className="bg-gradient-to-r from-primary/5 to-purple-600/5 rounded-lg py-2 px-3 mb-3 group-hover:from-primary/10 group-hover:to-purple-600/10 transition-all duration-300">
            <div className="text-lg font-bold text-primary group-hover:scale-110 transition-transform duration-300">{service.price}</div>
            <div className="text-xs text-gray-500">Duration: {service.duration}</div>
          </div>
        </div>


        {/* Single Booking Button */}
        <div className="mt-auto">
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              onModalOpen(service.id);
            }}
            className="w-full hover:opacity-90 text-white font-medium text-sm py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl group relative overflow-hidden"
            style={{ backgroundColor: '#8B4789' }}
            data-testid={`book-${service.id}`}
          >
            <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
            <span className="relative z-10">Quick Quote or Book Now</span>
            <ArrowRight className="h-4 w-4 ml-2 relative z-10 group-hover:translate-x-1 group-hover:scale-110 transition-all duration-300" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}