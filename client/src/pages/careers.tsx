import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  Users, 
  TrendingUp, 
  Heart,
  Send,
  ExternalLink
} from "lucide-react";

export default function Careers() {
  const jobOpenings = [
    {
      title: "Senior Software Engineer",
      department: "Technology",
      location: "Cape Town",
      type: "Full-time",
      description: "Lead development of our platform's core features and help scale our technology to serve millions of users across South Africa."
    },
    {
      title: "Customer Success Manager", 
      department: "Customer Experience",
      location: "Johannesburg",
      type: "Full-time",
      description: "Ensure customers have exceptional experiences and help drive customer satisfaction and retention initiatives."
    },
    {
      title: "Provider Relations Specialist",
      department: "Operations",
      location: "Durban",
      type: "Full-time", 
      description: "Build relationships with service providers, manage onboarding, and support provider success and growth."
    },
    {
      title: "Marketing Coordinator",
      department: "Marketing",
      location: "Remote",
      type: "Full-time",
      description: "Drive growth through digital marketing campaigns, content creation, and community engagement initiatives."
    }
  ];

  const benefits = [
    "Competitive salary and equity package",
    "Comprehensive medical aid and life insurance",
    "Flexible working arrangements and remote options",
    "Professional development and training opportunities",
    "Annual leave and wellness days",
    "Team building and company retreats"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12 px-4" data-testid="page-careers">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Join Our Team
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Help us revolutionize home services in South Africa. Join a passionate team 
            building technology that makes a real difference in people's lives.
          </p>
        </div>

        {/* Values */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Why Work at Berry Events?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="shadow-lg text-center">
              <CardContent className="p-6">
                <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="font-bold text-xl mb-2">Make an Impact</h3>
                <p className="text-gray-600">Help millions of South Africans access quality home services while supporting local service providers.</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg text-center">
              <CardContent className="p-6">
                <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-bold text-xl mb-2">Grow Your Career</h3>
                <p className="text-gray-600">Join a fast-growing company with opportunities for professional development and career advancement.</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg text-center">
              <CardContent className="p-6">
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-bold text-xl mb-2">Amazing Team</h3>
                <p className="text-gray-600">Work with passionate, talented professionals who are committed to excellence and innovation.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Job Openings */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Current Openings</h2>
          <div className="space-y-6">
            {jobOpenings.map((job, index) => (
              <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{job.department}</Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {job.location}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {job.type}
                        </Badge>
                      </div>
                    </div>
                    <Button data-testid={`button-apply-${index}`}>
                      Apply Now
                    </Button>
                  </div>
                  <p className="text-gray-600">{job.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="mb-16">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Benefits & Perks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <section className="text-center">
          <Card className="shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Ready to Join Berry Events?</h3>
              <p className="text-blue-100 mb-6">
                Send us your CV and let's discuss how you can help transform home services in South Africa.
              </p>
              <Button 
                className="bg-white text-blue-600 hover:bg-gray-100"
                onClick={() => window.location.href = 'mailto:careers@berryevents.co.za'}
                data-testid="button-apply-careers"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Your CV
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}