import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Shield,
  UserCheck,
  CreditCard,
  CheckCircle2,
  Lock,
  FileText,
  Phone,
  Clock,
  Award,
  Heart,
  Star,
  Users
} from "lucide-react";

const trustFeatures = [
  {
    icon: Shield,
    title: "Comprehensive Insurance",
    description: "All services covered by comprehensive insurance for your complete peace of mind",
    details: ["Public liability coverage", "Property damage protection", "Personal injury coverage"],
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: UserCheck,
    title: "Verified Professionals",
    description: "Every provider undergoes rigorous background checks and identity verification",
    details: ["Criminal background checks", "Identity verification", "Reference validation"],
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description: "Bank-grade security with escrow protection until service completion",
    details: ["256-bit SSL encryption", "PCI DSS compliance", "Escrow protection"],
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: Award,
    title: "Quality Guarantee",
    description: "100% satisfaction guarantee with free rework if you're not completely happy",
    details: ["Satisfaction guarantee", "Free rework policy", "Quality standards"],
    color: "from-orange-500 to-red-500"
  }
];

const safetyStats = [
  { 
    value: "100%", 
    label: "Providers Verified", 
    icon: UserCheck,
    description: "Every professional background-checked"
  },
  { 
    value: "R50M+", 
    label: "Insurance Coverage", 
    icon: Shield,
    description: "Comprehensive protection for all services"
  },
  { 
    value: "24/7", 
    label: "Support Available", 
    icon: Phone,
    description: "Round-the-clock customer assistance"
  },
  { 
    value: "4.9/5", 
    label: "Safety Rating", 
    icon: Star,
    description: "Outstanding safety track record"
  }
];

const certifications = [
  {
    name: "ISO 27001",
    description: "Information Security Management",
    icon: Lock
  },
  {
    name: "PCI DSS",
    description: "Payment Security Standards",
    icon: CreditCard
  },
  {
    name: "POPIA Compliant",
    description: "Data Protection & Privacy",
    icon: FileText
  },
  {
    name: "SANAS Accredited",
    description: "Quality Management System",
    icon: Award
  }
];

export default function TrustSafetySection() {
  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <Badge className="bg-success/10 text-success px-5 py-2 text-sm font-semibold border-0 mb-6 rounded-full">
            <Shield className="h-4 w-4 mr-2" />
            Trust & Safety First
          </Badge>
          <h2 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
            Your safety is our
            <span className="block text-success mt-2">
              top priority
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We've built comprehensive safety measures and verification processes to ensure 
            you can book services with complete confidence and peace of mind.
          </p>
        </div>

        {/* Trust Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {trustFeatures.map((feature, index) => (
            <Card key={index} className="bg-white border-2 border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8">
                {/* Icon */}
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>

                {/* Content */}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">
                    {feature.description}
                  </p>

                  {/* Details */}
                  <div className="space-y-2">
                    {feature.details.map((detail, detailIndex) => (
                      <div key={detailIndex} className="flex items-center justify-center text-xs text-gray-500">
                        <CheckCircle2 className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                        {detail}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Safety Stats */}
        <div className="bg-white rounded-3xl p-8 lg:p-12 border border-gray-200 shadow-lg mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Safety by the Numbers
            </h3>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Our commitment to safety and quality is reflected in these key metrics
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {safetyStats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-50 transition-colors duration-300">
                  <stat.icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2" data-testid={`stat-${stat.label.toLowerCase().replace(' ', '-')}`}>
                  {stat.value}
                </div>
                <div className="text-sm font-semibold text-gray-900 mb-1">
                  {stat.label}
                </div>
                <div className="text-xs text-gray-500">
                  {stat.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verification Process */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Process Steps */}
          <div>
            <Badge className="bg-blue-100 text-blue-700 px-4 py-2 text-sm font-semibold border-0 mb-4">
              <UserCheck className="h-4 w-4 mr-2" />
              Verification Process
            </Badge>
            <h3 className="text-3xl font-bold text-gray-900 mb-6">
              How we verify every professional
            </h3>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              Our multi-step verification process ensures only the most qualified and 
              trustworthy professionals join our platform.
            </p>

            <div className="space-y-6">
              {[
                { step: 1, title: "Identity Verification", description: "Government ID and address verification" },
                { step: 2, title: "Background Check", description: "Criminal background and reference checks" },
                { step: 3, title: "Skills Assessment", description: "Practical skills testing and certification" },
                { step: 4, title: "Insurance Validation", description: "Insurance coverage and documentation review" },
                { step: 5, title: "Ongoing Monitoring", description: "Continuous performance and safety monitoring" }
              ].map((item, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{item.title}</h4>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 border border-gray-200">
              {/* Provider Card */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Nomsa Mthembu</h4>
                    <p className="text-sm text-gray-600">House Cleaning Professional</p>
                  </div>
                </div>

                {/* Verification Badges */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <CheckCircle2 className="h-6 w-6 text-green-500 mx-auto mb-1" />
                    <p className="text-xs font-semibold text-green-700">ID Verified</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <Shield className="h-6 w-6 text-blue-500 mx-auto mb-1" />
                    <p className="text-xs font-semibold text-blue-700">Background Checked</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <Award className="h-6 w-6 text-purple-500 mx-auto mb-1" />
                    <p className="text-xs font-semibold text-purple-700">Skills Certified</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3 text-center">
                    <Heart className="h-6 w-6 text-orange-500 mx-auto mb-1" />
                    <p className="text-xs font-semibold text-orange-700">Insured</p>
                  </div>
                </div>

                {/* Rating */}
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">4.9 out of 5 (127 reviews)</p>
                </div>
              </div>

              {/* Floating Verification Icons */}
              <div className="absolute -top-4 -right-4 bg-green-500 text-white rounded-full p-3 shadow-lg">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-blue-500 text-white rounded-full p-3 shadow-lg">
                <Shield className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>


      </div>
    </section>
  );
}