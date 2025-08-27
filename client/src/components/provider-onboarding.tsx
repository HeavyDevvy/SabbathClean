import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Camera, 
  Upload, 
  CheckCircle, 
  Clock, 
  Phone,
  Mail,
  MapPin,
  FileText,
  Building,
  CreditCard,
  Shield,
  Smartphone,
  Users
} from "lucide-react";

const providerApplicationSchema = z.object({
  providerType: z.enum(["individual", "company"]),
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  companyName: z.string().optional(),
  companyRegistration: z.string().optional(),
  taxNumber: z.string().optional(),
  bio: z.string().min(50, "Please provide a detailed bio (minimum 50 characters)"),
  servicesOffered: z.array(z.string()).min(1, "Please select at least one service"),
  experience: z.string().min(20, "Please describe your experience"),
  hourlyRate: z.string().min(1, "Hourly rate is required"),
  location: z.string().min(5, "Location is required"),
  hasInsurance: z.boolean(),
  backgroundCheckConsent: z.boolean().refine((val) => val === true, {
    message: "Background check consent is required"
  }),
  bankAccountNumber: z.string().min(8, "Bank account number is required"),
  bankName: z.string().min(2, "Bank name is required"),
  branchCode: z.string().min(6, "Branch code is required"),
  accountHolder: z.string().min(2, "Account holder name is required"),
});

type ProviderApplicationForm = z.infer<typeof providerApplicationSchema>;

interface ProviderOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProviderOnboarding({ isOpen, onClose }: ProviderOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedDocuments, setUploadedDocuments] = useState({
    idDocument: null as string | null,
    qualificationCert: null as string | null,
    companyRegDoc: null as string | null,
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isUsingMobile, setIsUsingMobile] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ProviderApplicationForm>({
    resolver: zodResolver(providerApplicationSchema),
    defaultValues: {
      providerType: "individual",
      servicesOffered: [],
      hasInsurance: false,
      backgroundCheckConsent: false,
    },
  });

  // Detect mobile device
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const services = [
    { id: "house-cleaning", name: "House Cleaning", rate: "R280/hour" },
    { id: "chef-catering", name: "Chef & Catering", rate: "R550/event" },
    { id: "waitering", name: "Waitering Services", rate: "R180/hour" },
    { id: "plumbing", name: "Plumbing", rate: "R380/hour" },
    { id: "electrical", name: "Electrical", rate: "R420/hour" },
    { id: "garden-care", name: "Garden Care", rate: "R320/hour" },
  ];

  const submitApplication = useMutation({
    mutationFn: async (data: ProviderApplicationForm & { documents: typeof uploadedDocuments }) => {
      return apiRequest("POST", "/api/provider-applications", data);
    },
    onSuccess: () => {
      setIsSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["/api/providers"] });
      toast({
        title: "Application Submitted!",
        description: "We'll review your application within 24-48 hours.",
      });
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: "Please check your information and try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (file: File, documentType: string) => {
    // In a real implementation, this would upload to object storage
    // For now, we'll simulate the upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', documentType);
    
    try {
      // Simulate upload success
      const mockUrl = `https://storage.berry-events.com/documents/${documentType}-${Date.now()}.jpg`;
      setUploadedDocuments(prev => ({
        ...prev,
        [documentType]: mockUrl
      }));
      
      toast({
        title: "Document Uploaded",
        description: `${documentType} uploaded successfully`,
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Please try uploading again",
        variant: "destructive",
      });
    }
  };

  const triggerCamera = (documentType: string) => {
    if (isMobile) {
      // For mobile, use camera input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment'; // Use rear camera
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) handleFileUpload(file, documentType);
      };
      input.click();
    } else {
      // For desktop, use file picker
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*,application/pdf';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) handleFileUpload(file, documentType);
      };
      input.click();
    }
  };

  const onSubmit = (data: ProviderApplicationForm) => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      return;
    }

    // Final submission
    submitApplication.mutate({
      ...data,
      documents: uploadedDocuments,
    });
  };

  if (!isOpen) return null;

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Application Submitted!</h3>
            <p className="text-gray-600 mb-6">
              Thank you for applying to become a Berry Events service provider. 
              We'll review your application within 24-48 hours.
            </p>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center justify-center">
                <Clock className="h-4 w-4 mr-2" />
                Review Time: 24-48 hours
              </div>
              <div className="flex items-center justify-center">
                <Mail className="h-4 w-4 mr-2" />
                Email & SMS updates included
              </div>
              <div className="flex items-center justify-center">
                <Phone className="h-4 w-4 mr-2" />
                Questions? Call +27 11 123 4567
              </div>
            </div>
            <Button onClick={onClose} className="mt-6 w-full">
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-6 w-6 mr-2" />
            Become a Berry Events Provider
          </CardTitle>
          <div className="flex space-x-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`h-2 flex-1 rounded ${
                  step <= currentStep ? "bg-primary" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Step {currentStep} of 4 - 
            {currentStep === 1 && " Basic Information"}
            {currentStep === 2 && " Service Details"}
            {currentStep === 3 && " Document Verification"}
            {currentStep === 4 && " Banking & Final Details"}
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label>Provider Type</Label>
                  <Select 
                    onValueChange={(value) => form.setValue("providerType", value as "individual" | "company")}
                    defaultValue="individual"
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual Provider</SelectItem>
                      <SelectItem value="company">Company/Business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input {...form.register("firstName")} />
                    {form.formState.errors.firstName && (
                      <p className="text-red-500 text-sm">{form.formState.errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input {...form.register("lastName")} />
                    {form.formState.errors.lastName && (
                      <p className="text-red-500 text-sm">{form.formState.errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                {form.watch("providerType") === "company" && (
                  <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                    <div>
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input {...form.register("companyName")} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="companyRegistration">Company Registration</Label>
                        <Input {...form.register("companyRegistration")} />
                      </div>
                      <div>
                        <Label htmlFor="taxNumber">Tax Number</Label>
                        <Input {...form.register("taxNumber")} />
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input type="email" {...form.register("email")} />
                    {form.formState.errors.email && (
                      <p className="text-red-500 text-sm">{form.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input {...form.register("phone")} />
                    {form.formState.errors.phone && (
                      <p className="text-red-500 text-sm">{form.formState.errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Location (City/Area)</Label>
                  <Input 
                    {...form.register("location")} 
                    placeholder="e.g., Johannesburg, Sandton"
                  />
                  {form.formState.errors.location && (
                    <p className="text-red-500 text-sm">{form.formState.errors.location.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Service Details */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label>Services You Offer</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {services.map((service) => (
                      <label key={service.id} className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <Checkbox
                          checked={form.watch("servicesOffered").includes(service.id)}
                          onCheckedChange={(checked) => {
                            const current = form.watch("servicesOffered");
                            if (checked) {
                              form.setValue("servicesOffered", [...current, service.id]);
                            } else {
                              form.setValue("servicesOffered", current.filter(id => id !== service.id));
                            }
                          }}
                        />
                        <div>
                          <span className="font-medium text-sm">{service.name}</span>
                          <div className="text-xs text-gray-500">{service.rate}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                  {form.formState.errors.servicesOffered && (
                    <p className="text-red-500 text-sm">{form.formState.errors.servicesOffered.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="hourlyRate">Your Hourly Rate (ZAR)</Label>
                  <Input 
                    type="number" 
                    {...form.register("hourlyRate")} 
                    placeholder="e.g., 280"
                  />
                  {form.formState.errors.hourlyRate && (
                    <p className="text-red-500 text-sm">{form.formState.errors.hourlyRate.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="experience">Experience & Qualifications</Label>
                  <Textarea 
                    {...form.register("experience")} 
                    placeholder="Describe your relevant experience, qualifications, and specializations..."
                    rows={4}
                  />
                  {form.formState.errors.experience && (
                    <p className="text-red-500 text-sm">{form.formState.errors.experience.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Textarea 
                    {...form.register("bio")} 
                    placeholder="Write a professional bio that customers will see on your profile..."
                    rows={4}
                  />
                  {form.formState.errors.bio && (
                    <p className="text-red-500 text-sm">{form.formState.errors.bio.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Document Verification */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <Shield className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Document Verification</h3>
                  <p className="text-gray-600">
                    {isMobile ? "Use your camera to capture documents" : "Upload clear photos or PDFs of your documents"}
                  </p>
                </div>

                {/* ID Document */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">South African ID or Passport</h4>
                      <p className="text-sm text-gray-600">Required for identity verification</p>
                    </div>
                    {uploadedDocuments.idDocument ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : (
                      <div className="text-red-500 text-sm">Required</div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => triggerCamera("idDocument")}
                    className="w-full"
                  >
                    {isMobile ? <Camera className="h-4 w-4 mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                    {uploadedDocuments.idDocument ? "Re-upload ID Document" : 
                      (isMobile ? "Capture ID Document" : "Upload ID Document")}
                  </Button>
                </div>

                {/* Qualification Certificate */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">Qualification Certificate</h4>
                      <p className="text-sm text-gray-600">Relevant training or certification</p>
                    </div>
                    {uploadedDocuments.qualificationCert ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : (
                      <div className="text-orange-500 text-sm">Optional</div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => triggerCamera("qualificationCert")}
                    className="w-full"
                  >
                    {isMobile ? <Camera className="h-4 w-4 mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                    {uploadedDocuments.qualificationCert ? "Re-upload Certificate" : 
                      (isMobile ? "Capture Certificate" : "Upload Certificate")}
                  </Button>
                </div>

                {/* Company Registration (if company) */}
                {form.watch("providerType") === "company" && (
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">Company Registration Document</h4>
                        <p className="text-sm text-gray-600">CIPC registration certificate</p>
                      </div>
                      {uploadedDocuments.companyRegDoc ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        <div className="text-red-500 text-sm">Required</div>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => triggerCamera("companyRegDoc")}
                      className="w-full"
                    >
                      {isMobile ? <Camera className="h-4 w-4 mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                      {uploadedDocuments.companyRegDoc ? "Re-upload Registration" : 
                        (isMobile ? "Capture Registration" : "Upload Registration")}
                    </Button>
                  </div>
                )}

                {/* Device detection info */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center">
                    {isMobile ? <Smartphone className="h-4 w-4 mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                    <span className="text-sm">
                      {isMobile 
                        ? "Mobile detected - Camera capture enabled for easy document upload"
                        : "Desktop detected - File upload available for documents and images"
                      }
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Banking & Final Details */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center">
                  <CreditCard className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Banking Details</h3>
                  <p className="text-gray-600">
                    For secure payment distribution after service completion
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input {...form.register("bankName")} placeholder="e.g., FNB, Standard Bank" />
                    {form.formState.errors.bankName && (
                      <p className="text-red-500 text-sm">{form.formState.errors.bankName.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="branchCode">Branch Code</Label>
                    <Input {...form.register("branchCode")} placeholder="e.g., 250655" />
                    {form.formState.errors.branchCode && (
                      <p className="text-red-500 text-sm">{form.formState.errors.branchCode.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="bankAccountNumber">Account Number</Label>
                  <Input {...form.register("bankAccountNumber")} placeholder="Your bank account number" />
                  {form.formState.errors.bankAccountNumber && (
                    <p className="text-red-500 text-sm">{form.formState.errors.bankAccountNumber.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="accountHolder">Account Holder Name</Label>
                  <Input {...form.register("accountHolder")} placeholder="Full name as on bank account" />
                  {form.formState.errors.accountHolder && (
                    <p className="text-red-500 text-sm">{form.formState.errors.accountHolder.message}</p>
                  )}
                </div>

                <div className="space-y-4">
                  <label className="flex items-start space-x-3">
                    <Checkbox 
                      checked={form.watch("hasInsurance")}
                      onCheckedChange={(checked) => form.setValue("hasInsurance", !!checked)}
                    />
                    <div>
                      <span className="font-medium">I have professional indemnity insurance</span>
                      <p className="text-sm text-gray-600">Recommended for additional customer protection</p>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3">
                    <Checkbox 
                      checked={form.watch("backgroundCheckConsent")}
                      onCheckedChange={(checked) => form.setValue("backgroundCheckConsent", !!checked)}
                    />
                    <div>
                      <span className="font-medium">I consent to a background check</span>
                      <p className="text-sm text-gray-600">Required for platform verification and customer trust</p>
                    </div>
                  </label>
                  {form.formState.errors.backgroundCheckConsent && (
                    <p className="text-red-500 text-sm">{form.formState.errors.backgroundCheckConsent.message}</p>
                  )}
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Payment Structure</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• All payments go through Berry Events Bank first</li>
                    <li>• Funds released to you after successful service completion</li>
                    <li>• 15% platform fee deducted (competitive industry rate)</li>
                    <li>• Payments processed within 2-3 business days</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : onClose()}
              >
                {currentStep > 1 ? "Previous" : "Cancel"}
              </Button>
              
              <Button
                type="submit"
                disabled={submitApplication.isPending}
                className="min-w-[120px]"
              >
                {submitApplication.isPending ? "Submitting..." : 
                  currentStep < 4 ? "Next Step" : "Submit Application"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}