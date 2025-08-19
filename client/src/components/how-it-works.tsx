import { Button } from "@/components/ui/button";

interface HowItWorksProps {
  onBookingClick: () => void;
}

export default function HowItWorks({ onBookingClick }: HowItWorksProps) {
  const steps = [
    {
      number: 1,
      title: "Choose Your Service",
      description: "Select from house cleaning, deep cleaning, maintenance, or garden care. Specify your requirements and preferred date.",
      bgColor: "bg-primary",
    },
    {
      number: 2,
      title: "Get Matched Instantly", 
      description: "Our algorithm matches you with up to 10 verified professionals in your area. View profiles, ratings, and availability.",
      bgColor: "bg-secondary",
    },
    {
      number: 3,
      title: "Enjoy Premium Service",
      description: "Your chosen professional arrives on time with all necessary supplies. Track progress and pay securely through the platform.", 
      bgColor: "bg-accent",
    },
  ];

  return (
    <section id="how-it-works" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">How Sabboath Works</h2>
          <p className="mt-4 text-lg text-neutral">Book premium domestic services in just 3 simple steps</p>
        </div>

        <div className="mt-16 lg:grid lg:grid-cols-3 lg:gap-8">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className={`flex items-center justify-center w-16 h-16 ${step.bgColor} rounded-full mx-auto mb-6`}>
                <span className="text-white text-xl font-bold">{step.number}</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{step.title}</h3>
              <p className="text-neutral">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button 
            onClick={onBookingClick}
            size="lg"
            className="bg-primary text-white hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
            data-testid="button-start-booking"
          >
            Start Your 2-Minute Booking
          </Button>
        </div>
      </div>
    </section>
  );
}
