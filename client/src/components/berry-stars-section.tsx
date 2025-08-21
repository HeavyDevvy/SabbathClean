import { Star, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function BerryStarsSection() {
  const berryStars = [
    {
      id: 1,
      name: "Nomsa Mthembu",
      service: "House Cleaning",
      date: "15 August 2024",
      image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=400",
      rating: 4.9,
      review: "Exceptional cleaning service with attention to detail. She transformed our home completely and used eco-friendly products.",
      specialties: ["Deep Cleaning", "Kitchen Specialist", "Eco-Friendly"],
      experience: "5+ years",
      location: "Johannesburg",
      completed: 127
    },
    {
      id: 2,
      name: "Thabo Mokoena",
      service: "Plumbing Services",
      date: "12 August 2024", 
      image: "https://images.unsplash.com/photo-1600486913747-55e5470d6f40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=400",
      rating: 4.8,
      review: "Professional plumber who fixed our emergency leak quickly. Available 24/7 and very knowledgeable about South African plumbing standards.",
      specialties: ["Emergency Repairs", "Installation", "24/7 Service"],
      experience: "7+ years",
      location: "Cape Town",
      completed: 89
    },
    {
      id: 3,
      name: "Lerato Ndaba",
      service: "Chef & Catering",
      date: "10 August 2024",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=400", 
      rating: 5.0,
      review: "Outstanding chef who prepared authentic South African dishes for our family celebration. The flavors were incredible!",
      specialties: ["African Cuisine", "Event Catering", "Traditional Recipes"],
      experience: "6+ years",
      location: "Durban",
      completed: 156
    },
    {
      id: 4,
      name: "Sipho Khumalo",
      service: "Garden Care",
      date: "08 August 2024",
      image: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=400", 
      rating: 4.7,
      review: "Expert landscaper who specializes in indigenous plants. Created a beautiful water-wise garden that thrives in our climate.",
      specialties: ["Indigenous Plants", "Water-wise Gardens", "Landscaping"],
      experience: "8+ years",
      location: "Pretoria",
      completed: 203
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {berryStars.map((star) => (
            <div key={star.id} className="group">
              <Card 
                className="overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 bg-white border-0 shadow-lg hover:scale-105"
                data-testid={`berry-star-${star.id}`}
              >
                <CardContent className="p-0">
                  {/* Professional Profile Section */}
                  <div className="relative bg-gradient-to-br from-blue-50 via-purple-50 to-teal-50 p-6 text-center">
                    <div className="w-20 h-20 mx-auto mb-4 relative">
                      <img 
                        src={star.image}
                        alt={`${star.name} - ${star.service} specialist`}
                        className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg"
                      />
                      {/* Verification Badge */}
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{star.name}</h3>
                    <p className="text-blue-600 font-semibold text-sm uppercase tracking-wide mb-2">{star.service}</p>
                    <div className="flex items-center justify-center space-x-2 text-xs text-gray-600">
                      <span className="bg-white bg-opacity-80 px-2 py-1 rounded-full">{star.experience}</span>
                      <span className="bg-white bg-opacity-80 px-2 py-1 rounded-full">{star.location}</span>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6">
                    {/* Rating and Stats */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < Math.floor(star.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                        ))}
                        <span className="ml-2 font-bold text-gray-900">{star.rating}</span>
                      </div>
                      <div className="text-sm text-green-600 font-semibold">
                        {star.completed}+ jobs
                      </div>
                    </div>
                    
                    {/* Customer Review */}
                    <blockquote className="text-gray-700 text-sm leading-relaxed mb-4 italic">
                      "{star.review}"
                    </blockquote>
                    
                    {/* Specialties */}
                    <div className="border-t pt-4">
                      <div className="flex flex-wrap gap-1">
                        {star.specialties.map((specialty, index) => (
                          <span 
                            key={index}
                            className="text-xs bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 px-2 py-1 rounded-full font-medium"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Enhanced CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 rounded-3xl p-8 text-white shadow-2xl">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-3xl font-bold mb-4">
                Ready to meet your Berry Star?
              </h3>
              <p className="text-purple-100 mb-6 text-lg leading-relaxed">
                Join thousands of satisfied customers across South Africa who trust our verified professionals for exceptional home services.
              </p>
              
              {/* Trust Indicators */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
                <div className="flex items-center text-yellow-300">
                  <Star className="h-6 w-6 mr-2 fill-current" />
                  <span className="font-bold text-xl">4.8/5 Rating</span>
                </div>
                <div className="text-white font-bold text-xl">
                  1000+ Happy Customers
                </div>
                <div className="text-green-300 font-bold text-xl">
                  100% Payment Security
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-purple-600 font-bold px-8 py-3 rounded-xl hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg">
                  Book a Service
                </button>
                <button className="border-2 border-white text-white font-bold px-8 py-3 rounded-xl hover:bg-white hover:text-purple-600 transition-all duration-300 transform hover:scale-105">
                  Become a Berry Star
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}