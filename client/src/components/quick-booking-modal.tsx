import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, User, Phone, Mail, X, CheckCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface QuickBookingModalProps {
  selectedService: string;
  selectedOption?: string;
  onClose: () => void;
}

export default function QuickBookingModal({ selectedService, selectedOption, onClose }: QuickBookingModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    date: "",
    time: "",
    duration: "",
    specialRequests: ""
  });

  const serviceNames: { [key: string]: string } = {
    "house-cleaning": "House Cleaning",
    "plumbing": "Plumbing Services",
    "electrical": "Electrical Services", 
    "chef-catering": "Chef & Catering",
    "waitering": "Waitering Services",
    "garden-care": "Garden Care"
  };

  const servicePricing: { [key: string]: string } = {
    "house-cleaning": "R280/hour",
    "plumbing": "R380/hour",
    "electrical": "R420/hour",
    "chef-catering": "R550/event",
    "waitering": "R220/hour",
    "garden-care": "R350/hour"
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // Simple validation
    const requiredFields = ["name", "phone", "email", "address", "date", "time"];
    const isValid = requiredFields.every(field => formData[field as keyof typeof formData]);
    
    if (isValid) {
      setStep(3); // Success step
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">
                Book {serviceNames[selectedService] || selectedService}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Quick and easy booking in just 2 steps
              </p>
            </div>
            <Button 
              onClick={onClose}
              variant="ghost" 
              size="sm"
              className="text-gray-500 hover:text-gray-700"
              data-testid="button-close-booking"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Your Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input 
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Enter your full name"
                      data-testid="input-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input 
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+27 XX XXX XXXX"
                      data-testid="input-phone"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input 
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="your@email.com"
                      data-testid="input-email"
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                  Service Location
                </h3>
                <div>
                  <Label htmlFor="address">Full Address *</Label>
                  <Textarea 
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Enter your complete address including suburb and postal code"
                    rows={3}
                    data-testid="input-address"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => setStep(2)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                  disabled={!formData.name || !formData.phone || !formData.email || !formData.address}
                  data-testid="button-continue-step-2"
                >
                  Continue to Scheduling
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {/* Service Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                  Service Details
                </h3>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-900">{serviceNames[selectedService]}</p>
                      <p className="text-sm text-gray-600">Professional service at your location</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600 text-lg">{servicePricing[selectedService]}</p>
                      <p className="text-xs text-gray-500">Transparent pricing</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="date">Preferred Date *</Label>
                    <Input 
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange("date", e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      data-testid="input-date"
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Preferred Time *</Label>
                    <Select value={formData.time} onValueChange={(value) => handleInputChange("time", value)}>
                      <SelectTrigger data-testid="select-time">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="08:00">8:00 AM</SelectItem>
                        <SelectItem value="09:00">9:00 AM</SelectItem>
                        <SelectItem value="10:00">10:00 AM</SelectItem>
                        <SelectItem value="11:00">11:00 AM</SelectItem>
                        <SelectItem value="12:00">12:00 PM</SelectItem>
                        <SelectItem value="13:00">1:00 PM</SelectItem>
                        <SelectItem value="14:00">2:00 PM</SelectItem>
                        <SelectItem value="15:00">3:00 PM</SelectItem>
                        <SelectItem value="16:00">4:00 PM</SelectItem>
                        <SelectItem value="17:00">5:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration</Label>
                    <Select value={formData.duration} onValueChange={(value) => handleInputChange("duration", value)}>
                      <SelectTrigger data-testid="select-duration">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 hour</SelectItem>
                        <SelectItem value="2">2 hours</SelectItem>
                        <SelectItem value="3">3 hours</SelectItem>
                        <SelectItem value="4">4 hours</SelectItem>
                        <SelectItem value="full-day">Full day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
                <Textarea 
                  id="specialRequests"
                  value={formData.specialRequests}
                  onChange={(e) => handleInputChange("specialRequests", e.target.value)}
                  placeholder="Any specific requirements or special instructions..."
                  rows={3}
                  data-testid="input-special-requests"
                />
              </div>

              <div className="flex justify-between">
                <Button 
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="px-6 py-2"
                  data-testid="button-back-step-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
                  disabled={!formData.date || !formData.time}
                  data-testid="button-book-now"
                >
                  Book Now
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-6 py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Booking Confirmed!
                </h3>
                <p className="text-gray-600">
                  Your {serviceNames[selectedService].toLowerCase()} service has been booked successfully.
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold text-gray-900">Service:</p>
                    <p className="text-gray-600">{serviceNames[selectedService]}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Date & Time:</p>
                    <p className="text-gray-600">{formData.date} at {formData.time}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Contact:</p>
                    <p className="text-gray-600">{formData.phone}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Location:</p>
                    <p className="text-gray-600 text-xs">{formData.address}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  A confirmation SMS will be sent to your phone number.
                </p>
                <p className="text-sm text-gray-600">
                  Our team will contact you within 1 hour to confirm details.
                </p>
              </div>
              <Button 
                onClick={onClose}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                data-testid="button-close-success"
              >
                Done
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}