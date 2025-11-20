import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Building, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Lock as LockIcon 
} from "lucide-react";
import { formatCardNumber, formatExpiryDate } from "@/utils/payment-validation";

interface PaymentStepProps {
  serviceId: string;
  serviceName: string;
  formData: {
    paymentMethod: string;
    cardholderName: string;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    selectedBank: string;
    bankAccount: string;
    bankBranch: string;
    selectedProvider?: { name: string } | null;
    preferredDate: string;
    timePreference: string;
    address: string;
    [key: string]: any;
  };
  setFormData: (updater: (prev: any) => any) => void;
  pricing: {
    totalPrice: number;
  };
  estimatedHours: number;
  pendingDrafts: any[];
  aggregatePayments: (drafts: any[], current: any) => {
    services: any[];
    lineItems: Array<{
      serviceName: string;
      basePrice: number;
      addOns: number;
      discounts: number;
      total: number;
    }>;
    subtotal: number;
    totalDiscounts: number;
    grandTotal: number;
    commission: number;
  };
  paymentTouched: {
    cardNumber: boolean;
    expiryDate: boolean;
    cvv: boolean;
    cardholderName: boolean;
    selectedBank: boolean;
    bankAccount: boolean;
    bankBranch: boolean;
  };
  paymentErrors: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
    selectedBank: string;
    bankAccount: string;
    bankBranch: string;
  };
  validateField: (field: string, value: string) => void;
  markTouched: (field: string) => void;
  cardBrand: string;
}

const southAfricanBanks = [
  { code: "ABSA", name: "ABSA Bank" },
  { code: "FNB", name: "First National Bank (FNB)" },
  { code: "NEDBANK", name: "Nedbank" },
  { code: "STANDARD", name: "Standard Bank" },
  { code: "CAPITEC", name: "Capitec Bank" },
  { code: "INVESTEC", name: "Investec Bank" },
  { code: "DISCOVERY", name: "Discovery Bank" },
  { code: "TYMEBANK", name: "TymeBank" },
  { code: "BIDVEST", name: "Bidvest Bank" },
  { code: "AFRICAN", name: "African Bank" }
];

export function PaymentStep({
  serviceId,
  serviceName,
  formData,
  setFormData,
  pricing,
  estimatedHours,
  pendingDrafts,
  aggregatePayments,
  paymentTouched,
  paymentErrors,
  validateField,
  markTouched,
  cardBrand
}: PaymentStepProps) {
  // Create current draft from form data (plain variables, not hooks)
  const currentDraft = {
    serviceId,
    serviceName,
    ...formData,
    pricing,
    estimatedHours,
    timestamp: new Date().toISOString()
  };

  // Aggregate all services (pending + current)
  const paymentSnapshot = aggregatePayments(pendingDrafts, currentDraft);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Summary</h3>
        <p className="text-gray-600">Review your services and complete payment</p>
      </div>

      {/* Multi-Service Summary */}
      {paymentSnapshot.services.length > 1 && (
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Booking {paymentSnapshot.services.length} Services</span>
              <Badge className="bg-green-600">{paymentSnapshot.services.length}x Services</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {paymentSnapshot.lineItems.map((item, index) => (
              <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-sm">{item.serviceName}</h4>
                  <span className="font-bold text-primary">R{item.total}</span>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Base Price:</span>
                    <span>R{item.basePrice}</span>
                  </div>
                  {item.addOns > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Add-ons:</span>
                      <span>+R{item.addOns}</span>
                    </div>
                  )}
                  {item.discounts > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Discounts:</span>
                      <span>-R{item.discounts}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <Separator />
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>R{paymentSnapshot.subtotal}</span>
              </div>
              {paymentSnapshot.totalDiscounts > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>Total Discounts:</span>
                  <span>-R{paymentSnapshot.totalDiscounts}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg text-primary">
                <span>Grand Total:</span>
                <span>R{paymentSnapshot.grandTotal}</span>
              </div>
              <p className="text-xs text-gray-500 italic">
                Includes R{paymentSnapshot.commission} platform fee (15%)
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Method Selection */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Select Payment Method</Label>
        <div className="grid grid-cols-2 gap-4">
        <Card 
          className={`cursor-pointer border-2 transition-all ${
            formData.paymentMethod === "card" ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setFormData(prev => ({ ...prev, paymentMethod: "card" }))}
        >
          <CardContent className="p-4 text-center">
            <CreditCard className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h4 className="font-semibold">Credit/Debit Card</h4>
            <p className="text-sm text-gray-600">Secure card payment</p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer border-2 transition-all ${
            formData.paymentMethod === "bank" ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setFormData(prev => ({ ...prev, paymentMethod: "bank" }))}
        >
          <CardContent className="p-4 text-center">
            <Building className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h4 className="font-semibold">Bank Transfer</h4>
            <p className="text-sm text-gray-600">Direct bank transfer</p>
          </CardContent>
        </Card>
      </div>
    </div>

    {/* Card Payment Form */}
    {formData.paymentMethod === "card" && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Card Details
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Shield className="h-4 w-4 text-green-600" />
              <span>Secure Payment</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Cardholder Name */}
          <div>
            <Label htmlFor="cardholderName">Cardholder Name *</Label>
            <div className="relative">
              <Input
                id="cardholderName"
                data-testid="input-cardholder-name"
                placeholder="John Doe"
                value={formData.cardholderName}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, cardholderName: e.target.value }));
                  if (paymentTouched.cardholderName) {
                    validateField('cardholderName', e.target.value);
                  }
                }}
                onBlur={(e) => {
                  markTouched('cardholderName');
                  validateField('cardholderName', e.target.value);
                }}
                className={`pr-10 ${
                  paymentTouched.cardholderName && !paymentErrors.cardholderName 
                    ? 'border-green-500' 
                    : paymentTouched.cardholderName && paymentErrors.cardholderName 
                    ? 'border-red-500' 
                    : ''
                }`}
              />
              {paymentTouched.cardholderName && !paymentErrors.cardholderName && (
                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-600" />
              )}
            </div>
            {paymentTouched.cardholderName && paymentErrors.cardholderName && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {paymentErrors.cardholderName}
              </p>
            )}
          </div>

          {/* Card Number with Brand Detection */}
          <div>
            <Label htmlFor="cardNumber">Card Number *</Label>
            <div className="relative">
              <Input
                id="cardNumber"
                data-testid="input-card-number"
                placeholder="1234 5678 9012 3456"
                value={formData.cardNumber}
                onChange={(e) => {
                  const formatted = formatCardNumber(e.target.value);
                  setFormData(prev => ({ ...prev, cardNumber: formatted }));
                  if (paymentTouched.cardNumber) {
                    validateField('cardNumber', formatted);
                  }
                }}
                onBlur={(e) => {
                  markTouched('cardNumber');
                  validateField('cardNumber', e.target.value);
                }}
                maxLength={19}
                className={`pr-16 ${
                  paymentTouched.cardNumber && !paymentErrors.cardNumber 
                    ? 'border-green-500' 
                    : paymentTouched.cardNumber && paymentErrors.cardNumber 
                    ? 'border-red-500' 
                    : ''
                }`}
              />
              {/* Card Brand Icon */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {cardBrand && (
                  <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                    {cardBrand}
                  </span>
                )}
                {paymentTouched.cardNumber && !paymentErrors.cardNumber && cardBrand && (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
              </div>
            </div>
            {paymentTouched.cardNumber && paymentErrors.cardNumber && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {paymentErrors.cardNumber}
              </p>
            )}
          </div>

          {/* Expiry and CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiryDate">Expiry Date *</Label>
              <div className="relative">
                <Input
                  id="expiryDate"
                  data-testid="input-expiry-date"
                  placeholder="MM/YY"
                  value={formData.expiryDate}
                  onChange={(e) => {
                    const formatted = formatExpiryDate(e.target.value);
                    setFormData(prev => ({ ...prev, expiryDate: formatted }));
                    if (paymentTouched.expiryDate) {
                      validateField('expiryDate', formatted);
                    }
                  }}
                  onBlur={(e) => {
                    markTouched('expiryDate');
                    validateField('expiryDate', e.target.value);
                  }}
                  maxLength={5}
                  className={`pr-10 ${
                    paymentTouched.expiryDate && !paymentErrors.expiryDate 
                      ? 'border-green-500' 
                      : paymentTouched.expiryDate && paymentErrors.expiryDate 
                      ? 'border-red-500' 
                      : ''
                  }`}
                />
                {paymentTouched.expiryDate && !paymentErrors.expiryDate && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-600" />
                )}
              </div>
              {paymentTouched.expiryDate && paymentErrors.expiryDate && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {paymentErrors.expiryDate}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="cvv">CVV *</Label>
              <div className="relative">
                <Input
                  id="cvv"
                  data-testid="input-cvv"
                  placeholder={cardBrand === 'American Express' ? '1234' : '123'}
                  value={formData.cvv}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setFormData(prev => ({ ...prev, cvv: value }));
                    if (paymentTouched.cvv) {
                      validateField('cvv', value);
                    }
                  }}
                  onBlur={(e) => {
                    markTouched('cvv');
                    validateField('cvv', e.target.value);
                  }}
                  maxLength={cardBrand === 'American Express' ? 4 : 3}
                  type="password"
                  className={`pr-10 ${
                    paymentTouched.cvv && !paymentErrors.cvv 
                      ? 'border-green-500' 
                      : paymentTouched.cvv && paymentErrors.cvv 
                      ? 'border-red-500' 
                      : ''
                  }`}
                />
                {paymentTouched.cvv && !paymentErrors.cvv && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-600" />
                )}
              </div>
              {paymentTouched.cvv && paymentErrors.cvv && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {paymentErrors.cvv}
                </p>
              )}
            </div>
          </div>

          {/* Trust Badges */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
            <div className="flex items-start gap-3">
              <LockIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-green-800">
                <p className="font-semibold mb-1">Your payment is secure</p>
                <ul className="space-y-0.5 text-green-700">
                  <li>• 256-bit SSL encryption</li>
                  <li>• PCI DSS compliant</li>
                  <li>• No card details stored</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )}

    {/* Bank Transfer Form */}
    {formData.paymentMethod === "bank" && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="h-5 w-5 mr-2" />
            Bank Transfer Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Bank Selector */}
          <div>
            <Label htmlFor="selectedBank">Select Your Bank *</Label>
            <Select
              value={formData.selectedBank}
              onValueChange={(value) => {
                setFormData(prev => ({ ...prev, selectedBank: value }));
                if (paymentTouched.selectedBank) {
                  validateField('selectedBank', value);
                }
                if (formData.bankAccount) {
                  validateField('bankAccount', formData.bankAccount);
                }
              }}
            >
              <SelectTrigger 
                id="selectedBank"
                data-testid="select-bank"
                className={`${
                  paymentTouched.selectedBank && !paymentErrors.selectedBank 
                    ? 'border-green-500' 
                    : paymentTouched.selectedBank && paymentErrors.selectedBank 
                    ? 'border-red-500' 
                    : ''
                }`}
                onBlur={() => {
                  markTouched('selectedBank');
                  validateField('selectedBank', formData.selectedBank);
                }}
              >
                <SelectValue placeholder="Choose your bank..." />
              </SelectTrigger>
              <SelectContent>
                {southAfricanBanks.map((bank) => (
                  <SelectItem key={bank.code} value={bank.code}>
                    {bank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {paymentTouched.selectedBank && paymentErrors.selectedBank && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {paymentErrors.selectedBank}
              </p>
            )}
            {paymentTouched.selectedBank && !paymentErrors.selectedBank && formData.selectedBank && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Bank selected
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="bankAccount">Bank Account Number *</Label>
            <div className="relative">
              <Input
                id="bankAccount"
                data-testid="input-bank-account"
                placeholder="1234567890"
                value={formData.bankAccount}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setFormData(prev => ({ ...prev, bankAccount: value }));
                  if (paymentTouched.bankAccount) {
                    validateField('bankAccount', value);
                  }
                }}
                onBlur={(e) => {
                  markTouched('bankAccount');
                  validateField('bankAccount', e.target.value);
                }}
                maxLength={12}
                className={`pr-10 ${
                  paymentTouched.bankAccount && !paymentErrors.bankAccount 
                    ? 'border-green-500' 
                    : paymentTouched.bankAccount && paymentErrors.bankAccount 
                    ? 'border-red-500' 
                    : ''
                }`}
              />
              {paymentTouched.bankAccount && !paymentErrors.bankAccount && (
                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-600" />
              )}
            </div>
            {paymentTouched.bankAccount && paymentErrors.bankAccount && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {paymentErrors.bankAccount}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="bankBranch">Branch Code *</Label>
            <div className="relative">
              <Input
                id="bankBranch"
                data-testid="input-bank-branch"
                placeholder="123456"
                value={formData.bankBranch}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setFormData(prev => ({ ...prev, bankBranch: value }));
                  if (paymentTouched.bankBranch) {
                    validateField('bankBranch', value);
                  }
                }}
                onBlur={(e) => {
                  markTouched('bankBranch');
                  validateField('bankBranch', e.target.value);
                }}
                maxLength={6}
                className={`pr-10 ${
                  paymentTouched.bankBranch && !paymentErrors.bankBranch 
                    ? 'border-green-500' 
                    : paymentTouched.bankBranch && paymentErrors.bankBranch 
                    ? 'border-red-500' 
                    : ''
                }`}
              />
              {paymentTouched.bankBranch && !paymentErrors.bankBranch && (
                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-600" />
              )}
            </div>
            {paymentTouched.bankBranch && paymentErrors.bankBranch && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {paymentErrors.bankBranch}
              </p>
            )}
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> You will receive payment instructions via email after confirming this booking. 
              Your service will be scheduled once payment is received.
            </p>
          </div>
        </CardContent>
      </Card>
    )}

    {/* Booking Summary */}
    <Card className="bg-gray-50">
      <CardHeader>
        <CardTitle className="text-lg">Final Booking Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <span>Service</span>
          <span className="font-medium">{serviceName}</span>
        </div>
        <div className="flex justify-between">
          <span>Provider</span>
          <span className="font-medium">{formData.selectedProvider?.name}</span>
        </div>
        <div className="flex justify-between">
          <span>Date & Time</span>
          <span className="font-medium">{formData.preferredDate} at {formData.timePreference}</span>
        </div>
        <div className="flex justify-between">
          <span>Address</span>
          <span className="font-medium">{formData.address}</span>
        </div>
        <Separator />
        <div className="flex justify-between font-semibold text-lg">
          <span>Total Amount</span>
          <span className="text-primary">R{pricing.totalPrice}</span>
        </div>
        <p className="text-xs text-gray-500 text-center">
          Secured by Berry Events Bank - Your satisfaction guaranteed
        </p>
      </CardContent>
    </Card>
  </div>
  );
}
