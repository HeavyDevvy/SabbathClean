import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  DollarSign,
  Shield,
  Award,
  MapPin,
  CheckCircle2,
  Zap,
  Heart,
  Star,
  TrendingDown,
  Lock,
  Users,
  Trophy
} from "lucide-react";

const advantages = [
  {
    icon: DollarSign,
    title: "Better Pricing",
    description: "Competitive rates that deliver exceptional value without compromising on quality",
    details: [
      "House Cleaning: R280/hr vs R350+ (industry average)",
      "Chef & Catering: R550/event vs R800+ (competitors)",
      "Garden Care: R350/hr vs R400+ (market rate)",
      "No hidden fees or surprise charges"
    ],
    color: "from-green-500 to-emerald-500",
    stats: { value: "25%", label: "Lower Costs", sublabel: "Than competitors" }
  },
  {
    icon: Shield,
    title: "Secure Payment Flow",
    description: "All payments processed through Berry Events Bank with escrow protection",
    details: [
      "100% secure payment processing",
      "Escrow protection until service completion",
      "15% platform commission (industry standard)",
      "2-3 business day payment distribution"
    ],
    color: "from-blue-500 to-cyan-500",
    stats: { value: "100%", label: "Secure", sublabel: "Payment guarantee" }
  },
  {
    icon: Award,
    title: "Premium Standards",
    description: "Berry Stars program ensuring only top-tier professionals serve you",
    details: [
      "Rigorous 5-step verification process",
      "Background checks & identity verification",
      "Ongoing performance monitoring",
      "4.9/5 average service rating"
    ],
    color: "from-purple-500 to-pink-500",
    stats: { value: "4.9/5", label: "Rating", sublabel: "Customer satisfaction" }
  },
  {
    icon: MapPin,
    title: "South African Focus",
    description: "Specialized in South African homes with local expertise and cultural understanding",
    details: [
      "Local professionals who understand SA homes",
      "African cuisine specialization (traditional dishes)",
      "Cultural sensitivity and local knowledge",
      "Support for local communities and economy"
    ],
    color: "from-orange-500 to-red-500",
    stats: { value: "100%", label: "Local", sublabel: "SA professionals" }
  }
];

const competitorComparison = [
  {
    feature: "House Cleaning",
    berry: "R280/hour",
    sweepsouth: "R350/hour",
    others: "R400+/hour",
    advantage: "R70 savings per hour"
  },
  {
    feature: "Payment Security",
    berry: "Escrow Protection",
    sweepsouth: "Standard Payment",
    others: "Direct Payment",
    advantage: "100% payment security"
  },
  {
    feature: "African Cuisine",
    berry: "Specialized Chefs",
    sweepsouth: "Limited Options",
    others: "Not Available",
    advantage: "Authentic local flavors"
  },
  {
    feature: "Provider Verification",
    berry: "5-Step Process",
    sweepsouth: "3-Step Process",
    others: "Basic Checks",
    advantage: "Enhanced safety standards"
  }
];

const testimonials = [
  {
    name: "Sarah Mokgethi",
    location: "Cape Town",
    service: "House Cleaning",
    rating: 5,
    text: "Berry Events saved me R150 per week compared to other services. Nomsa is incredible - my house has never been cleaner!",
    savings: "R150/week saved"
  },
  {
    name: "David Chen",
    location: "Johannesburg", 
    service: "African Cuisine Catering",
    rating: 5,
    text: "Found an amazing chef for our wedding through Berry Events. The traditional South African menu was authentic and delicious!",
    savings: "R2000 saved vs competitors"
  },
  {
    name: "Michelle Adams",
    location: "Durban",
    service: "Garden Maintenance",
    rating: 5,
    text: "Professional service at great prices. The escrow payment system gives me complete peace of mind every time.",
    savings: "R100/hour saved"
  }
];

export default function CompetitiveAdvantageSection() {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 text-sm font-semibold border-0 mb-4">
            <Trophy className="h-4 w-4 mr-2" />
            Why Choose Berry Events
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            The clear choice for
            <span className="block bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              smart homeowners
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            See why thousands of South African families trust Berry Events for their home services. 
            Better value, better security, better service - every time.
          </p>
        </div>

        {/* Advantages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {advantages.map((advantage, index) => (
            <Card key={index} className="bg-white border-2 border-gray-100 hover:border-gray-200 hover:shadow-2xl transition-all duration-500 group">
              <CardContent className="p-8">
                {/* Icon */}
                <div className={`w-16 h-16 bg-gradient-to-r ${advantage.color} rounded-xl flex items-center justify-center mb-6 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <advantage.icon className="h-8 w-8 text-white" />
                </div>

                {/* Content */}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {advantage.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {advantage.description}
                  </p>
                </div>

                {/* Stats */}
                <div className="text-center mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-gray-900">{advantage.stats.value}</div>
                  <div className="text-sm font-semibold text-gray-900">{advantage.stats.label}</div>
                  <div className="text-xs text-gray-500">{advantage.stats.sublabel}</div>
                </div>

                {/* Details */}
                <div className="space-y-2">
                  {advantage.details.map((detail, detailIndex) => (
                    <div key={detailIndex} className="flex items-start text-xs text-gray-600">
                      <CheckCircle2 className="h-3 w-3 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Competitor Comparison */}
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-8 lg:p-12 border border-gray-200 mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              How we compare to the competition
            </h3>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              See the clear advantages of choosing Berry Events over other platforms
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-2xl shadow-lg overflow-hidden">
              <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Feature</th>
                  <th className="px-6 py-4 text-center font-semibold">
                    <div className="flex items-center justify-center">
                      <Trophy className="h-5 w-5 mr-2" />
                      Berry Events
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center font-semibold">SweepSouth</th>
                  <th className="px-6 py-4 text-center font-semibold">Others</th>
                  <th className="px-6 py-4 text-center font-semibold">Your Advantage</th>
                </tr>
              </thead>
              <tbody>
                {competitorComparison.map((row, index) => (
                  <tr key={index} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors duration-200`}>
                    <td className="px-6 py-4 font-semibold text-gray-900">{row.feature}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <Badge className="bg-green-100 text-green-700 border-0 font-semibold">
                          {row.berry}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">{row.sweepsouth}</td>
                    <td className="px-6 py-4 text-center text-gray-600">{row.others}</td>
                    <td className="px-6 py-4 text-center">
                      <Badge className="bg-blue-100 text-blue-700 border-0 font-semibold">
                        {row.advantage}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-600">
              * Prices based on market research conducted in August 2025 across major SA cities
            </p>
          </div>
        </div>

        {/* Customer Testimonials */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              What our customers are saving
            </h3>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Real savings from real customers who made the switch to Berry Events
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white border-2 border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8">
                  {/* Rating */}
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>

                  {/* Testimonial */}
                  <blockquote className="text-gray-700 mb-6 leading-relaxed">
                    "{testimonial.text}"
                  </blockquote>

                  {/* Savings Highlight */}
                  <div className="bg-green-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-center">
                      <TrendingDown className="h-5 w-5 text-green-600 mr-2" />
                      <span className="font-bold text-green-700">{testimonial.savings}</span>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.location}</div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {testimonial.service}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 lg:p-12 text-white text-center">
          <h3 className="text-3xl font-bold mb-8">
            Trusted by thousands of South African families
          </h3>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Users, value: "10,000+", label: "Happy Customers", description: "Served across SA" },
              { icon: Star, value: "4.8/5", label: "Average Rating", description: "Customer satisfaction" },
              { icon: Shield, value: "100%", label: "Payment Security", description: "Guaranteed protection" },
              { icon: Heart, value: "R2.5M+", label: "Customer Savings", description: "Total saved vs competitors" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold mb-2" data-testid={`stat-${stat.label.toLowerCase().replace(' ', '-')}`}>
                  {stat.value}
                </div>
                <div className="text-lg font-semibold mb-1">{stat.label}</div>
                <div className="text-blue-100 text-sm">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}