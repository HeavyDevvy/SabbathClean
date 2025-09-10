import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  Phone, 
  Mail, 
  ExternalLink,
  BookOpen,
  MessageSquare,
  Users,
  Zap,
  Shield,
  CreditCard,
  Home,
  Calendar,
  Star,
  CheckCircle
} from "lucide-react";

export default function Help() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  // Help articles organized by category
  const helpCategories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <Zap className="h-5 w-5" />,
      articles: [
        {
          id: 'create-account',
          title: 'How to create your Berry Events account',
          content: 'Learn how to sign up and get started with booking home services on our platform.'
        },
        {
          id: 'first-booking',
          title: 'Making your first service booking',
          content: 'Step-by-step guide to booking your first home service, from selecting a service to payment.'
        },
        {
          id: 'how-it-works',
          title: 'How Berry Events works',
          content: 'Understand our platform, how we connect you with verified service providers, and our quality guarantees.'
        }
      ]
    },
    {
      id: 'booking-services',
      title: 'Booking Services',
      icon: <Calendar className="h-5 w-5" />,
      articles: [
        {
          id: 'book-cleaning',
          title: 'Booking house cleaning services',
          content: 'Complete guide to booking professional cleaning services, pricing, and what to expect.'
        },
        {
          id: 'book-catering',
          title: 'Booking chef and catering services',
          content: 'How to book our specialized African cuisine catering services for events and daily meals.'
        },
        {
          id: 'emergency-services',
          title: 'Emergency plumbing and electrical services',
          content: 'Learn about our 24/7 emergency services for urgent plumbing and electrical issues.'
        },
        {
          id: 'modify-booking',
          title: 'Modifying or canceling bookings',
          content: 'How to reschedule, modify, or cancel your bookings and our cancellation policies.'
        }
      ]
    },
    {
      id: 'payments',
      title: 'Payments & Billing',
      icon: <CreditCard className="h-5 w-5" />,
      articles: [
        {
          id: 'payment-methods',
          title: 'Accepted payment methods',
          content: 'Overview of payment options including credit cards, debit cards, and bank transfers through Berry Events Bank.'
        },
        {
          id: 'pricing',
          title: 'Understanding pricing and fees',
          content: 'How our pricing works, what factors affect cost, and our transparent fee structure.'
        },
        {
          id: 'refunds',
          title: 'Refunds and payment protection',
          content: 'Our refund policy, payment protection through Berry Events Bank, and how to request refunds.'
        }
      ]
    },
    {
      id: 'safety',
      title: 'Trust & Safety',
      icon: <Shield className="h-5 w-5" />,
      articles: [
        {
          id: 'provider-verification',
          title: 'How we verify service providers',
          content: 'Learn about our comprehensive verification process including background checks and skill assessments.'
        },
        {
          id: 'safety-tips',
          title: 'Safety tips for home services',
          content: 'Best practices for staying safe when having service providers in your home.'
        },
        {
          id: 'insurance-coverage',
          title: 'Insurance and liability coverage',
          content: 'Understanding what insurance coverage is provided for services and how to report issues.'
        }
      ]
    },
    {
      id: 'providers',
      title: 'For Service Providers',
      icon: <Users className="h-5 w-5" />,
      articles: [
        {
          id: 'become-provider',
          title: 'How to become a service provider',
          content: 'Complete guide to joining Berry Events as a verified service provider.'
        },
        {
          id: 'provider-training',
          title: 'Provider training and certification',
          content: 'Overview of our training programs and certification requirements for different services.'
        },
        {
          id: 'earnings',
          title: 'Understanding provider earnings',
          content: 'How provider payments work, commission structure, and payment schedules.'
        }
      ]
    }
  ];

  // Quick help options
  const quickHelpOptions = [
    {
      icon: <MessageSquare className="h-6 w-6 text-blue-600" />,
      title: 'Contact Support',
      description: 'Get help from our support team',
      action: '/contact',
      actionText: 'Contact Us'
    },
    {
      icon: <Phone className="h-6 w-6 text-green-600" />,
      title: 'Emergency Line',
      description: 'Call for urgent plumbing/electrical help',
      action: 'tel:0800237779',
      actionText: 'Call Now'
    },
    {
      icon: <Mail className="h-6 w-6 text-purple-600" />,
      title: 'Email Support',
      description: 'Email us your questions',
      action: 'mailto:support@berryevents.co.za',
      actionText: 'Send Email'
    }
  ];

  const allArticles = helpCategories.flatMap(category => 
    category.articles.map(article => ({ ...article, categoryTitle: category.title }))
  );

  const filteredArticles = searchQuery 
    ? allArticles.filter(article => 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.categoryTitle.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Help Center
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to your questions, learn how to use Berry Events, 
            and get the most out of our home services platform.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search help articles..."
              className="pl-12 pr-4 py-4 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-help-search"
            />
          </div>
        </div>

        {/* Search Results */}
        {searchQuery && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">
              Search Results ({filteredArticles.length})
            </h2>
            {filteredArticles.length === 0 ? (
              <Card className="text-center py-8">
                <CardContent>
                  <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No help articles found matching your search.</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setSearchQuery('')}
                    data-testid="button-clear-search"
                  >
                    Clear Search
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredArticles.map((article) => (
                  <Card key={article.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline">{article.categoryTitle}</Badge>
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{article.title}</h3>
                      <p className="text-gray-600">{article.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick Help Options - Only show when not searching */}
        {!searchQuery && (
          <>
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {quickHelpOptions.map((option, index) => (
                <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-200 transition-colors">
                      {option.icon}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{option.title}</h3>
                    <p className="text-gray-600 mb-4">{option.description}</p>
                    <Button 
                      className="w-full"
                      onClick={() => window.location.href = option.action}
                      data-testid={`button-${option.title.toLowerCase().replace(' ', '-')}`}
                    >
                      {option.actionText}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Help Categories */}
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-center text-gray-900">
                Browse Help Topics
              </h2>
              
              {helpCategories.map((category) => (
                <Card key={category.id} className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      {category.icon}
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {category.articles.map((article) => (
                        <div 
                          key={article.id}
                          className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          data-testid={`article-${article.id}`}
                        >
                          <h4 className="font-medium text-lg mb-2">{article.title}</h4>
                          <p className="text-gray-600 text-sm">{article.content}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Still Need Help Section */}
            <Card className="shadow-lg mt-12">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Still Need Help?</h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Can't find what you're looking for? Our support team is here to help you 
                  with any questions about Berry Events services.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => window.location.href = '/contact'}
                    data-testid="button-contact-support"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => window.location.href = '/support'}
                    data-testid="button-support-center"
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Support Center
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}