import { Shield, Star, UserCheck, FileCheck } from "lucide-react";

export default function TrustSafetySection() {
  const trustFeatures = [
    {
      icon: Star,
      title: "Ratings and reviews",
      subtitle: "from other users.",
      description: "Every Berry Star is rated and reviewed by customers, ensuring transparency and quality."
    },
    {
      icon: FileCheck,
      title: "Reference and background checks",
      subtitle: "are completed.",
      description: "Comprehensive background verification including identity, criminal, and reference checks."
    },
    {
      icon: UserCheck,
      title: "2+ years work experience",
      subtitle: "is needed before joining.",
      description: "All our professionals have proven experience and expertise in their service areas."
    },
    {
      icon: Shield,
      title: "Insurance policy in place",
      subtitle: "for customer peace of mind.",
      description: "Full insurance coverage protects both customers and service providers during every booking."
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Safety and security is our top priority.
          </h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto">
            We connect you to hardworking, trusted individuals who are experienced, vetted, rated and dependable.
          </p>
        </div>

        {/* Trust Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {trustFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="text-center group hover:bg-gray-50 p-6 rounded-2xl transition-all duration-300"
                data-testid={`trust-feature-${index + 1}`}
              >
                {/* Feature Icon */}
                <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-300">
                  <Icon className="h-10 w-10 text-blue-600" />
                </div>

                {/* Feature Content */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm font-medium text-gray-600">
                    {feature.subtitle}
                  </p>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Trust Stats */}
        <div className="mt-16 bg-blue-50 rounded-2xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2" data-testid="stat-verified-professionals">
                1,500+
              </div>
              <p className="text-gray-700 font-medium">Verified Professionals</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2" data-testid="stat-background-checks">
                100%
              </div>
              <p className="text-gray-700 font-medium">Background Checked</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2" data-testid="stat-insurance-coverage">
              R1M+
              </div>
              <p className="text-gray-700 font-medium">Insurance Coverage</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}