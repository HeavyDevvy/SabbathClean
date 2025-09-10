import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Phone, 
  FileText,
  Users,
  Lock,
  Eye,
  Star,
  MessageSquare,
  ExternalLink,
  Home,
  CreditCard,
  UserCheck
} from "lucide-react";

export default function Safety() {
  const safetyFeatures = [
    {
      icon: <UserCheck className="h-12 w-12 text-blue-600" />,
      title: "Provider Verification",
      description: "All service providers undergo comprehensive background checks, ID verification, and skill assessments before joining our platform."
    },
    {
      icon: <Star className="h-12 w-12 text-yellow-500" />,
      title: "Ratings & Reviews",
      description: "Real customer reviews and ratings help you make informed decisions. All reviews are verified from actual service bookings."
    },
    {
      icon: <CreditCard className="h-12 w-12 text-green-600" />,
      title: "Secure Payments",
      description: "All payments are processed securely through Berry Events Bank with escrow protection and fraud monitoring."
    },
    {
      icon: <Shield className="h-12 w-12 text-purple-600" />,
      title: "Insurance Coverage",
      description: "All services are covered by liability insurance to protect you and your property during service delivery."
    }
  ];

  const safetyTips = [
    {
      category: "Before Service",
      tips: [
        "Verify the provider's identity when they arrive using our app",
        "Ensure the provider has the correct booking details and service requirements",
        "Secure valuable items and important documents",
        "Inform someone you trust about the scheduled service"
      ]
    },
    {
      category: "During Service", 
      tips: [
        "Stay home during the service when possible",
        "Provide clear instructions and access to necessary areas only",
        "Monitor the service progress through our live tracking feature",
        "Ask questions if you're unsure about any procedures"
      ]
    },
    {
      category: "After Service",
      tips: [
        "Inspect the completed work before confirming completion",
        "Leave honest feedback and ratings for future customers",
        "Report any issues or concerns immediately through our app",
        "Keep your receipt and service documentation"
      ]
    }
  ];

  const emergencyInfo = [
    {
      type: "Emergency Services",
      description: "For urgent plumbing or electrical emergencies",
      contact: "0800 237 779",
      available: "24/7"
    },
    {
      type: "General Support",
      description: "For non-emergency questions or concerns",
      contact: "support@berryevents.co.za",
      available: "Mon-Sun 8AM-8PM"
    },
    {
      type: "Safety Concerns",
      description: "Report safety issues or suspicious activity",
      contact: "safety@berryevents.co.za",
      available: "Immediate response"
    }
  ];

  const reportingProcess = [
    {
      step: "1",
      title: "Immediate Safety",
      description: "If you feel unsafe, contact local emergency services immediately (10111 for police, 10177 for ambulance)."
    },
    {
      step: "2", 
      title: "Report to Berry Events",
      description: "Use our app or website to report the incident with details, photos, and any relevant information."
    },
    {
      step: "3",
      title: "Investigation",
      description: "Our safety team will investigate within 24 hours and take appropriate action including provider suspension if needed."
    },
    {
      step: "4",
      title: "Follow-up",
      description: "We'll keep you informed throughout the process and implement measures to prevent similar incidents."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Trust & Safety
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your safety and security are our top priorities. Learn about our 
            comprehensive safety measures and how we protect our community.
          </p>
        </div>

        {/* Emergency Alert */}
        <Alert className="mb-12 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Emergency:</strong> If you're in immediate danger, call local emergency services first (10111 for police, 10177 for ambulance), 
            then contact our emergency hotline at <strong>0800 237 779</strong>.
          </AlertDescription>
        </Alert>

        {/* Safety Features */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            How We Keep You Safe
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {safetyFeatures.map((feature, index) => (
              <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow text-center">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Safety Tips */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Safety Tips for Home Services
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {safetyTips.map((category, index) => (
              <Card key={index} className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {category.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-600">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Provider Verification Process */}
        <section className="mb-16">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-center justify-center">
                <Shield className="h-6 w-6 text-blue-600" />
                Our Provider Verification Process
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">Document Verification</h4>
                  <p className="text-gray-600 text-sm">ID verification, business registration, and professional certifications</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">Background Checks</h4>
                  <p className="text-gray-600 text-sm">Criminal background screening and reference verification</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="h-8 w-8 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">Skill Assessment</h4>
                  <p className="text-gray-600 text-sm">Practical skill tests and service quality evaluations</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="h-8 w-8 text-yellow-600" />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">Ongoing Monitoring</h4>
                  <p className="text-gray-600 text-sm">Continuous performance tracking and customer feedback review</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Emergency Contacts */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Emergency Contacts
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {emergencyInfo.map((info, index) => (
              <Card key={index} className="shadow-lg">
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{info.type}</h3>
                  <p className="text-gray-600 mb-4">{info.description}</p>
                  <div className="space-y-2">
                    <div className="font-semibold text-lg text-blue-600">{info.contact}</div>
                    <Badge variant="outline">{info.available}</Badge>
                  </div>
                  {info.contact.includes('@') ? (
                    <Button 
                      className="mt-4 w-full" 
                      variant="outline"
                      onClick={() => window.location.href = `mailto:${info.contact}`}
                      data-testid={`button-email-${info.type.toLowerCase().replace(' ', '-')}`}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Email
                    </Button>
                  ) : (
                    <Button 
                      className="mt-4 w-full" 
                      variant="outline"
                      onClick={() => window.location.href = `tel:${info.contact}`}
                      data-testid={`button-call-${info.type.toLowerCase().replace(' ', '-')}`}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call Now
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Reporting Process */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            How to Report Safety Concerns
          </h2>
          
          <div className="space-y-6">
            {reportingProcess.map((step, index) => (
              <Card key={index} className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                        {step.step}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Resources Section */}
        <section className="mb-16">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-center">Additional Safety Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-lg mb-4">Safety Guidelines</h4>
                  <ul className="space-y-2">
                    <li>
                      <a href="/help" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Help Center - Safety Tips
                      </a>
                    </li>
                    <li>
                      <a href="/contact" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Report a Safety Issue
                      </a>
                    </li>
                    <li>
                      <a href="/support" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Support Center
                      </a>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-lg mb-4">Emergency Services</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-red-600" />
                      <span>Police: <strong>10111</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-red-600" />
                      <span>Ambulance: <strong>10177</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-orange-600" />
                      <span>Fire: <strong>10177</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-blue-600" />
                      <span>Berry Events Emergency: <strong>0800 237 779</strong></span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <Card className="shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Your Safety Is Our Priority</h3>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                We're committed to maintaining the highest safety standards. 
                If you have questions or concerns, don't hesitate to contact us.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  className="bg-white text-blue-600 hover:bg-gray-100"
                  onClick={() => window.location.href = '/contact'}
                  data-testid="button-contact-safety"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Safety Team
                </Button>
                <Button 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-blue-600"
                  onClick={() => window.location.href = '/help'}
                  data-testid="button-safety-help"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Safety Help Center
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}