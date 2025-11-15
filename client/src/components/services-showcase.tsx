import cleanerImage from "@assets/stock_images/professional_female__eea5c596.jpg";
import gardenerImage from "@assets/stock_images/professional_gardene_faa8644c.jpg";
import chefImage from "@assets/stock_images/professional_chef_pr_8541400e.jpg";
import happyCustomerImage from "@assets/stock_images/happy_customer_satis_75fa5d88.jpg";

export default function ServicesShowcase() {
  const showcaseItems = [
    {
      title: "House Cleaning",
      description: "Professional cleaning services for your home",
      image: cleanerImage,
    },
    {
      title: "Garden Care",
      description: "Expert garden maintenance and landscaping",
      image: gardenerImage,
    },
    {
      title: "Chef & Catering",
      description: "Delicious meals prepared by expert chefs",
      image: chefImage,
    },
    {
      title: "Trusted by Thousands",
      description: "Join our satisfied customers across South Africa",
      image: happyCustomerImage,
    },
  ];

  return (
    <section className="py-16 lg:py-24" style={{ backgroundColor: '#F7F2EF' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4" style={{ color: '#44062D' }}>
            Real people, real service
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: '#3C0920' }}>
            Our verified professionals are ready to help with all your home service needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {showcaseItems.map((item, index) => (
            <div key={index} className="group">
              <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-md mb-4">
                <img 
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#44062D' }}>
                {item.title}
              </h3>
              <p className="text-sm" style={{ color: '#3C0920' }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
