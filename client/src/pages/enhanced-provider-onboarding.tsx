import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  Camera, 
  CheckCircle, 
  User, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  FileText,
  Shield,
  AlertTriangle
} from "lucide-react";
import { useLocation } from "wouter";
import berryLogo from "@assets/berry-logo.png";

interface ProviderData {
  // Basic Information
  applicationType: 'individual' | 'company';
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  phone: string;
  idNumber: string;
  companyRegistration: string;
  
  // Address
  address: string;
  city: string;
  province: string;
  postalCode: string;
  
  // Services
  services: string[];
  experience: string;
  description: string;
  
  // Banking Details
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  branchCode: string;
  accountType: string;
  
  // Documents
  idDocument: File | null;
  proofOfAddress: File | null;
  businessRegistration: File | null;
  bankStatement: File | null;
  certificates: File[];
  profilePicture: File | null;
  
  // Verification
  kycStatus: 'pending' | 'verified' | 'failed';
  kybStatus: 'pending' | 'verified' | 'failed';
}

export default function EnhancedProviderOnboarding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRefs = {
    idDocument: useRef<HTMLInputElement>(null),
    proofOfAddress: useRef<HTMLInputElement>(null),
    businessRegistration: useRef<HTMLInputElement>(null),
    bankStatement: useRef<HTMLInputElement>(null),
    certificates: useRef<HTMLInputElement>(null),
    profilePicture: useRef<HTMLInputElement>(null)
  };

  const [providerData, setProviderData] = useState<ProviderData>({
    applicationType: 'individual',
    firstName: "",
    lastName: "",
    companyName: "",
    email: "",
    phone: "",
    idNumber: "",
    companyRegistration: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    services: [],
    experience: "",
    description: "",
    bankName: "",
    accountHolder: "",
    accountNumber: "",
    branchCode: "",
    accountType: "checking",
    idDocument: null,
    proofOfAddress: null,
    businessRegistration: null,
    bankStatement: null,
    certificates: [],
    profilePicture: null,
    kycStatus: 'pending',
    kybStatus: 'pending'
  });

  const availableServices = [
    "House Cleaning",
    "Plumbing Services",
    "Electrical Work",
    "Chef & Catering",
    "Waitering Services",
    "Garden Care"
  ];

  const southAfricanBanks = [
    "ABSA Bank",
    "Standard Bank",
    "FirstNational Bank (FNB)",
    "Nedbank",
    "Capitec Bank",
    "African Bank",
    "Bidvest Bank",
    "Discovery Bank",
    "Investec",
    "Sasfin Bank"
  ];

  const handleFileUpload = (field: keyof typeof fileInputRefs, file: File | null) => {
    if (field === 'certificates' && file) {
      setProviderData({
        ...providerData,
        certificates: [...providerData.certificates, file]
      });
    } else {
      setProviderData({
        ...providerData,
        [field]: file
      });
    }
  };

  const openCamera = async (field: keyof typeof fileInputRefs) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } // Use rear camera for documents
      });
      
      // Create a simple camera interface
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      toast({
        title: "Camera Access",
        description: "Camera opened. Use file picker for document upload.",
      });
      
      // Clean up
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please use file upload instead.",
        variant: "destructive"
      });
    }
  };

  const handleServiceToggle = (service: string) => {
    const updatedServices = providerData.services.includes(service)
      ? providerData.services.filter(s => s !== service)
      : [...providerData.services, service];
    
    setProviderData({ ...providerData, services: updatedServices });
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate KYC/KYB verification process
    try {
      // Step 1: Document verification
      toast({
        title: "Verifying Documents",
        description: "Please wait while we verify your documents...",
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step 2: KYC verification
      toast({
        title: "Identity Verification",
        description: "Verifying your identity through our KYC partner...",
      });
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Step 3: Banking verification
      toast({
        title: "Banking Verification",
        description: "Verifying your banking details...",
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success
      toast({
        title: "Application Submitted Successfully!",
        description: "Your application is under review. You'll receive an email within 24-48 hours with the verification status.",
      });
      
      // Redirect to success page
      setTimeout(() => {
        setLocation("/provider-dashboard");
      }, 2000);
      
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "There was an issue with the verification process. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Basic Information</h3>
              <p className="text-gray-600">Tell us about yourself or your business</p>
            </div>
            
            {/* Application Type */}
            <div className="space-y-4">
              <Label>Application Type</Label>
              <div className="grid grid-cols-2 gap-4">
                <Card 
                  className={`cursor-pointer border-2 transition-all ${
                    providerData.applicationType === 'individual' 
                      ? 'border-[#44062D] bg-[#EED1C4]/30' 
                      : 'border-gray-200'
                  }`}
                  onClick={() => setProviderData({ ...providerData, applicationType: 'individual' })}
                >
                  <CardContent className="flex flex-col items-center p-4">
                    <User className="h-8 w-8 text-[#44062D] mb-2" />
                    <span className="font-medium">Individual</span>
                    <span className="text-sm text-gray-600 text-center">Personal service provider</span>
                  </CardContent>
                </Card>
                
                <Card 
                  className={`cursor-pointer border-2 transition-all ${
                    providerData.applicationType === 'company' 
                      ? 'border-[#44062D] bg-[#EED1C4]/30' 
                      : 'border-gray-200'
                  }`}
                  onClick={() => setProviderData({ ...providerData, applicationType: 'company' })}
                >
                  <CardContent className="flex flex-col items-center p-4">
                    <Building2 className="h-8 w-8 text-[#44062D] mb-2" />
                    <span className="font-medium">Company</span>
                    <span className="text-sm text-gray-600 text-center">Business service provider</span>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Personal/Company Information */}
            {providerData.applicationType === 'individual' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={providerData.firstName}
                    onChange={(e) => setProviderData({...providerData, firstName: e.target.value})}
                    required
                    data-testid="input-first-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={providerData.lastName}
                    onChange={(e) => setProviderData({...providerData, lastName: e.target.value})}
                    required
                    data-testid="input-last-name"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  placeholder="Your Company Ltd"
                  value={providerData.companyName}
                  onChange={(e) => setProviderData({...providerData, companyName: e.target.value})}
                  required
                  data-testid="input-company-name"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    className="pl-10"
                    value={providerData.email}
                    onChange={(e) => setProviderData({...providerData, email: e.target.value})}
                    required
                    data-testid="input-email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+27 123 456 7890"
                    className="pl-10"
                    value={providerData.phone}
                    onChange={(e) => setProviderData({...providerData, phone: e.target.value})}
                    required
                    data-testid="input-phone"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="idNumber">
                  {providerData.applicationType === 'individual' ? 'ID Number' : 'Company Registration Number'}
                </Label>
                <Input
                  id="idNumber"
                  placeholder={providerData.applicationType === 'individual' ? "0000000000000" : "2000/000000/00"}
                  value={providerData.applicationType === 'individual' ? providerData.idNumber : providerData.companyRegistration}
                  onChange={(e) => setProviderData({
                    ...providerData, 
                    [providerData.applicationType === 'individual' ? 'idNumber' : 'companyRegistration']: e.target.value
                  })}
                  required
                  data-testid="input-id-number"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Address & Services</h3>
              <p className="text-gray-600">Where are you located and what services do you offer?</p>
            </div>
            
            {/* Address */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="address"
                    placeholder="123 Main Street"
                    className="pl-10"
                    value={providerData.address}
                    onChange={(e) => setProviderData({...providerData, address: e.target.value})}
                    required
                    data-testid="input-address"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="Cape Town"
                    value={providerData.city}
                    onChange={(e) => setProviderData({...providerData, city: e.target.value})}
                    required
                    data-testid="input-city"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="province">Province</Label>
                  <Select value={providerData.province} onValueChange={(value) => setProviderData({...providerData, province: value})}>
                    <SelectTrigger data-testid="select-province">
                      <SelectValue placeholder="Select province" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="western-cape">Western Cape</SelectItem>
                      <SelectItem value="eastern-cape">Eastern Cape</SelectItem>
                      <SelectItem value="northern-cape">Northern Cape</SelectItem>
                      <SelectItem value="free-state">Free State</SelectItem>
                      <SelectItem value="kwazulu-natal">KwaZulu-Natal</SelectItem>
                      <SelectItem value="north-west">North West</SelectItem>
                      <SelectItem value="gauteng">Gauteng</SelectItem>
                      <SelectItem value="mpumalanga">Mpumalanga</SelectItem>
                      <SelectItem value="limpopo">Limpopo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    placeholder="8001"
                    value={providerData.postalCode}
                    onChange={(e) => setProviderData({...providerData, postalCode: e.target.value})}
                    required
                    data-testid="input-postal-code"
                  />
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="space-y-4">
              <Label>Services You Offer</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableServices.map(service => (
                  <div key={service} className="flex items-center space-x-2">
                    <Checkbox
                      id={service}
                      checked={providerData.services.includes(service)}
                      onCheckedChange={() => handleServiceToggle(service)}
                      data-testid={`checkbox-service-${service.toLowerCase().replace(/ /g, '-')}`}
                    />
                    <Label htmlFor={service} className="text-sm font-medium cursor-pointer">
                      {service}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience</Label>
              <Select value={providerData.experience} onValueChange={(value) => setProviderData({...providerData, experience: value})}>
                <SelectTrigger data-testid="select-experience">
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-1">0-1 years</SelectItem>
                  <SelectItem value="2-5">2-5 years</SelectItem>
                  <SelectItem value="6-10">6-10 years</SelectItem>
                  <SelectItem value="10+">10+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Service Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your services and what makes you unique..."
                value={providerData.description}
                onChange={(e) => setProviderData({...providerData, description: e.target.value})}
                rows={4}
                data-testid="textarea-description"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Document Upload</h3>
              <p className="text-gray-600">Upload required documents for verification</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Picture */}
              <Card className="border-2 border-dashed border-gray-300">
                <CardContent className="p-6">
                  <div className="text-center">
                    <User className="mx-auto h-12 w-12 text-gray-400" />
                    <h4 className="mt-2 font-medium text-gray-900">Profile Picture</h4>
                    <p className="text-sm text-gray-600 mb-4">Clear photo of yourself for your profile</p>
                    
                    <div className="flex flex-col space-y-2">
                      <Button
                        onClick={() => fileInputRefs.profilePicture.current?.click()}
                        variant="outline"
                        className="w-full"
                        data-testid="button-upload-profile-picture"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Photo
                      </Button>
                      
                      <Button
                        onClick={() => openCamera('profilePicture')}
                        variant="outline"
                        className="w-full"
                        data-testid="button-camera-profile-picture"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Take Photo
                      </Button>
                    </div>
                    
                    <input
                      ref={fileInputRefs.profilePicture}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => handleFileUpload('profilePicture', e.target.files?.[0] || null)}
                    />
                    
                    {providerData.profilePicture && (
                      <p className="mt-2 text-sm text-green-600 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {providerData.profilePicture.name}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* ID Document */}
              <Card className="border-2 border-dashed border-gray-300">
                <CardContent className="p-6">
                  <div className="text-center">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h4 className="mt-2 font-medium text-gray-900">
                      {providerData.applicationType === 'individual' ? 'ID Document' : 'Company Registration'}
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      {providerData.applicationType === 'individual' ? 'South African ID or Passport' : 'CK/CIPC Registration Certificate'}
                    </p>
                    
                    <div className="flex flex-col space-y-2">
                      <Button
                        onClick={() => fileInputRefs.idDocument.current?.click()}
                        variant="outline"
                        className="w-full"
                        data-testid="button-upload-id"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Document
                      </Button>
                      
                      <Button
                        onClick={() => openCamera('idDocument')}
                        variant="outline"
                        className="w-full"
                        data-testid="button-camera-id"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Take Photo
                      </Button>
                    </div>
                    
                    <input
                      ref={fileInputRefs.idDocument}
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => handleFileUpload('idDocument', e.target.files?.[0] || null)}
                    />
                    
                    {providerData.idDocument && (
                      <p className="mt-2 text-sm text-green-600 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {providerData.idDocument.name}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Proof of Address */}
              <Card className="border-2 border-dashed border-gray-300">
                <CardContent className="p-6">
                  <div className="text-center">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h4 className="mt-2 font-medium text-gray-900">Proof of Address</h4>
                    <p className="text-sm text-gray-600 mb-4">Utility bill or bank statement (last 3 months)</p>
                    
                    <div className="flex flex-col space-y-2">
                      <Button
                        onClick={() => fileInputRefs.proofOfAddress.current?.click()}
                        variant="outline"
                        className="w-full"
                        data-testid="button-upload-address"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Document
                      </Button>
                      
                      <Button
                        onClick={() => openCamera('proofOfAddress')}
                        variant="outline"
                        className="w-full"
                        data-testid="button-camera-address"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Take Photo
                      </Button>
                    </div>
                    
                    <input
                      ref={fileInputRefs.proofOfAddress}
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => handleFileUpload('proofOfAddress', e.target.files?.[0] || null)}
                    />
                    
                    {providerData.proofOfAddress && (
                      <p className="mt-2 text-sm text-green-600 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {providerData.proofOfAddress.name}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Bank Statement */}
              <Card className="border-2 border-dashed border-gray-300">
                <CardContent className="p-6">
                  <div className="text-center">
                    <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                    <h4 className="mt-2 font-medium text-gray-900">Bank Statement</h4>
                    <p className="text-sm text-gray-600 mb-4">Latest 3 months bank statement</p>
                    
                    <div className="flex flex-col space-y-2">
                      <Button
                        onClick={() => fileInputRefs.bankStatement.current?.click()}
                        variant="outline"
                        className="w-full"
                        data-testid="button-upload-bank-statement"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Statement
                      </Button>
                    </div>
                    
                    <input
                      ref={fileInputRefs.bankStatement}
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => handleFileUpload('bankStatement', e.target.files?.[0] || null)}
                    />
                    
                    {providerData.bankStatement && (
                      <p className="mt-2 text-sm text-green-600 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {providerData.bankStatement.name}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Certificates */}
              <Card className="border-2 border-dashed border-gray-300">
                <CardContent className="p-6">
                  <div className="text-center">
                    <Shield className="mx-auto h-12 w-12 text-gray-400" />
                    <h4 className="mt-2 font-medium text-gray-900">Certificates (Optional)</h4>
                    <p className="text-sm text-gray-600 mb-4">Professional certificates or qualifications</p>
                    
                    <div className="flex flex-col space-y-2">
                      <Button
                        onClick={() => fileInputRefs.certificates.current?.click()}
                        variant="outline"
                        className="w-full"
                        data-testid="button-upload-certificates"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Certificates
                      </Button>
                    </div>
                    
                    <input
                      ref={fileInputRefs.certificates}
                      type="file"
                      accept="image/*,.pdf"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        files.forEach(file => handleFileUpload('certificates', file));
                      }}
                    />
                    
                    {providerData.certificates.length > 0 && (
                      <p className="mt-2 text-sm text-green-600 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {providerData.certificates.length} file(s) uploaded
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Banking Details</h3>
              <p className="text-gray-600">Required for payment processing</p>
            </div>

            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Important Payment Information</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Berry Events processes all payments through our secure platform. 
                      Payments are released to providers 2-3 business days after service completion.
                      A 15% platform commission is deducted from each payment.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Select value={providerData.bankName} onValueChange={(value) => setProviderData({...providerData, bankName: value})}>
                  <SelectTrigger data-testid="select-bank">
                    <SelectValue placeholder="Select your bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {southAfricanBanks.map(bank => (
                      <SelectItem key={bank} value={bank.toLowerCase().replace(/\s+/g, '-')}>
                        {bank}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="accountType">Account Type</Label>
                <Select value={providerData.accountType} onValueChange={(value) => setProviderData({...providerData, accountType: value})}>
                  <SelectTrigger data-testid="select-account-type">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Checking Account</SelectItem>
                    <SelectItem value="savings">Savings Account</SelectItem>
                    <SelectItem value="business">Business Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountHolder">Account Holder Name</Label>
              <Input
                id="accountHolder"
                placeholder="Full name as shown on bank account"
                value={providerData.accountHolder}
                onChange={(e) => setProviderData({...providerData, accountHolder: e.target.value})}
                required
                data-testid="input-account-holder"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  placeholder="1234567890"
                  value={providerData.accountNumber}
                  onChange={(e) => setProviderData({...providerData, accountNumber: e.target.value})}
                  required
                  data-testid="input-account-number"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="branchCode">Branch Code</Label>
                <Input
                  id="branchCode"
                  placeholder="123456"
                  value={providerData.branchCode}
                  onChange={(e) => setProviderData({...providerData, branchCode: e.target.value})}
                  required
                  data-testid="input-branch-code"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F2EF] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Berry Events Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src={berryLogo} 
            alt="Berry Events Logo" 
            className="h-16 w-auto object-contain"
            data-testid="img-berry-logo"
          />
        </div>
        
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center border-b border-[#EED1C4]">
            <CardTitle className="text-2xl font-bold text-[#44062D]">
              Service Provider Application
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Join Berry Events as a verified service provider
            </p>
            
            {/* Progress Bar */}
            <div className="flex items-center justify-center space-x-2 mt-6">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      currentStep >= step
                        ? "bg-[#44062D] text-white"
                        : currentStep > step
                        ? "bg-[#C56B86] text-white"
                        : "bg-[#F7F2EF] text-[#3C0920] border-2 border-[#3C0920]"
                    }`}
                  >
                    {currentStep > step ? <CheckCircle className="h-5 w-5" /> : step}
                  </div>
                  {step < 4 && (
                    <div
                      className={`w-12 h-1 transition-colors ${
                        currentStep > step ? "bg-[#C56B86]" : "bg-[#EED1C4]"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex justify-center mt-2">
              <span className="text-sm text-gray-600">
                Step {currentStep} of 4
              </span>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            {renderStep()}
            
            <div className="flex justify-between pt-6 border-t border-[#EED1C4] mt-6">
              <div>
                {currentStep > 1 && (
                  <Button
                    onClick={handlePrevious}
                    variant="outline"
                    className="border-[#44062D] text-[#44062D] hover:bg-[#EED1C4]/30"
                    disabled={isSubmitting}
                    data-testid="button-previous"
                  >
                    Previous
                  </Button>
                )}
              </div>
              
              <div className="flex space-x-3">
                <Button
                  onClick={() => setLocation("/")}
                  variant="ghost"
                  className="text-gray-600 hover:text-[#44062D] hover:bg-[#F7F2EF]"
                  disabled={isSubmitting}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                
                {currentStep < 4 ? (
                  <Button
                    onClick={handleNext}
                    className="bg-[#44062D] hover:bg-[#3C0920] text-white"
                    disabled={isSubmitting}
                    data-testid="button-next"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    className="bg-[#44062D] hover:bg-[#3C0920] text-white"
                    disabled={isSubmitting}
                    data-testid="button-submit"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}