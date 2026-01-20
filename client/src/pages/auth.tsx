import { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, Lock, UserPlus, LogIn } from "lucide-react";
import { useLocation } from "wouter";
import EnhancedSocialLogin from "@/components/enhanced-social-login";
import { useAuth } from "@/contexts/AuthContext";
import { authClient } from "@/lib/auth-client";
import { apiRequest } from "@/lib/queryClient";
import { Checkbox } from "@/components/ui/checkbox";
// Background set via absolute asset path to avoid compile-time import

export default function Auth() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login, register, refreshUser } = useAuth();
  const [showSocialLogin, setShowSocialLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tabValue, setTabValue] = useState("signin");
  
  const [signUpData, setSignUpData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  const [signInData, setSignInData] = useState({
    email: "",
    password: ""
  });

  const [acceptTcs, setAcceptTcs] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signUpData.password !== signUpData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive"
      });
      return;
    }

    if (!acceptTcs) {
      toast({
        title: "Terms Required",
        description: "Please accept the Terms & Conditions to continue.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const registerData: any = {
        firstName: signUpData.firstName,
        lastName: signUpData.lastName,
        email: signUpData.email,
        phone: signUpData.phone || undefined,
        password: signUpData.password,
        accountType: signUpData.accountType
      };

      if (signUpData.accountType === 'BUSINESS') {
        Object.assign(registerData, {
          businessName: signUpData.businessName,
          businessRegistrationNumber: signUpData.businessRegistrationNumber,
          vatNumber: signUpData.vatNumber || undefined,
          businessAddress: signUpData.businessAddress,
          businessCity: signUpData.businessCity,
          businessPostalCode: signUpData.businessPostalCode,
          contactPersonFirstName: signUpData.contactPersonFirstName,
          contactPersonLastName: signUpData.contactPersonLastName,
          contactPersonEmail: signUpData.contactPersonEmail,
          contactPersonPhone: signUpData.contactPersonPhone,
          contactPersonRole: signUpData.contactPersonRole || undefined
        });
      }

      await register(registerData);
      
      toast({
        title: "Welcome to Berry Events!",
        description: "Your account has been created successfully.",
      });
      
      // Redirect to home after successful signup
      setTimeout(() => {
        setLocation("/");
      }, 1000);
    } catch (error: any) {
      console.error('Registration error:', error);
      
          let errorMessage = error.message || "Failed to create account. Please try again.";
          
          if (error.message?.includes('Email already registered')) {
        errorMessage = "This email is already registered. Please sign in instead.";
        setSignInData({ email: signUpData.email, password: "" });
        setTabValue("signin");
          } else if (error.message?.includes('Invalid input data')) {
            errorMessage = "Please check your information and try again.";
          } else if (error.message?.includes('password')) {
            errorMessage = "Password must be at least 6 characters long.";
          }
      
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      await login(signInData.email, signInData.password);
      
      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      });
      
      // Role-based redirect after successful signin
      try {
        // Ensure auth context has latest user
        refreshUser();
        const currentUser = await authClient.getCurrentUser();
        if (currentUser) {
          if (currentUser.isProvider) {
            try {
              const res = await apiRequest("GET", `/api/providers/by-user/${currentUser.id}`);
              const provider = await res.json();
              const status = provider?.verificationStatus || (provider?.isVerified ? 'approved' : 'pending');
              if (status === 'approved') {
                setLocation("/provider-dashboard");
              } else {
                toast({
                  title: "Pending Approval",
                  description: "Your provider account is pending approval.",
                });
                setLocation("/providers");
              }
            } catch {
              // No provider record yet, treat as customer
              setLocation("/bookings");
            }
          } else {
            setLocation("/bookings");
          }
        } else {
          setLocation("/");
        }
      } catch {
        setLocation("/");
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = error.message || "Login failed. Please try again.";
      
      if (error.message?.includes('Invalid email or password')) {
        errorMessage = "Invalid email or password. Please check your credentials and try again.";
      } else if (error.message?.includes('User not found')) {
        errorMessage = "No account found with this email. Please check your email or sign up instead.";
      } else if (error.message?.includes('Provider under review')) {
        errorMessage = "Your application is under review. You'll receive an email once approved.";
      } else if (error.message?.includes('Provider not approved')) {
        errorMessage = "Your application was not approved. Please contact support for more information.";
      }
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLoginSuccess = (data: any) => {
    toast({
      title: "Welcome!",
      description: "You have been signed in successfully.",
    });
    
    // Refresh user state to update auth context
    refreshUser();
    
    setShowSocialLogin(false);
    // Role-based redirect for social login
    setTimeout(async () => {
      try {
        const currentUser = await authClient.getCurrentUser();
        if (currentUser) {
          if (currentUser.isProvider) {
            try {
              const res = await apiRequest("GET", `/api/providers/by-user/${currentUser.id}`);
              const provider = await res.json();
              const status = provider?.verificationStatus || (provider?.isVerified ? 'approved' : 'pending');
              if (status === 'approved') {
                setLocation("/provider-dashboard");
              } else {
                toast({
                  title: "Pending Approval",
                  description: "Your provider account is pending approval.",
                });
                setLocation("/providers");
              }
            } catch {
              setLocation("/bookings");
            }
          } else {
            setLocation("/bookings");
          }
        } else {
          setLocation("/");
        }
      } catch {
        setLocation("/");
      }
    }, 500);
  };

  return (
    <div className="min-h-screen relative bg-cover bg-center bg-no-repeat flex items-center justify-center p-4" style={{ backgroundImage: "url('/attached_assets/signin-background.png')" }}>
      <div className="absolute inset-0 bg-black/40" />
      <Card className="w-full max-w-md relative z-10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Berry Events
          </CardTitle>
          <p className="text-gray-600">Your trusted home services platform</p>
        </CardHeader>
        <CardContent>
          <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin" data-testid="tab-signin">
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup" data-testid="tab-signup">
                <UserPlus className="h-4 w-4 mr-2" />
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="your.email@example.com"
                      className="pl-10"
                      value={signInData.email}
                      onChange={(e) => setSignInData({...signInData, email: e.target.value})}
                      required
                      data-testid="input-signin-email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Enter your password"
                      className="pl-10"
                      value={signInData.password}
                      onChange={(e) => setSignInData({...signInData, password: e.target.value})}
                      required
                      data-testid="input-signin-password"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-accent text-primary-foreground" 
                  disabled={isLoading}
                  data-testid="button-signin"
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
              
              {/* Social Login Button */}
              <div className="mt-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-3"
                  onClick={() => setShowSocialLogin(true)}
                  data-testid="button-social-login"
                >
                  Social Login
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                {/* Account Type Toggle */}
                <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setSignUpData({...signUpData, accountType: "INDIVIDUAL"})}
                    className={`flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${
                      signUpData.accountType === "INDIVIDUAL" 
                        ? "bg-white text-primary shadow-sm" 
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Individual
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignUpData({...signUpData, accountType: "BUSINESS"})}
                    className={`flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${
                      signUpData.accountType === "BUSINESS" 
                        ? "bg-white text-primary shadow-sm" 
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    <Building className="w-4 h-4 mr-2" />
                    Business
                  </button>
                </div>

                {/* Common Fields - First Name / Last Name (Visible for both as per prompt "Show ALL of the above") */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="firstName"
                        placeholder="John"
                        className="pl-10"
                        value={signUpData.firstName}
                        onChange={(e) => setSignUpData({...signUpData, firstName: e.target.value})}
                        required
                        data-testid="input-first-name"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={signUpData.lastName}
                      onChange={(e) => setSignUpData({...signUpData, lastName: e.target.value})}
                      required
                      data-testid="input-last-name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="john.doe@example.com"
                      className="pl-10"
                      value={signUpData.email}
                      onChange={(e) => setSignUpData({...signUpData, email: e.target.value})}
                      required
                      data-testid="input-email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+27 123 456 7890 (Optional)"
                      className="pl-10"
                      value={signUpData.phone}
                      onChange={(e) => setSignUpData({...signUpData, phone: e.target.value})}
                      data-testid="input-signup-phone"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a strong password"
                      className="pl-10"
                      value={signUpData.password}
                      onChange={(e) => setSignUpData({...signUpData, password: e.target.value})}
                      required
                      data-testid="input-password"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      className="pl-10"
                      value={signUpData.confirmPassword}
                      onChange={(e) => setSignUpData({...signUpData, confirmPassword: e.target.value})}
                      required
                      data-testid="input-confirm-password"
                    />
                  </div>
                </div>

                {/* Business Specific Sections */}
                {signUpData.accountType === 'BUSINESS' && (
                  <div className="space-y-6 pt-4 animate-in slide-in-from-top-4 duration-300">
                    {/* Business Details */}
                    <div className="space-y-4 border rounded-lg p-4 bg-gray-50/50">
                      <h3 className="font-semibold text-sm text-gray-900 flex items-center border-b pb-2">
                        <Building className="w-4 h-4 mr-2 text-primary" />
                        Business Details
                      </h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="businessName">Business Name *</Label>
                        <Input
                          id="businessName"
                          value={signUpData.businessName}
                          onChange={(e) => setSignUpData({...signUpData, businessName: e.target.value})}
                          required={signUpData.accountType === 'BUSINESS'}
                          placeholder="Company Trading Name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="businessRegistrationNumber">Registration Number *</Label>
                        <Input
                          id="businessRegistrationNumber"
                          value={signUpData.businessRegistrationNumber}
                          onChange={(e) => setSignUpData({...signUpData, businessRegistrationNumber: e.target.value})}
                          required={signUpData.accountType === 'BUSINESS'}
                          placeholder="e.g. 2023/123456/07"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="vatNumber">VAT Number (Optional)</Label>
                        <Input
                          id="vatNumber"
                          value={signUpData.vatNumber}
                          onChange={(e) => setSignUpData({...signUpData, vatNumber: e.target.value})}
                          placeholder="e.g. 4123456789"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="businessAddress">Business Address *</Label>
                        <Input
                          id="businessAddress"
                          value={signUpData.businessAddress}
                          onChange={(e) => setSignUpData({...signUpData, businessAddress: e.target.value})}
                          required={signUpData.accountType === 'BUSINESS'}
                          placeholder="Street Address"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="businessCity">City *</Label>
                          <Input
                            id="businessCity"
                            value={signUpData.businessCity}
                            onChange={(e) => setSignUpData({...signUpData, businessCity: e.target.value})}
                            required={signUpData.accountType === 'BUSINESS'}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="businessPostalCode">Postal Code *</Label>
                          <Input
                            id="businessPostalCode"
                            value={signUpData.businessPostalCode}
                            onChange={(e) => setSignUpData({...signUpData, businessPostalCode: e.target.value})}
                            required={signUpData.accountType === 'BUSINESS'}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Primary Contact Person */}
                    <div className="space-y-4 border rounded-lg p-4 bg-gray-50/50">
                      <h3 className="font-semibold text-sm text-gray-900 flex items-center border-b pb-2">
                        <User className="w-4 h-4 mr-2 text-primary" />
                        Primary Contact Person
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="contactPersonFirstName">First Name *</Label>
                          <Input
                            id="contactPersonFirstName"
                            value={signUpData.contactPersonFirstName}
                            onChange={(e) => setSignUpData({...signUpData, contactPersonFirstName: e.target.value})}
                            required={signUpData.accountType === 'BUSINESS'}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contactPersonLastName">Last Name *</Label>
                          <Input
                            id="contactPersonLastName"
                            value={signUpData.contactPersonLastName}
                            onChange={(e) => setSignUpData({...signUpData, contactPersonLastName: e.target.value})}
                            required={signUpData.accountType === 'BUSINESS'}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contactPersonEmail">Email Address *</Label>
                        <Input
                          id="contactPersonEmail"
                          type="email"
                          value={signUpData.contactPersonEmail}
                          onChange={(e) => setSignUpData({...signUpData, contactPersonEmail: e.target.value})}
                          required={signUpData.accountType === 'BUSINESS'}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contactPersonPhone">Phone Number *</Label>
                        <Input
                          id="contactPersonPhone"
                          type="tel"
                          value={signUpData.contactPersonPhone}
                          onChange={(e) => setSignUpData({...signUpData, contactPersonPhone: e.target.value})}
                          required={signUpData.accountType === 'BUSINESS'}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contactPersonRole">Role/Position</Label>
                        <select
                          id="contactPersonRole"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={signUpData.contactPersonRole}
                          onChange={(e) => setSignUpData({...signUpData, contactPersonRole: e.target.value})}
                        >
                          <option value="">Select Role</option>
                          <option value="Owner">Owner</option>
                          <option value="Manager">Manager</option>
                          <option value="Administrator">Administrator</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-start space-x-3 pt-2">
                  <Checkbox
                    id="acceptTcs"
                    checked={acceptTcs}
                    onCheckedChange={(checked) => setAcceptTcs(!!checked)}
                    data-testid="checkbox-accept-tcs"
                  />
                  <div>
                    <Label htmlFor="acceptTcs" className="font-medium">I accept the Terms & Conditions</Label>
                    <p className="text-xs text-gray-500">You must accept to create an account.</p>
                  </div>
                </div>

                <div className="flex justify-center my-4">
                  <ReCAPTCHA
                    sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"} // Fallback or env
                    onChange={(token) => setCaptchaToken(token)}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-accent text-primary-foreground" 
                  disabled={isLoading}
                  data-testid="button-signup"
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
              
              {/* Social Login Button for Sign Up */}
              <div className="mt-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">Or sign up with</span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-3"
                  onClick={() => setShowSocialLogin(true)}
                  data-testid="button-social-signup"
                >
                  Social Login
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => setLocation("/")}
              className="text-gray-600 hover:text-gray-900"
              data-testid="button-back-home"
            >
              ← Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Social Login Modal */}
      <EnhancedSocialLogin
        isOpen={showSocialLogin}
        onClose={() => setShowSocialLogin(false)}
        onSuccess={handleSocialLoginSuccess}
      />
    </div>
  );
}
