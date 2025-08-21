import { Star, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function BerryStarsSection() {
  const berryStars = [
    {
      id: 1,
      name: "Nomsa Mthembu",
      service: "Indoor Cleaning",
      date: "15 August 2024",
      image: "https://images.unsplash.com/photo-1494790108755-2616c96955f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      rating: 4.9,
      review: "Loved her professional attitude, pleasant disposition and thorough cleaning. Every corner was spotless!",
      specialties: ["Deep Cleaning", "Kitchen Specialist", "Eco-Friendly"],
      experience: "5+ years"
    },
    {
      id: 2,
      name: "Thabo Kgomo",
      service: "Outdoor Services",
      date: "12 August 2024", 
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      rating: 4.8,
      review: "He worked professionally and thoroughly with a wonderful attitude. My garden looks amazing now!",
      specialties: ["Garden Maintenance", "Pool Cleaning", "Pressure Washing"],
      experience: "7+ years"
    },
    {
      id: 3,
      name: "Lindiwe Ndaba",
      service: "Indoor Cleaning",
      date: "10 August 2024",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150", 
      rating: 5.0,
      review: "So much effort, she even cleaned the mirrors. Our fridge looks amazing again! Outstanding attention to detail.",
      specialties: ["Detail Cleaning", "Appliance Care", "Organization"],
      experience: "4+ years"
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Meet some of your Berry Stars.
          </h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto">
            From laundry to dishes; from garage cleaning to car washing, and your garden in between – we've got you covered! 
            They're experienced, vetted and rated – ready to take care of your home.
          </p>
        </div>

        {/* Berry Stars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {berryStars.map((star) => (
            <Card 
              key={star.id}
              className="overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white border-0 shadow-md"
              data-testid={`berry-star-${star.id}`}
            >
              <CardContent className="p-0">
                {/* Star Image */}
                <div className="relative">
                  <img 
                    src={star.image}
                    alt={`${star.name} - ${star.service} specialist`}
                    className="w-full h-48 object-cover"
                  />
                  {/* Service Badge */}
                  <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {star.service}
                  </div>
                  {/* Date Badge */}
                  <div className="absolute top-4 right-4 bg-white bg-opacity-90 text-gray-700 px-2 py-1 rounded text-xs flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {star.date}
                  </div>
                </div>

                {/* Star Info */}
                <div className="p-6">
                  {/* Name and Rating */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900">
                      {star.name}
                    </h3>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm font-semibold text-gray-700">
                        {star.rating}
                      </span>
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="mb-3">
                    <span className="text-sm text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">
                      {star.experience} experience
                    </span>
                  </div>

                  {/* Review */}
                  <blockquote className="text-gray-700 italic mb-4 leading-relaxed">
                    "{star.review}"
                  </blockquote>

                  {/* Specialties */}
                  <div className="flex flex-wrap gap-2">
                    {star.specialties.map((specialty, index) => (
                      <span 
                        key={index}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-blue-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Ready to meet your Berry Star?
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust Berry Events for all their home service needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                Book a Service
              </button>
              <button className="border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white hover:text-blue-600 transition-all duration-200">
                Become a Berry Star
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}