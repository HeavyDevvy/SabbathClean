import { Calendar, UserCheck, Settings, CheckCircle } from "lucide-react";

export default function HowItWorksSection() {
  const steps = [
    {
      icon: Calendar,
      title: "Select Service",
      description: "Simply select the service you need from our comprehensive range of home services."
    },
    {
      icon: UserCheck,
      title: "Get Matched",
      description: "We will match you with your Berry Star - a verified, experienced professional."
    },
    {
      icon: Settings,
      title: "Manage Booking",
      description: "Manage your booking on the App or online with real-time updates."
    },
    {
      icon: CheckCircle,
      title: "Enjoy Results",
      description: "Sit back and enjoy professional service delivered to your satisfaction."
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-blue-600 tracking-wide uppercase mb-3">
            HOW IT WORKS
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Getting your home in order has never been easier.
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Simply select the service you need, and we will match you with your Berry Star. Manage your booking on the App or online.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div 
                key={index} 
                className="text-center group"
                data-testid={`how-it-works-step-${index + 1}`}
              >
                {/* Step Number */}
                <div className="relative mb-6">
                  <div className="w-16 h-16 mx-auto bg-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-700 transition-colors duration-300">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                  </div>
                </div>

                {/* Step Content */}
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Connecting Lines for Desktop */}
        <div className="hidden lg:block relative -mt-24 mb-16">
          <div className="absolute top-8 left-1/4 right-1/4 flex justify-between">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-24 h-0.5 bg-blue-200 mt-8"
                style={{ marginLeft: i === 1 ? '4rem' : '0', marginRight: i === 3 ? '4rem' : '0' }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}