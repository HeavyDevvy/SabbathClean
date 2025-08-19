import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddressInput from "@/components/address-input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, ArrowRight, Upload, CheckCircle, User, FileText, Camera, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

const providerSchema = z.object({
  // Personal Information
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  
  // Professional Information
  bio: z.string().min(50, "Bio must be at least 50 characters"),
  hourlyRate: z.string().min(1, "Please set your hourly rate"),
  servicesOffered: z.array(z.string()).min(1, "Please select at least one service"),
  experience: z.string().min(1, "Please select your experience level"),
  
  // Location & Availability
  location: z.string().min(5, "Please enter your service location"),
  availability: z.object({
    monday: z.array(z.string()).optional(),
    tuesday: z.array(z.string()).optional(),
    wednesday: z.array(z.string()).optional(),
    thursday: z.array(z.string()).optional(),
    friday: z.array(z.string()).optional(),
    saturday: z.array(z.string()).optional(),
    sunday: z.array(z.string()).optional(),
  }),
  
  // Verification Documents
  profileImage: z.string().optional(),
  idDocument: z.string().optional(),
  qualificationCertificate: z.string().optional(),
  
  // Legal & Insurance
  hasInsurance: z.boolean(),
  backgroundCheckConsent: z.boolean(),
  termsAccepted: z.boolean().refine(val => val === true, "You must accept the terms and conditions"),
});

type ProviderFormData = z.infer<typeof providerSchema>;

const serviceCategories = [
  {
    category: "Cleaning Services",
    services: [
      { id: "house-cleaning", name: "House Cleaning" },
      { id: "deep-cleaning", name: "Deep Cleaning" },
    ]
  },
  {
    category: "Maintenance & Repairs",
    services: [
      { id: "plumbing", name: "Plumbing Services" },
      { id: "electrical", name: "Electrical Services" },
    ]
  },
  {
    category: "Food & Event Services",
    services: [
      { id: "chef-catering", name: "Chef & Catering" },
      { id: "waitering", name: "Waitering Services" },
    ]
  },
  {
    category: "Outdoor Services",
    services: [
      { id: "gardening", name: "Garden Care" },
    ]
  }
];

const timeSlots = [
  "8:00", "9:00", "10:00", "11:00", "12:00", "13:00", 
  "14:00", "15:00", "16:00", "17:00", "18:00"
];

export default function ProviderOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<{[key: string]: string}>({});
  const { toast } = useToast();

  const form = useForm<ProviderFormData>({
    resolver: zodResolver(providerSchema),
    defaultValues: {
      servicesOffered: [],
      availability: {},
      hasInsurance: false,
      backgroundCheckConsent: false,
      termsAccepted: false,
    },
  });

  const createProviderMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/providers", data),
    onSuccess: () => {
      toast({
        title: "Application Submitted!",
        description: "We'll review your application and get back to you within 24 hours.",
      });
      // Redirect to success page or home
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (file: File, field: string) => {
    // In a real app, this would upload to object storage
    // For now, we'll simulate the upload
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock URL - in real app would be from object storage
      const mockUrl = `/uploads/${field}/${Date.now()}-${file.name}`;
      setUploadedFiles(prev => ({ ...prev, [field]: mockUrl }));
      
      toast({
        title: "File Uploaded",
        description: `${file.name} has been uploaded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Please try uploading the file again.",
        variant: "destructive",
      });
    }
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (data: ProviderFormData) => {
    const providerData = {
      ...data,
      profileImage: uploadedFiles.profileImage,
      idDocument: uploadedFiles.idDocument,
      qualificationCertificate: uploadedFiles.qualificationCertificate,
    };
    
    createProviderMutation.mutate(providerData);
  };

  const progressPercentage = (currentStep / 4) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Join Berry Events</h1>
          <p className="mt-2 text-lg text-neutral">Become one of our trusted home experts</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-primary">Step {currentStep} of 4</span>
            <span className="text-sm text-neutral">Estimated completion: 10 minutes</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <Card>
            <CardContent className="p-8">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-6" data-testid="step-personal-info">
                  <div className="flex items-center mb-6">
                    <User className="h-6 w-6 text-primary mr-3" />
                    <h2 className="text-2xl font-semibold text-gray-900">Personal Information</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        {...form.register("firstName")}
                        placeholder="John"
                        data-testid="input-first-name"
                      />
                      {form.formState.errors.firstName && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.firstName.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        {...form.register("lastName")}
                        placeholder="Doe"
                        data-testid="input-last-name"
                      />
                      {form.formState.errors.lastName && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.lastName.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        {...form.register("email")}
                        placeholder="john.doe@example.com"
                        data-testid="input-email"
                      />
                      {form.formState.errors.email && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        {...form.register("phone")}
                        placeholder="+27 123 456 7890"
                        data-testid="input-phone"
                      />
                      {form.formState.errors.phone && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.phone.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="location">Service Location *</Label>
                    <AddressInput
                      value={form.watch("location") || ""}
                      onChange={(location) => form.setValue("location", location)}
                      placeholder="Cape Town, Western Cape"
                    />
                    {form.formState.errors.location && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.location.message}</p>
                    )}
                  </div>

                  <Button 
                    type="button" 
                    onClick={nextStep}
                    disabled={!form.watch("firstName") || !form.watch("lastName") || !form.watch("email") || !form.watch("phone")}
                    data-testid="button-step1-continue"
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Step 2: Professional Information */}
              {currentStep === 2 && (
                <div className="space-y-6" data-testid="step-professional-info">
                  <div className="flex items-center mb-6">
                    <FileText className="h-6 w-6 text-primary mr-3" />
                    <h2 className="text-2xl font-semibold text-gray-900">Professional Information</h2>
                  </div>
                  
                  <div>
                    <Label htmlFor="bio">Professional Bio *</Label>
                    <Textarea
                      id="bio"
                      {...form.register("bio")}
                      placeholder="Tell us about your experience, skills, and what makes you great at what you do..."
                      className="min-h-[100px]"
                      data-testid="textarea-bio"
                    />
                    <p className="text-xs text-neutral mt-1">Minimum 50 characters</p>
                    {form.formState.errors.bio && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.bio.message}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="hourlyRate">Hourly Rate (ZAR) *</Label>
                      <Input
                        id="hourlyRate"
                        {...form.register("hourlyRate")}
                        placeholder="450"
                        type="number"
                        data-testid="input-hourly-rate"
                      />
                      {form.formState.errors.hourlyRate && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.hourlyRate.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="experience">Experience Level *</Label>
                      <Select onValueChange={(value) => form.setValue("experience", value)}>
                        <SelectTrigger data-testid="select-experience">
                          <SelectValue placeholder="Select experience level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner (0-2 years)</SelectItem>
                          <SelectItem value="intermediate">Intermediate (2-5 years)</SelectItem>
                          <SelectItem value="experienced">Experienced (5+ years)</SelectItem>
                          <SelectItem value="expert">Expert (10+ years)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Services You Offer *</Label>
                    <div className="space-y-4 mt-2">
                      {serviceCategories.map((category) => (
                        <div key={category.category}>
                          <h4 className="font-medium text-gray-900 mb-2">{category.category}</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {category.services.map((service) => (
                              <div key={service.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={service.id}
                                  checked={form.watch("servicesOffered")?.includes(service.id)}
                                  onCheckedChange={(checked) => {
                                    const current = form.watch("servicesOffered") || [];
                                    if (checked) {
                                      form.setValue("servicesOffered", [...current, service.id]);
                                    } else {
                                      form.setValue("servicesOffered", current.filter(id => id !== service.id));
                                    }
                                  }}
                                  data-testid={`checkbox-service-${service.id}`}
                                />
                                <Label htmlFor={service.id} className="text-sm">
                                  {service.name}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    {form.formState.errors.servicesOffered && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.servicesOffered.message}</p>
                    )}
                  </div>

                  <div className="flex space-x-4">
                    <Button type="button" variant="outline" onClick={previousStep} data-testid="button-step2-back">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button 
                      type="button" 
                      onClick={nextStep}
                      disabled={!form.watch("bio") || !form.watch("hourlyRate") || !form.watch("servicesOffered")?.length}
                      data-testid="button-step2-continue"
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Documents & Verification */}
              {currentStep === 3 && (
                <div className="space-y-6" data-testid="step-verification">
                  <div className="flex items-center mb-6">
                    <Camera className="h-6 w-6 text-primary mr-3" />
                    <h2 className="text-2xl font-semibold text-gray-900">Documents & Verification</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="profileImage">Profile Photo *</Label>
                      <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-4">
                          <input
                            type="file"
                            id="profileImage"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file, "profileImage");
                            }}
                            className="hidden"
                            data-testid="input-profile-image"
                          />
                          <label
                            htmlFor="profileImage"
                            className="cursor-pointer bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
                          >
                            Upload Profile Photo
                          </label>
                          <p className="mt-2 text-sm text-gray-500">PNG, JPG up to 10MB</p>
                        </div>
                        {uploadedFiles.profileImage && (
                          <div className="mt-4 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                            <span className="text-sm text-green-600">Profile photo uploaded</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="idDocument">ID Document *</Label>
                      <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-4">
                          <input
                            type="file"
                            id="idDocument"
                            accept="image/*,.pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file, "idDocument");
                            }}
                            className="hidden"
                            data-testid="input-id-document"
                          />
                          <label
                            htmlFor="idDocument"
                            className="cursor-pointer bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
                          >
                            Upload ID Document
                          </label>
                          <p className="mt-2 text-sm text-gray-500">ID Card, Passport, or Driver's License</p>
                        </div>
                        {uploadedFiles.idDocument && (
                          <div className="mt-4 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                            <span className="text-sm text-green-600">ID document uploaded</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="qualificationCertificate">Qualification Certificate (Optional)</Label>
                      <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-4">
                          <input
                            type="file"
                            id="qualificationCertificate"
                            accept="image/*,.pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file, "qualificationCertificate");
                            }}
                            className="hidden"
                            data-testid="input-qualification-certificate"
                          />
                          <label
                            htmlFor="qualificationCertificate"
                            className="cursor-pointer bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
                          >
                            Upload Certificate
                          </label>
                          <p className="mt-2 text-sm text-gray-500">Trade certificates, training certificates, etc.</p>
                        </div>
                        {uploadedFiles.qualificationCertificate && (
                          <div className="mt-4 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                            <span className="text-sm text-green-600">Certificate uploaded</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Button type="button" variant="outline" onClick={previousStep} data-testid="button-step3-back">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button 
                      type="button" 
                      onClick={nextStep}
                      disabled={!uploadedFiles.profileImage || !uploadedFiles.idDocument}
                      data-testid="button-step3-continue"
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Legal & Consent */}
              {currentStep === 4 && (
                <div className="space-y-6" data-testid="step-legal-consent">
                  <div className="flex items-center mb-6">
                    <Shield className="h-6 w-6 text-primary mr-3" />
                    <h2 className="text-2xl font-semibold text-gray-900">Legal & Consent</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="hasInsurance"
                        checked={form.watch("hasInsurance")}
                        onCheckedChange={(checked) => form.setValue("hasInsurance", checked as boolean)}
                        data-testid="checkbox-insurance"
                      />
                      <div>
                        <Label htmlFor="hasInsurance" className="font-medium">
                          I have public liability insurance
                        </Label>
                        <p className="text-sm text-gray-500">
                          This protects both you and your clients in case of accidents or damages.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="backgroundCheckConsent"
                        checked={form.watch("backgroundCheckConsent")}
                        onCheckedChange={(checked) => form.setValue("backgroundCheckConsent", checked as boolean)}
                        data-testid="checkbox-background-check"
                      />
                      <div>
                        <Label htmlFor="backgroundCheckConsent" className="font-medium">
                          I consent to a background check
                        </Label>
                        <p className="text-sm text-gray-500">
                          We perform background checks to ensure the safety of our customers.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="termsAccepted"
                        checked={form.watch("termsAccepted")}
                        onCheckedChange={(checked) => form.setValue("termsAccepted", checked as boolean)}
                        data-testid="checkbox-terms"
                      />
                      <div>
                        <Label htmlFor="termsAccepted" className="font-medium">
                          I accept the Terms & Conditions *
                        </Label>
                        <p className="text-sm text-gray-500">
                          By checking this box, you agree to our Terms of Service and Privacy Policy.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {form.formState.errors.termsAccepted && (
                    <p className="text-red-500 text-sm">{form.formState.errors.termsAccepted.message}</p>
                  )}

                  <div className="flex space-x-4">
                    <Button type="button" variant="outline" onClick={previousStep} data-testid="button-step4-back">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button 
                      type="submit"
                      disabled={createProviderMutation.isPending || !form.watch("termsAccepted")}
                      data-testid="button-submit-application"
                    >
                      {createProviderMutation.isPending ? "Submitting..." : "Submit Application"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}