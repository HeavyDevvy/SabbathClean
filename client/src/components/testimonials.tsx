import { Star } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      id: 1,
      rating: 5,
      comment: "Amazing service! Maria cleaned my entire house in 3 hours and it looked spotless. The booking process was so easy and she arrived exactly on time.",
      customerName: "Jennifer Adams",
      location: "Cape Town",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
    },
    {
      id: 2,
      rating: 5,
      comment: "James fixed my plumbing issue same day I booked. Professional, reliable, and reasonably priced. Definitely using Berry again!",
      customerName: "Michael Thompson", 
      location: "Johannesburg",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
    },
    {
      id: 3,
      rating: 5,
      comment: "The deep cleaning service before my move-in was incredible. Sarah was thorough, professional, and the house was immaculate. Highly recommend!",
      customerName: "Lisa Rodriguez",
      location: "Durban", 
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b588?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">What Our Customers Say</h2>
          <p className="mt-4 text-lg text-neutral">Join thousands of satisfied customers who trust Berry</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white rounded-2xl p-8 shadow-lg" data-testid={`card-testimonial-${testimonial.id}`}>
              <div className="flex items-center mb-4">
                <div className="flex text-accent">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-neutral mb-6">{testimonial.comment}</p>
              <div className="flex items-center">
                <img 
                  src={testimonial.avatar} 
                  alt={`${testimonial.customerName} testimonial`}
                  className="w-12 h-12 rounded-full object-cover" 
                />
                <div className="ml-4">
                  <div className="font-semibold text-gray-900">{testimonial.customerName}</div>
                  <div className="text-sm text-neutral">{testimonial.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
