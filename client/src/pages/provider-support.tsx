import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Headphones, 
  MessageSquare, 
  Phone, 
  BookOpen, 
  Users, 
  Star,
  DollarSign,
  Calendar,
  Shield,
  Award
} from "lucide-react";

export default function ProviderSupport() {
  const supportCategories = [
    {
      icon: <BookOpen className="h-8 w-8 text-blue-600" />,
      title: "Training & Certification",
      description: "Access training materials, certification programs, and skill development resources",
      link: "/provider-training"
    },
    {
      icon: <DollarSign className="h-8 w-8 text-green-600" />,
      title: "Earnings & Payments",
      description: "Understand payment schedules, commission rates, and earnings optimization",
      link: "/provider-earnings" 
    },
    {
      icon: <Star className="h-8 w-8 text-yellow-600" />,
      title: "Berry Stars Program",
      description: "Learn about our rewards program and how to earn bonuses and benefits",
      link: "/berry-stars"
    },
    {
      icon: <Shield className="h-8 w-8 text-purple-600" />,
      title: "Safety & Guidelines",
      description: "Safety protocols, service standards, and professional guidelines",
      link: "/safety"
    }
  ];

  const quickHelp = [
    {
      title: "Provider Hotline",
      description: "Dedicated support line for service providers",
      contact: "0800 PROVIDER (0800 776 8433)",
      available: "Mon-Fri 7AM-9PM"
    },
    {
      title: "Provider Email Support", 
      description: "Email support for non-urgent questions",
      contact: "providers@berryevents.co.za",
      available: "Response within 4 hours"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12 px-4" data-testid="page-provider-support">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Provider Support Center
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Dedicated support for Berry Events service providers. Get help with training, 
            earnings, technical issues, and grow your business with us.
          </p>
        </div>

        {/* Quick Contact */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {quickHelp.map((help, index) => (
            <Card key={index} className="shadow-lg">
              <CardContent className="p-6 text-center">
                <Phone className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold text-xl mb-2">{help.title}</h3>
                <p className="text-gray-600 mb-4">{help.description}</p>
                <div className="space-y-2">
                  <p className="font-semibold text-lg text-blue-600">{help.contact}</p>
                  <Badge variant="outline">{help.available}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Support Categories */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">How Can We Help You?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportCategories.map((category, index) => (
              <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    {category.icon}
                  </div>
                  <h3 className="font-semibold text-lg mb-3">{category.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.location.href = category.link}
                    data-testid={`button-${category.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Resources */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-8">Provider Resources</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">1</span>
                  </div>
                  <span>Complete your provider profile</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">2</span>
                  </div>
                  <span>Complete training modules</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">3</span>
                  </div>
                  <span>Get verified and start earning</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/contact'}
                  data-testid="button-contact-provider-support"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Provider Support
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/provider-training'}
                  data-testid="button-provider-training"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Training Center
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/provider-dashboard'}
                  data-testid="button-provider-dashboard"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Provider Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}