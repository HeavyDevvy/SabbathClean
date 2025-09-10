import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { 
  HelpCircle, 
  MessageSquare, 
  Search, 
  ChevronDown, 
  Phone, 
  Mail, 
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  BookOpen,
  Headphones
} from "lucide-react";

export default function Support() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  // FAQ data
  const faqs = [
    {
      id: 'booking',
      category: 'Booking',
      question: 'How do I book a service?',
      answer: 'You can book a service by browsing our services page, selecting your desired service, filling in your details and location, and confirming your booking. Payment is processed securely through Berry Events Bank.'
    },
    {
      id: 'payment',
      category: 'Payment',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, debit cards, and bank transfers through our secure Berry Events Bank payment system. All payments are protected with escrow-style security.'
    },
    {
      id: 'cancellation',
      category: 'Booking',
      question: 'Can I cancel or reschedule my booking?',
      answer: 'Yes, you can cancel or reschedule your booking up to 24 hours before the scheduled time without any fees. Cancellations within 24 hours may incur a small cancellation fee.'
    },
    {
      id: 'providers',
      category: 'Providers',
      question: 'How are service providers verified?',
      answer: 'All our providers go through a comprehensive verification process including ID verification, background checks, skill assessments, and customer reviews. We only work with trusted professionals.'
    },
    {
      id: 'pricing',
      category: 'Pricing',
      question: 'How is pricing determined?',
      answer: 'Our pricing is competitive and transparent. Costs vary based on service type, duration, location, and any special requirements. You\'ll see the full price breakdown before confirming your booking.'
    },
    {
      id: 'emergency',
      category: 'Emergency',
      question: 'Do you offer emergency services?',
      answer: 'Yes, we offer 24/7 emergency services for plumbing and electrical issues. Call our emergency hotline at 0800 237 779 for immediate assistance.'
    },
    {
      id: 'quality',
      category: 'Service Quality',
      question: 'What if I\'m not satisfied with the service?',
      answer: 'Your satisfaction is our priority. If you\'re not happy with the service, contact us within 24 hours and we\'ll work with you to resolve the issue, including potential refunds or re-service.'
    },
    {
      id: 'account',
      category: 'Account',
      question: 'How do I update my account information?',
      answer: 'You can update your account information by going to your profile page after logging in. You can change your contact details, address, and payment methods there.'
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = Array.from(new Set(faqs.map(faq => faq.category)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Support Center
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to your questions, get help with your bookings, 
            and connect with our support team.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Contact Support</h3>
              <p className="text-gray-600 mb-4">Get direct help from our support team</p>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => window.location.href = '/contact'}
                data-testid="button-contact-support"
              >
                Contact Us
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                <Phone className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Emergency Line</h3>
              <p className="text-gray-600 mb-4">24/7 emergency support available</p>
              <Button 
                variant="outline" 
                className="w-full border-green-600 text-green-600 hover:bg-green-50"
                onClick={() => window.location.href = 'tel:0800237779'}
                data-testid="button-emergency-call"
              >
                Call 0800 237 779
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Help Center</h3>
              <p className="text-gray-600 mb-4">Browse guides and tutorials</p>
              <Button 
                variant="outline" 
                className="w-full border-purple-600 text-purple-600 hover:bg-purple-50"
                onClick={() => window.location.href = '/help'}
                data-testid="button-help-center"
              >
                Browse Help
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-6 w-6 text-blue-600" />
              Frequently Asked Questions
            </CardTitle>
            
            {/* Search */}
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search FAQs..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-faq-search"
              />
            </div>

            {/* Category filters */}
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge 
                variant={searchQuery === '' ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSearchQuery('')}
                data-testid="filter-all"
              >
                All
              </Badge>
              {categories.map(category => (
                <Badge 
                  key={category}
                  variant="outline"
                  className="cursor-pointer hover:bg-blue-50"
                  onClick={() => setSearchQuery(category)}
                  data-testid={`filter-${category.toLowerCase()}`}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </CardHeader>
          
          <CardContent>
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-8">
                <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No FAQs found matching your search.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setSearchQuery('')}
                  data-testid="button-clear-search"
                >
                  Clear Search
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFaqs.map((faq) => (
                  <Collapsible 
                    key={faq.id} 
                    open={expandedFaq === faq.id}
                    onOpenChange={(open) => setExpandedFaq(open ? faq.id : null)}
                  >
                    <CollapsibleTrigger asChild>
                      <div 
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        data-testid={`faq-${faq.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs">
                            {faq.category}
                          </Badge>
                          <h3 className="font-medium text-left">{faq.question}</h3>
                        </div>
                        <ChevronDown className={`h-4 w-4 transition-transform ${expandedFaq === faq.id ? 'rotate-180' : ''}`} />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="p-4 pt-0">
                        <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Options */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Headphones className="h-6 w-6 text-blue-600" />
                Still Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Can't find what you're looking for? Our support team is here to help you with any questions or issues.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Average response time: 2 hours</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">24/7 emergency support available</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Multiple contact methods</span>
                </div>
              </div>

              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => window.location.href = '/contact'}
                data-testid="button-get-help"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Get Personal Help
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-green-600" />
                Community & Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Explore our help resources and connect with the Berry Events community.
              </p>
              
              <div className="space-y-3">
                <a 
                  href="/help" 
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  data-testid="link-help-guides"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-purple-600" />
                    <span>Help Guides</span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </a>
                
                <a 
                  href="/safety" 
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  data-testid="link-safety-info"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Safety Information</span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </a>
                
                <a 
                  href="/feedback" 
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  data-testid="link-feedback"
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <span>Send Feedback</span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}