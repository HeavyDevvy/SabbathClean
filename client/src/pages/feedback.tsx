import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { MessageSquare, Send, Star, Lightbulb, ThumbsUp, AlertCircle } from "lucide-react";

type FeedbackFormData = {
  name: string;
  email: string;
  feedbackType: string;
  subject: string;
  message: string;
  rating: string;
};

export default function Feedback() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FeedbackFormData>({
    name: '',
    email: '',
    feedbackType: '',
    subject: '',
    message: '',
    rating: ''
  });

  const feedbackMutation = useMutation({
    mutationFn: async (data: FeedbackFormData) => {
      const response = await fetch('/api/support/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send feedback');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Thank You for Your Feedback!",
        description: "Your feedback helps us improve Berry Events. We appreciate you taking the time to share your thoughts.",
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        feedbackType: '',
        subject: '',
        message: '',
        rating: ''
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Send Feedback",
        description: error.message || "Please try again or contact our support team.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.feedbackType || !formData.subject || !formData.message) {
      toast({
        title: "Please fill in all required fields",
        description: "Name, email, feedback type, subject, and message are required.",
        variant: "destructive"
      });
      return;
    }
    
    feedbackMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof FeedbackFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const feedbackTypes = [
    { value: 'general', label: 'General Feedback', icon: '💬' },
    { value: 'service_quality', label: 'Service Quality', icon: '⭐' },
    { value: 'app_experience', label: 'App Experience', icon: '📱' },
    { value: 'feature_request', label: 'Feature Request', icon: '💡' },
    { value: 'complaint', label: 'Complaint', icon: '⚠️' },
    { value: 'compliment', label: 'Compliment', icon: '👏' },
    { value: 'suggestion', label: 'Suggestion', icon: '🚀' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            We Value Your Feedback
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your feedback helps us improve Berry Events and provide better home services. 
            Share your thoughts, suggestions, or experiences with us.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Feedback Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                  Share Your Feedback
                </CardTitle>
                <p className="text-gray-600">
                  Tell us about your experience or suggest improvements
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                        data-testid="input-feedback-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        data-testid="input-feedback-email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="feedbackType">Feedback Type *</Label>
                    <Select value={formData.feedbackType} onValueChange={(value) => handleInputChange('feedbackType', value)}>
                      <SelectTrigger data-testid="select-feedback-type">
                        <SelectValue placeholder="Select feedback type" />
                      </SelectTrigger>
                      <SelectContent>
                        {feedbackTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.icon} {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rating">Overall Rating (Optional)</Label>
                    <Select value={formData.rating} onValueChange={(value) => handleInputChange('rating', value)}>
                      <SelectTrigger data-testid="select-feedback-rating">
                        <SelectValue placeholder="Rate your experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">⭐⭐⭐⭐⭐ Excellent</SelectItem>
                        <SelectItem value="4">⭐⭐⭐⭐ Good</SelectItem>
                        <SelectItem value="3">⭐⭐⭐ Average</SelectItem>
                        <SelectItem value="2">⭐⭐ Poor</SelectItem>
                        <SelectItem value="1">⭐ Terrible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      placeholder="Brief summary of your feedback"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      required
                      data-testid="input-feedback-subject"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Your Feedback *</Label>
                    <Textarea
                      id="message"
                      placeholder="Please share your detailed feedback, suggestions, or experiences..."
                      className="min-h-[120px]"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      required
                      data-testid="textarea-feedback-message"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={feedbackMutation.isPending}
                    data-testid="button-submit-feedback"
                  >
                    {feedbackMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Feedback
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Information */}
          <div className="space-y-6">
            {/* Why Feedback Matters */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ThumbsUp className="h-5 w-5 text-green-600" />
                  Why Your Feedback Matters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-yellow-500 mt-1" />
                  <div>
                    <p className="font-medium">Drive Innovation</p>
                    <p className="text-sm text-gray-600">Your suggestions help us develop new features and services</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Star className="h-5 w-5 text-blue-500 mt-1" />
                  <div>
                    <p className="font-medium">Improve Quality</p>
                    <p className="text-sm text-gray-600">Your experiences help us maintain high service standards</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-purple-500 mt-1" />
                  <div>
                    <p className="font-medium">Fix Issues</p>
                    <p className="text-sm text-gray-600">Your reports help us identify and resolve problems quickly</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Improvements */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Recent Improvements</CardTitle>
                <p className="text-sm text-gray-600">Based on your feedback:</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="border-l-4 border-green-500 pl-4">
                  <p className="font-medium text-sm">Improved Booking Flow</p>
                  <p className="text-xs text-gray-600">Simplified the booking process based on user feedback</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="font-medium text-sm">Better Provider Matching</p>
                  <p className="text-xs text-gray-600">Enhanced our recommendation algorithm</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <p className="font-medium text-sm">Mobile App Updates</p>
                  <p className="text-xs text-gray-600">Added live tracking and push notifications</p>
                </div>
              </CardContent>
            </Card>

            {/* Alternative Contact */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Other Ways to Reach Us</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.location.href = '/contact'}
                    data-testid="button-contact-support"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                </div>
                <div>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.location.href = '/help'}
                    data-testid="button-help-center"
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Help Center
                  </Button>
                </div>
                <div>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.location.href = 'tel:0800237779'}
                    data-testid="button-call-support"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Call 0800 237 779
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}