import { CheckCircle, Shield, Trophy, Star, Sparkles, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function CompetitiveAdvantage() {
  const advantages = [
    {
      title: "Better Pricing",
      icon: <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"><Trophy className="h-6 w-6 text-white" /></div>,
      description: "Up to 40% more competitive than industry leaders",
      details: [
        "House cleaning: R280/hr vs SweepSouth R400/day average",
        "Waitering: R180/hr vs R200+ industry standard",
        "Chef services: R550/event vs R800+ market rates",
        "All services include premium features at base price"
      ],
      bgColor: "bg-gradient-to-br from-yellow-50 to-orange-50",
      borderColor: "border-yellow-200"
    },
    {
      title: "Secure Payment Flow",
      icon: <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center"><Shield className="h-6 w-6 text-white" /></div>,
      description: "All payments processed through Berry Events Bank first",
      details: [
        "Customer protection with escrow-style payments",
        "Provider payment guarantee after service completion",
        "15% platform fee (competitive with industry)",
        "2-3 business day payment processing to providers"
      ],
      bgColor: "bg-gradient-to-br from-blue-50 to-purple-50",
      borderColor: "border-blue-200"
    },
    {
      title: "Premium Service Standards",
      icon: <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center"><Sparkles className="h-6 w-6 text-white" /></div>,
      description: "Higher quality standards with comprehensive verification",
      details: [
        "4-step provider onboarding with document verification",
        "Professional training and certification programs",
        "Background checks and insurance verification",
        "Real-time customer feedback and rating system"
      ],
      bgColor: "bg-gradient-to-br from-purple-50 to-pink-50",
      borderColor: "border-purple-200"
    },
    {
      title: "South African Focus",
      icon: <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center"><Zap className="h-6 w-6 text-white" /></div>,
      description: "Specialized for local market with authentic African cuisine",
      details: [
        "African cuisine specialists with authentic recipes",
        "Local payment methods and currency (ZAR)",
        "Understanding of South African service expectations",
        "Community-focused provider network"
      ],
      bgColor: "bg-gradient-to-br from-green-50 to-teal-50",
      borderColor: "border-green-200"
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
            Why Choose Berry Events?
          </h2>
          <p className="text-lg text-gray-600">
            We're not just another service platform. We're built specifically for South African families with better value, security, and quality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {advantages.map((advantage, index) => (
            <Card 
              key={index} 
              className={`${advantage.bgColor} ${advantage.borderColor} border-2 hover:shadow-lg transition-all duration-300`}
            >
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {advantage.icon}
                  <h3 className="text-xl font-semibold text-gray-900 ml-3">
                    {advantage.title}
                  </h3>
                </div>
                
                <p className="text-gray-700 mb-4 font-medium">
                  {advantage.description}
                </p>
                
                <ul className="space-y-2">
                  {advantage.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-start text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to action */}
        <div className="text-center mt-12">
          <div className="bg-white p-6 rounded-lg shadow-md inline-block">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ready to experience the Berry Events difference?
            </h3>
            <p className="text-gray-600 mb-4">
              Join thousands of satisfied customers who've made the switch
            </p>
            <div className="flex items-center justify-center text-sm text-gray-500 space-x-6">
              <span className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                4.8/5 Customer Rating
              </span>
              <span className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                1000+ Happy Customers
              </span>
              <span className="flex items-center">
                <Shield className="h-4 w-4 text-blue-500 mr-1" />
                100% Payment Security
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}