import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Eye, 
  EyeOff, 
  X, 
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  MapPin,
  Chrome,
  Loader2
} from "lucide-react";
import { FaGoogle, FaApple, FaTwitter, FaInstagram } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: any) => void;
  message?: string; // Optional message to show (e.g., "Please sign in to continue booking")
}

export default function AuthModal({ isOpen, onClose, onSuccess, message }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [, setLocation] = useLocation();
  const { login, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const { toast } = useToast();

  const socialProviders = [
    { 
      name: 'Google', 
      icon: FaGoogle, 
      color: 'bg-red-500 hover:bg-red-600',
      provider: 'google'
    },
    { 
      name: 'Apple ID', 
      icon: FaApple, 
      color: 'bg-gray-900 hover:bg-black',
      provider: 'apple'
    },
    { 
      name: 'Twitter', 
      icon: FaTwitter, 
      color: 'bg-blue-500 hover:bg-blue-600',
      provider: 'twitter'
    },
    { 
      name: 'Instagram', 
      icon: FaInstagram, 
      color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
      provider: 'instagram'
    }
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast({
        title: "Validation Error",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await login(formData.email, formData.password);
      
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      
      // Refresh user data to update context
      refreshUser();
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess({ email: formData.email });
      }
      
      onClose();
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      return await authClient.register(data);
    },
    onSuccess: (result) => {
      toast({
        title: "Registration Successful",
        description: `Welcome to Berry Events, ${result.user.firstName || 'User'}!`,
      });
      onSuccess?.(result.user);
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Registration failed. Please try again.",
        variant: "destructive",
      });
    }
  });

  const socialLoginMutation = useMutation({
    mutationFn: async (provider: string) => {
      return new Promise<any>((resolve, reject) => {
        // Open popup window for social authentication
        const popup = window.open(
          `/api/auth/${provider}`,
          `${provider}_auth`,
          'width=500,height=600,scrollbars=yes,resizable=yes'
        );

        if (!popup) {
          reject(new Error('Popup blocked. Please allow popups and try again.'));
          return;
        }

        // Listen for messages from popup
        const handleMessage = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) {
            return;
          }

          try {
            const messageData = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
            
            if (messageData.type === 'SOCIAL_LOGIN_SUCCESS' && messageData.payload) {
              const data = messageData.payload;
              
              // Store auth data
              localStorage.setItem('accessToken', data.accessToken);
              if (data.refreshToken) {
                localStorage.setItem('refreshToken', data.refreshToken);
              }
              
              window.removeEventListener('message', handleMessage);
              resolve(data);
            } else if (messageData.type === 'SOCIAL_LOGIN_ERROR') {
              window.removeEventListener('message', handleMessage);
              reject(new Error(messageData.error || 'Social authentication failed'));
            }
          } catch (error) {
            reject(new Error('Authentication failed'));
          }
        };

        // Check if popup is closed manually
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', handleMessage);
            reject(new Error('Authentication cancelled'));
          }
        }, 1000);

        window.addEventListener('message', handleMessage);
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Login Successful",
        description: `Welcome, ${data.user.firstName}! You're now logged in.`,
      });
      
      if (onSuccess) {
        onSuccess(data.user);
      }
      
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Social Login Failed",
        description: error.message || "Social login failed. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin && formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (isLogin) {
      loginMutation.mutate({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      });
    } else {
      registerMutation.mutate({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        province: formData.province
      });
    }
  };

  const handleSocialLogin = (provider: string) => {
    socialLoginMutation.mutate(provider);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-md max-h-[95vh] overflow-y-auto"
        aria-describedby="auth-modal-description"
        data-testid="auth-modal"
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              {isLogin ? 'Sign In' : 'Create Account'}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose} data-testid="close-auth-modal">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="text-center text-gray-600">
            {isLogin 
              ? 'Welcome back! Sign in to access your Berry Events account.' 
              : 'Join Berry Events to book premium home services in South Africa.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Social Login Options */}
          <div className="space-y-3">
            <p className="text-sm text-gray-600 text-center">
              {isLogin ? 'Sign in with your preferred account' : 'Create account with your preferred platform'}
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              {socialProviders.map((provider) => {
                const IconComponent = provider.icon;
                return (
                  <Button
                    key={provider.provider}
                    variant="outline"
                    onClick={() => handleSocialLogin(provider.provider)}
                    className={`h-12 ${provider.color} text-white border-0 hover:text-white transition-colors`}
                    data-testid={`social-login-${provider.provider}`}
                    disabled={socialLoginMutation.isPending}
                  >
                    <IconComponent className="h-5 w-5 mr-2" />
                    {provider.name}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Separator className="flex-1" />
            <span className="text-sm text-gray-500">or continue with email</span>
            <Separator className="flex-1" />
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      className="pl-10"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      required={!isLogin}
                      data-testid="input-firstName"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      className="pl-10"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      required={!isLogin}
                      data-testid="input-lastName"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  className="pl-10"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  data-testid="input-email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="pl-10 pr-10"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  data-testid="input-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                  data-testid="toggle-password"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      className="pl-10"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      required
                      data-testid="input-confirmPassword"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+27 XX XXX XXXX"
                      className="pl-10"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      data-testid="input-phone"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="city"
                        type="text"
                        placeholder="Johannesburg"
                        className="pl-10"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        data-testid="input-city"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="province">Province</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="province"
                        type="text"
                        placeholder="Gauteng"
                        className="pl-10"
                        value={formData.province}
                        onChange={(e) => handleInputChange('province', e.target.value)}
                        data-testid="input-province"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {isLogin && (
              <div className="flex items-center space-x-2">
                <input
                  id="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                  className="rounded border-gray-300"
                  data-testid="checkbox-rememberMe"
                />
                <Label htmlFor="rememberMe" className="text-sm cursor-pointer">
                  Remember me for faster login
                </Label>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12"
              disabled={loginMutation.isPending || registerMutation.isPending}
              data-testid="submit-auth-form"
            >
              {(loginMutation.isPending || registerMutation.isPending) ? (
                <div className="flex items-center">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  {isLogin ? 'Signing In...' : 'Creating Account...'}
                </div>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </Button>
          </form>

          <div className="text-center">
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm"
              data-testid="toggle-auth-mode"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </Button>
          </div>

          {isLogin && (
            <div className="text-center">
              <Button variant="link" className="text-sm text-blue-600">
                Forgot your password?
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}