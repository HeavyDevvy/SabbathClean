import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle, XCircle, Mail, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState('');

  // Get token from URL
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  const verifyEmailMutation = useMutation({
    mutationFn: async (token: string) => {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      setVerificationStatus('success');
      setMessage(data.message);
      toast({
        title: "Email Verified!",
        description: "Your email has been successfully verified. You can now access all Berry Events features.",
      });
    },
    onError: (error: any) => {
      setVerificationStatus('error');
      setMessage(error.message || 'Email verification failed');
      toast({
        title: "Verification Failed",
        description: error.message || "Email verification failed. Please try again.",
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    if (token) {
      verifyEmailMutation.mutate(token);
    } else {
      setVerificationStatus('error');
      setMessage('Invalid verification link. No token provided.');
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {verificationStatus === 'pending' && (
              <Mail className="h-16 w-16 text-blue-600 animate-pulse" />
            )}
            {verificationStatus === 'success' && (
              <CheckCircle className="h-16 w-16 text-green-600" />
            )}
            {verificationStatus === 'error' && (
              <XCircle className="h-16 w-16 text-red-600" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {verificationStatus === 'pending' && 'Verifying Email...'}
            {verificationStatus === 'success' && 'Email Verified!'}
            {verificationStatus === 'error' && 'Verification Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            {verificationStatus === 'pending' && 'Please wait while we verify your email address...'}
            {message && (
              <span className={verificationStatus === 'success' ? 'text-green-700' : 'text-red-700'}>
                {message}
              </span>
            )}
          </p>

          {verificationStatus === 'success' && (
            <div className="space-y-3">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  🎉 Welcome to Berry Events! Your account is now fully activated and you can access all features.
                </p>
              </div>
              <Button 
                onClick={() => setLocation("/auth")}
                className="w-full bg-blue-600 hover:bg-blue-700"
                data-testid="button-go-to-login"
              >
                Go to Login
              </Button>
            </div>
          )}

          {verificationStatus === 'error' && (
            <div className="space-y-3">
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-800">
                  The verification link may have expired or is invalid. Please try registering again or contact support.
                </p>
              </div>
              <div className="flex flex-col space-y-2">
                <Button 
                  onClick={() => setLocation("/auth")}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  data-testid="button-try-again"
                >
                  Try Registering Again
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setLocation("/contact")}
                  data-testid="button-contact-support"
                >
                  Contact Support
                </Button>
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <Button
              variant="ghost"
              onClick={() => setLocation("/")}
              className="text-gray-600 hover:text-gray-900"
              data-testid="button-back-home"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}