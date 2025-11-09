import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard,
  Plus,
  Trash2,
  Shield,
  Settings,
  Bell,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

interface PaymentMethod {
  id: string;
  type: string;
  cardLast4?: string;
  cardBrand?: string;
  cardHolderName?: string;
  expiryMonth?: number;
  expiryYear?: number;
  bankName?: string;
  nickname?: string;
  isDefault: boolean;
}

export default function UserProfileModal({ isOpen, onClose, user }: UserProfileModalProps) {
  const [activeTab, setActiveTab] = useState("profile");
  const [showNewCard, setShowNewCard] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    province: user?.province || ''
  });
  
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: 'card',
    cardNumber: '',
    cardHolderName: '',
    expiryMonth: '',
    expiryYear: '',
    cardBrand: '',
    nickname: '',
    isDefault: false
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    bookingReminders: true,
    providerUpdates: true
  });

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isBiometricsEnabled, setIsBiometricsEnabled] = useState(false);

  const { toast} = useToast();
  const queryClient = useQueryClient();

  // Fetch payment methods
  const { data: paymentMethods = [], isLoading: paymentMethodsLoading } = useQuery({
    queryKey: ['/api/payment-methods'],
    enabled: isOpen && activeTab === 'payment'
  });

  const paymentMethodsArray = Array.isArray(paymentMethods) ? paymentMethods : [];

  // Fetch security settings
  const { data: securitySettings, isLoading: securityLoading } = useQuery<{
    is2FAEnabled: boolean;
    isBiometricsEnabled: boolean;
  }>({
    queryKey: ['/api/user/security-settings'],
    enabled: isOpen && activeTab === 'security',
    retry: false
  });

  // Update local state when security settings are loaded
  useEffect(() => {
    if (securitySettings) {
      setIs2FAEnabled(securitySettings.is2FAEnabled || false);
      setIsBiometricsEnabled(securitySettings.isBiometricsEnabled || false);
    }
  }, [securitySettings]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('PUT', '/api/user/profile', data);
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    }
  });

  // Add payment method mutation
  const addPaymentMethodMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/payment-methods', data);
    },
    onSuccess: () => {
      toast({
        title: "Payment Method Added",
        description: "Your payment method has been securely saved.",
      });
      setShowNewCard(false);
      setNewPaymentMethod({
        type: 'card',
        cardNumber: '',
        cardHolderName: '',
        expiryMonth: '',
        expiryYear: '',
        cardBrand: '',
        nickname: '',
        isDefault: false
      });
      queryClient.invalidateQueries({ queryKey: ['/api/payment-methods'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Add Payment Method",
        description: error.message || "Failed to save payment method.",
        variant: "destructive",
      });
    }
  });

  // Remove payment method mutation
  const removePaymentMethodMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/payment-methods/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Payment Method Removed",
        description: "Payment method has been removed from your account.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/payment-methods'] });
    },
    onError: (error: any) => {
      toast({
        title: "Removal Failed",
        description: error.message || "Failed to remove payment method.",
        variant: "destructive",
      });
    }
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      return await apiRequest('POST', '/api/user/change-password', data);
    },
    onSuccess: () => {
      toast({
        title: "Password Changed",
        description: "Your password has been successfully updated.",
      });
      setShowChangePassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    },
    onError: (error: any) => {
      toast({
        title: "Password Change Failed",
        description: error.message || "Failed to change password.",
        variant: "destructive",
      });
    }
  });

  // Toggle 2FA mutation
  const toggle2FAMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      return await apiRequest('POST', '/api/user/toggle-2fa', { enabled });
    },
    onSuccess: (data: any) => {
      setIs2FAEnabled(data.is2FAEnabled);
      toast({
        title: data.is2FAEnabled ? "2FA Enabled" : "2FA Disabled",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/security-settings'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update 2FA settings.",
        variant: "destructive",
      });
    }
  });

  // Toggle biometrics mutation
  const toggleBiometricsMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      return await apiRequest('POST', '/api/user/toggle-biometrics', { enabled });
    },
    onSuccess: (data: any) => {
      setIsBiometricsEnabled(data.isBiometricsEnabled);
      toast({
        title: data.isBiometricsEnabled ? "Biometrics Enabled" : "Biometrics Disabled",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/security-settings'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update biometric settings.",
        variant: "destructive",
      });
    }
  });

  // Auto-detect card brand
  const detectCardBrand = (number: string) => {
    const cleanNumber = number.replace(/\s/g, '');
    if (cleanNumber.startsWith('4')) return 'visa';
    if (cleanNumber.startsWith('5') || cleanNumber.startsWith('2')) return 'mastercard';
    if (cleanNumber.startsWith('3')) return 'amex';
    return 'unknown';
  };

  // Format card number with spaces
  const formatCardNumber = (number: string) => {
    const cleanNumber = number.replace(/\s/g, '');
    const formatted = cleanNumber.replace(/(.{4})/g, '$1 ');
    return formatted.trim();
  };

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    const brand = detectCardBrand(value);
    setNewPaymentMethod(prev => ({
      ...prev,
      cardNumber: formatted,
      cardBrand: brand
    }));
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handleAddPaymentMethod = () => {
    if (!newPaymentMethod.cardNumber || !newPaymentMethod.cardHolderName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Create secure payment method (no CVV stored)
    const securePaymentMethod = {
      ...newPaymentMethod,
      cardLast4: newPaymentMethod.cardNumber.slice(-4),
      cardNumber: undefined // Remove full card number for security
    };

    addPaymentMethodMutation.mutate(securePaymentMethod);
  };

  const handleRemovePaymentMethod = (id: string) => {
    removePaymentMethodMutation.mutate(id);
  };

  const handleChangePassword = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in all password fields.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirm password do not match.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
  };

  const handleToggle2FA = () => {
    toggle2FAMutation.mutate(!is2FAEnabled);
  };

  const handleToggleBiometrics = async () => {
    if (!isBiometricsEnabled) {
      if ('credentials' in navigator && 'create' in navigator.credentials) {
        toggleBiometricsMutation.mutate(true);
      } else {
        toast({
          title: "Not Supported",
          description: "Biometric authentication is not supported on this device.",
          variant: "destructive",
        });
      }
    } else {
      toggleBiometricsMutation.mutate(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-4xl max-h-[95vh] overflow-y-auto"
        aria-describedby="profile-modal-description"
        data-testid="user-profile-modal"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Account Settings
          </DialogTitle>
          <div id="profile-modal-description" className="sr-only">
            Manage your account settings, payment methods, and preferences
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" data-testid="tab-profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="payment" data-testid="tab-payment">
              <CreditCard className="h-4 w-4 mr-2" />
              Payment
            </TabsTrigger>
            <TabsTrigger value="notifications" data-testid="tab-notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" data-testid="tab-security">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                      data-testid="input-profile-firstName"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                      data-testid="input-profile-lastName"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    data-testid="input-profile-email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    data-testid="input-profile-phone"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={profileData.address}
                    onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                    data-testid="input-profile-address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={profileData.city}
                      onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                      data-testid="input-profile-city"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="province">Province</Label>
                    <Input
                      id="province"
                      value={profileData.province}
                      onChange={(e) => setProfileData(prev => ({ ...prev, province: e.target.value }))}
                      data-testid="input-profile-province"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleSaveProfile}
                  disabled={updateProfileMutation.isPending}
                  data-testid="save-profile-button"
                >
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Methods Tab */}
          <TabsContent value="payment" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Saved Payment Methods</h3>
              <Button 
                onClick={() => setShowNewCard(true)}
                disabled={showNewCard}
                data-testid="add-payment-method-button"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </div>

            {/* Add New Card Form */}
            {showNewCard && (
              <Card>
                <CardHeader>
                  <CardTitle>Add New Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      value={newPaymentMethod.cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      data-testid="input-card-number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardHolder">Card Holder Name</Label>
                    <Input
                      id="cardHolder"
                      placeholder="John Doe"
                      value={newPaymentMethod.cardHolderName}
                      onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, cardHolderName: e.target.value }))}
                      data-testid="input-card-holder"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryMonth">Expiry Month</Label>
                      <Select 
                        value={newPaymentMethod.expiryMonth}
                        onValueChange={(value) => setNewPaymentMethod(prev => ({ ...prev, expiryMonth: value }))}
                      >
                        <SelectTrigger data-testid="select-expiry-month">
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => (
                            <SelectItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                              {String(i + 1).padStart(2, '0')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expiryYear">Expiry Year</Label>
                      <Select 
                        value={newPaymentMethod.expiryYear}
                        onValueChange={(value) => setNewPaymentMethod(prev => ({ ...prev, expiryYear: value }))}
                      >
                        <SelectTrigger data-testid="select-expiry-year">
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 10 }, (_, i) => {
                            const year = new Date().getFullYear() + i;
                            return (
                              <SelectItem key={year} value={String(year)}>
                                {year}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nickname">Nickname (Optional)</Label>
                    <Input
                      id="nickname"
                      placeholder="e.g. Primary Card"
                      value={newPaymentMethod.nickname}
                      onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, nickname: e.target.value }))}
                      data-testid="input-card-nickname"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      id="setDefault"
                      type="checkbox"
                      checked={newPaymentMethod.isDefault}
                      onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, isDefault: e.target.checked }))}
                      className="rounded border-gray-300"
                      data-testid="checkbox-set-default"
                    />
                    <Label htmlFor="setDefault" className="text-sm">
                      Set as default payment method
                    </Label>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <Shield className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium">Security Notice</p>
                        <p>Your CVV is never stored for your security. You'll be asked to enter it during checkout.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button 
                      onClick={handleAddPaymentMethod}
                      disabled={addPaymentMethodMutation.isPending}
                      data-testid="save-payment-method-button"
                    >
                      {addPaymentMethodMutation.isPending ? 'Saving...' : 'Save Payment Method'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowNewCard(false)}
                      data-testid="cancel-payment-method-button"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Existing Payment Methods */}
            {paymentMethodsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="text-gray-600 mt-2">Loading payment methods...</p>
              </div>
            ) : paymentMethodsArray.length > 0 ? (
              <div className="space-y-4">
                {paymentMethodsArray.map((method: PaymentMethod) => (
                  <Card key={method.id} className="relative">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {method.nickname || `${method.cardBrand?.toUpperCase()} ending in ${method.cardLast4}`}
                            </p>
                            <p className="text-sm text-gray-600">
                              Expires {method.expiryMonth}/{method.expiryYear}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {method.isDefault && (
                            <Badge variant="secondary">Default</Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemovePaymentMethod(method.id)}
                            data-testid={`remove-payment-${method.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No payment methods saved yet</p>
                <p className="text-sm text-gray-500">Add a payment method for faster checkout</p>
              </div>
            )}
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Notification Preferences</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setNotifications({
                          emailNotifications: true,
                          smsNotifications: true,
                          pushNotifications: true,
                          marketingEmails: true,
                          bookingReminders: true,
                          providerUpdates: true
                        });
                      }}
                      data-testid="select-all-notifications"
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setNotifications({
                          emailNotifications: false,
                          smsNotifications: false,
                          pushNotifications: false,
                          marketingEmails: false,
                          bookingReminders: false,
                          providerUpdates: false
                        });
                      }}
                      data-testid="deselect-all-notifications"
                    >
                      Deselect All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label htmlFor={key} className="cursor-pointer">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Label>
                    <input
                      id={key}
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setNotifications(prev => ({ ...prev, [key]: e.target.checked }))}
                      className="rounded border-gray-300"
                      data-testid={`notification-${key}`}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Password & Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!showChangePassword ? (
                  <Button 
                    variant="outline" 
                    onClick={() => setShowChangePassword(true)}
                    data-testid="change-password-button"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                ) : (
                  <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-medium">Change Password</h4>
                    
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          data-testid="input-current-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                          data-testid="input-new-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          data-testid="input-confirm-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <Button 
                        onClick={handleChangePassword} 
                        disabled={changePasswordMutation.isPending}
                        data-testid="save-password-button"
                      >
                        {changePasswordMutation.isPending ? 'Saving...' : 'Save Password'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowChangePassword(false);
                          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                        }}
                        disabled={changePasswordMutation.isPending}
                        data-testid="cancel-password-button"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium mb-1">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-600">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        {toggle2FAMutation.isPending ? 'Updating...' : (is2FAEnabled ? 'Enabled' : 'Disabled')}
                      </span>
                      <input
                        id="toggle2FA"
                        type="checkbox"
                        checked={is2FAEnabled}
                        onChange={handleToggle2FA}
                        disabled={toggle2FAMutation.isPending}
                        className="rounded border-gray-300"
                        data-testid="toggle-2fa"
                      />
                    </div>
                  </div>
                  {is2FAEnabled && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-800">
                        Two-factor authentication is active. You'll need to enter a code from your authenticator app when logging in.
                      </p>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium mb-1">Biometric Authentication</h4>
                      <p className="text-sm text-gray-600">
                        Use fingerprint or face recognition for secure access
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        {toggleBiometricsMutation.isPending ? 'Updating...' : (isBiometricsEnabled ? 'Enabled' : 'Disabled')}
                      </span>
                      <input
                        id="toggleBiometrics"
                        type="checkbox"
                        checked={isBiometricsEnabled}
                        onChange={handleToggleBiometrics}
                        disabled={toggleBiometricsMutation.isPending}
                        className="rounded border-gray-300"
                        data-testid="toggle-biometrics"
                      />
                    </div>
                  </div>
                  {isBiometricsEnabled && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        Biometric authentication is enabled for this device. You can use fingerprint or face recognition to log in.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}