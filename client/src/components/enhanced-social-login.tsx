import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";
import { FaGoogle, FaApple, FaTwitter, FaInstagram } from "react-icons/fa";

interface EnhancedSocialLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: any) => void;
}

const socialProviders = [
  {
    id: 'google',
    name: 'Google',
    icon: FaGoogle,
    color: 'text-red-600',
    bgColor: 'hover:bg-red-50',
    borderColor: 'border-red-200',
  },
  {
    id: 'apple',
    name: 'Apple',
    icon: FaApple,
    color: 'text-gray-900',
    bgColor: 'hover:bg-gray-50',
    borderColor: 'border-gray-200',
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: FaTwitter,
    color: 'text-blue-500',
    bgColor: 'hover:bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: FaInstagram,
    color: 'text-pink-600',
    bgColor: 'hover:bg-pink-50',
    borderColor: 'border-pink-200',
  },
];

interface SocialAuthPayload {
  user: any;
  accessToken?: string;
}

export default function EnhancedSocialLogin({ isOpen, onClose, onSuccess }: EnhancedSocialLoginProps) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const socialLoginMutation = useMutation<SocialAuthPayload, Error, string>({
    mutationFn: async (provider: string) => {
      setIsProcessing(provider);
      
      // Create popup window for OAuth flow
      const popup = window.open(
        `/api/auth/${provider}`,
        'socialLogin',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error('Please allow popups for social login to work properly');
      }

      return new Promise((resolve, reject) => {
        const handleMessage = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          
          if (event.data.type === 'SOCIAL_LOGIN_SUCCESS') {
            window.removeEventListener('message', handleMessage);
            popup.close();
            resolve(event.data.payload);
          } else if (event.data.type === 'SOCIAL_LOGIN_ERROR') {
            window.removeEventListener('message', handleMessage);
            popup.close();
            reject(new Error(event.data.error || 'Social login failed'));
          }
        };

        // Handle popup closed manually
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', handleMessage);
            reject(new Error('Authentication was cancelled'));
          }
        }, 1000);

        window.addEventListener('message', handleMessage);
      });
    },
    onSuccess: (data) => {
      setIsProcessing(null);
      toast({
        title: "Welcome to Berry Events!",
        description: `Successfully signed in. You can now access all our home services.`,
      });
      
      // Store authentication state
      localStorage.setItem('berryEventsUser', JSON.stringify(data.user));
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }
      
      if (onSuccess) {
        onSuccess(data.user);
      }
      
      onClose();
    },
    onError: (error: any) => {
      setIsProcessing(null);
      toast({
        title: "Login Failed",
        description: error.message || "Please try again or contact support if the issue persists.",
        variant: "destructive",
      });
    }
  });

  const handleSocialLogin = (provider: string) => {
    socialLoginMutation.mutate(provider);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-md"
        aria-describedby="social-login-description"
        data-testid="social-login-modal"
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              Welcome to Berry Events
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose} data-testid="close-social-login">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p 
            id="social-login-description" 
            className="text-gray-600 text-sm"
          >
            Sign in with your preferred social account to access our home services platform
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Social Login Buttons */}
          <div className="space-y-3">
            {socialProviders.map((provider) => {
              const Icon = provider.icon;
              const isCurrentlyProcessing = isProcessing === provider.id;
              
              return (
                <Button
                  key={provider.id}
                  variant="outline"
                  size="lg"
                  className={`w-full h-12 text-left justify-start space-x-3 ${provider.bgColor} ${provider.borderColor} transition-all duration-200`}
                  onClick={() => handleSocialLogin(provider.id)}
                  disabled={socialLoginMutation.isPending}
                  data-testid={`social-login-${provider.id}`}
                >
                  <div className="flex items-center space-x-3">
                    {isCurrentlyProcessing ? (
                      <div className="h-5 w-5 animate-spin border-2 border-gray-300 border-t-gray-600 rounded-full" />
                    ) : (
                      <Icon className={`h-5 w-5 ${provider.color}`} />
                    )}
                    <span className="font-medium">
                      {isCurrentlyProcessing ? 'Connecting...' : `Continue with ${provider.name}`}
                    </span>
                  </div>
                </Button>
              );
            })}
          </div>

          <Separator />

          {/* Information Section */}
          <div className="text-center space-y-2">
            <h4 className="font-medium text-gray-900">Why use social login?</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Quick and secure authentication</li>
              <li>• No need to remember another password</li>
              <li>• Instant access to book home services</li>
              <li>• Your data is protected and secure</li>
            </ul>
          </div>

          {/* Footer */}
          <div className="text-xs text-gray-500 text-center">
            By signing in, you agree to our Terms of Service and Privacy Policy.
            Your social account information is used only for authentication.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
