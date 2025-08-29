import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { User, Mail, Phone, Lock, UserPlus, LogIn } from "lucide-react";
import { useLocation } from "wouter";
import EnhancedSocialLogin from "@/components/enhanced-social-login";

export default function Auth() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showSocialLogin, setShowSocialLogin] = useState(false);
  
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

  // Registration mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: typeof signUpData) => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phone: userData.phone,
          password: userData.password
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Welcome to Berry Events!",
        description: "Your account has been created successfully. You can now book services.",
      });
      
      // Store authentication data if needed
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
      }
      
      // Redirect to home after successful signup
      setTimeout(() => {
        setLocation("/");
      }, 1000);
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive"
      });
    }
  });

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

    registerMutation.mutate(signUpData);
  };

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (loginData: typeof signInData) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      });
      
      // Store authentication data
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
      }
      
      // Redirect to home after successful signin
      setTimeout(() => {
        setLocation("/");
      }, 1000);
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(signInData);
  };

  const handleSocialLoginSuccess = (data: any) => {
    toast({
      title: "Welcome!",
      description: "You have been signed in successfully.",
    });
    
    // Store authentication data
    if (data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
    }
    
    setShowSocialLogin(false);
    setTimeout(() => {
      setLocation("/");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Berry Events
          </CardTitle>
          <p className="text-gray-600">Your trusted home services platform</p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
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
                  className="w-full bg-blue-600 hover:bg-blue-700" 
                  disabled={loginMutation.isPending}
                  data-testid="button-signin"
                >
                  {loginMutation.isPending ? "Signing In..." : "Sign In"}
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
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+27 123 456 7890"
                      className="pl-10"
                      value={signUpData.phone}
                      onChange={(e) => setSignUpData({...signUpData, phone: e.target.value})}
                      required
                      data-testid="input-phone"
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

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700" 
                  disabled={registerMutation.isPending}
                  data-testid="button-signup"
                >
                  {registerMutation.isPending ? "Creating Account..." : "Create Account"}
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