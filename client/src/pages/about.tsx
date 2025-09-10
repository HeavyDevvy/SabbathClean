import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Heart, 
  Shield, 
  Star, 
  Award, 
  CheckCircle, 
  MapPin,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Zap
} from "lucide-react";

export default function About() {
  const stats = [
    { icon: <Users className="h-8 w-8" />, value: "10,000+", label: "Happy Customers" },
    { icon: <Star className="h-8 w-8" />, value: "500+", label: "Verified Providers" },
    { icon: <CheckCircle className="h-8 w-8" />, value: "50,000+", label: "Services Completed" },
    { icon: <Award className="h-8 w-8" />, value: "4.9/5", label: "Average Rating" }
  ];

  const values = [
    {
      icon: <Shield className="h-12 w-12 text-blue-600" />,
      title: "Trust & Safety",
      description: "Every service provider is thoroughly vetted with background checks, skill assessments, and continuous monitoring to ensure your safety and peace of mind."
    },
    {
      icon: <Heart className="h-12 w-12 text-red-500" />,
      title: "Quality First",
      description: "We're committed to delivering exceptional service quality. Our rigorous training programs and customer feedback systems ensure consistently high standards."
    },
    {
      icon: <Zap className="h-12 w-12 text-yellow-500" />,
      title: "Innovation",
      description: "We leverage cutting-edge technology to make home services more accessible, efficient, and convenient for both customers and service providers."
    },
    {
      icon: <Users className="h-12 w-12 text-green-600" />,
      title: "Community",
      description: "We believe in building strong communities by connecting neighbors with trusted local service providers and supporting local economic growth."
    }
  ];

  const teamMembers = [
    {
      name: "Sarah Johnson",
      role: "Chief Executive Officer",
      description: "Former operations director at leading South African service companies. Passionate about transforming home services through technology.",
      image: "👩‍💼"
    },
    {
      name: "Michael Chen",
      role: "Chief Technology Officer", 
      description: "Tech veteran with 15+ years building scalable platforms. Leads our mission to revolutionize the home services industry.",
      image: "👨‍💻"
    },
    {
      name: "Nomsa Mthembu",
      role: "Head of Provider Relations",
      description: "Community leader focused on empowering service providers with training, certification, and sustainable income opportunities.",
      image: "👩‍🏫"
    },
    {
      name: "David Williams",
      role: "Head of Customer Experience",
      description: "Customer service expert dedicated to ensuring every Berry Events experience exceeds expectations and builds lasting trust.",
      image: "👨‍💼"
    }
  ];

  const milestones = [
    { year: "2023", event: "Berry Events founded in Cape Town", description: "Started with a vision to transform home services in South Africa" },
    { year: "2023", event: "First 100 verified providers", description: "Built our initial network of trusted cleaning and maintenance professionals" },
    { year: "2024", event: "10,000 services completed", description: "Reached major milestone serving customers across major South African cities" },
    { year: "2024", event: "African cuisine specialization", description: "Launched specialized chef and catering services for authentic African cuisine" },
    { year: "2025", event: "50,000+ happy customers", description: "Expanded to become a leading home services platform across South Africa" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            About Berry Events
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            We're revolutionizing home services in South Africa by connecting customers 
            with verified, trusted professionals for all their domestic needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100"
              onClick={() => window.location.href = '/provider-onboarding'}
              data-testid="button-become-provider"
            >
              Become a Provider
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-blue-600"
              onClick={() => window.location.href = '/contact'}
              data-testid="button-contact-us"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center text-blue-600 mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                To make quality home services accessible, reliable, and affordable for every 
                South African family while empowering service providers with sustainable 
                income opportunities and professional growth.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                We believe that everyone deserves a comfortable, well-maintained home, and every 
                skilled professional deserves fair compensation and recognition for their expertise.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <span className="text-gray-700">Rigorous provider verification and training</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <span className="text-gray-700">Secure payments through Berry Events Bank</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <span className="text-gray-700">24/7 emergency support for critical services</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <span className="text-gray-700">Specialized African cuisine catering</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="shadow-lg">
                <CardContent className="p-6 text-center">
                  <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Local Focus</h3>
                  <p className="text-gray-600 text-sm">Supporting South African communities and local service providers</p>
                </CardContent>
              </Card>
              <Card className="shadow-lg">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Growth</h3>
                  <p className="text-gray-600 text-sm">Helping providers build sustainable businesses and careers</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These core values guide everything we do and shape how we serve 
              our customers and support our service providers.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-6">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Journey</h2>
            <p className="text-xl text-gray-600">
              From startup to South Africa's trusted home services platform
            </p>
          </div>
          
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    {milestone.year.slice(-2)}
                  </div>
                </div>
                <Card className="flex-1 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className="bg-blue-100 text-blue-800">{milestone.year}</Badge>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{milestone.event}</h3>
                    <p className="text-gray-600">{milestone.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Passionate professionals dedicated to transforming home services 
              and empowering communities across South Africa.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="text-6xl mb-4">{member.image}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-4">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Experience Berry Events?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust Berry Events 
            for all their home service needs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100"
              onClick={() => window.location.href = '/services'}
              data-testid="button-book-service"
            >
              Book a Service
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-blue-600"
              onClick={() => window.location.href = '/contact'}
              data-testid="button-get-in-touch"
            >
              Get in Touch
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}