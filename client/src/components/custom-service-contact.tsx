import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FormData {
  name: string;
  surname: string;
  email: string;
  contactNumber: string;
  description: string;
}

interface FormErrors {
  name?: string;
  surname?: string;
  email?: string;
  contactNumber?: string;
  description?: string;
}

export default function CustomServiceContact() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    surname: "",
    email: "",
    contactNumber: "",
    description: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const validateField = (name: keyof FormData, value: string): string | undefined => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Name is required";
        break;
      case "surname":
        if (!value.trim()) return "Surname is required";
        break;
      case "email":
        if (!value.trim()) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return "Valid email address is required";
        }
        break;
      case "contactNumber":
        if (!value.trim()) return "Contact number is required";
        const cleanNumber = value.replace(/[\s\-\(\)\+]/g, "");
        if (cleanNumber.length < 10) {
          return "Valid contact number is required (min 10 digits)";
        }
        if (!/^[\d\s\-\(\)\+]+$/.test(value)) {
          return "Contact number can only contain digits, spaces, +, -, ( )";
        }
        break;
      case "description":
        if (!value.trim()) return "Description is required";
        if (value.trim().length < 10) {
          return "Description must be at least 10 characters";
        }
        if (value.length > 500) {
          return "Description must not exceed 500 characters";
        }
        break;
    }
    return undefined;
  };

  const handleChange = (name: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (name: keyof FormData) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name]);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    (Object.keys(formData) as Array<keyof FormData>).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched({
      name: true,
      surname: true,
      email: true,
      contactNumber: true,
      description: true,
    });

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: EMAIL FUNCTIONALITY - Integrate with email service to send to support@berryevents.co.za
      // This is a placeholder implementation that logs the data
      // In production, replace this with actual email service (EmailJS, SendGrid, or backend API)
      
      const emailData = {
        to: "support@berryevents.co.za",
        subject: `New Custom Solution Request from ${formData.name} ${formData.surname}`,
        body: `
Custom Solution Request

Name: ${formData.name} ${formData.surname}
Email: ${formData.email}
Contact Number: ${formData.contactNumber}

Description:
${formData.description}

---
Submitted from Berry Events Website
Date: ${new Date().toLocaleString()}
        `.trim(),
      };

      console.log("📧 Email Data (to be sent):", emailData);

      // Simulate email sending delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Success flow
      setIsOpen(false);
      setShowSuccess(true);
      
      // Clear form
      setFormData({
        name: "",
        surname: "",
        email: "",
        contactNumber: "",
        description: "",
      });
      setErrors({});
      setTouched({});

      // Auto-close success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);

    } catch (error) {
      console.error("Error submitting form:", error);
      setIsOpen(false);
      setShowError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.name.trim() &&
      formData.surname.trim() &&
      formData.email.trim() &&
      formData.contactNumber.trim() &&
      formData.description.trim().length >= 10 &&
      formData.description.trim().length <= 500 &&
      !errors.name &&
      !errors.surname &&
      !errors.email &&
      !errors.contactNumber &&
      !errors.description
    );
  };

  const characterCount = formData.description.length;

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="secondary"
        size="lg"
        className="font-semibold px-8 py-3 text-white"
        style={{ backgroundColor: "#C56B86" }}
        data-testid="contact-custom-services"
      >
        Contact Us for Custom Solutions
      </Button>

      {/* Main Contact Form Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg" style={{ backgroundColor: "#F7F2EF" }}>
          <button
            onClick={() => setIsOpen(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            style={{ color: "#3C0920" }}
            data-testid="button-close-modal"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>

          <DialogHeader>
            <DialogTitle className="text-2xl font-bold" style={{ color: "#44062D" }}>
              Request Custom Solution
            </DialogTitle>
            <DialogDescription style={{ color: "#3C0920" }}>
              Tell us what you need and our team will be in touch
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* Name Field */}
            <div>
              <Label htmlFor="name" style={{ color: "#3C0920" }}>
                Name <span style={{ color: "#C56B86" }}>*</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                onBlur={() => handleBlur("name")}
                maxLength={100}
                className="mt-1"
                style={{
                  borderColor: touched.name && errors.name ? "#C56B86" : "#EED1C4",
                }}
                data-testid="input-name"
              />
              {touched.name && errors.name && (
                <p className="text-sm mt-1" style={{ color: "#C56B86" }} data-testid="error-name">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Surname Field */}
            <div>
              <Label htmlFor="surname" style={{ color: "#3C0920" }}>
                Surname <span style={{ color: "#C56B86" }}>*</span>
              </Label>
              <Input
                id="surname"
                type="text"
                placeholder="Enter your surname"
                value={formData.surname}
                onChange={(e) => handleChange("surname", e.target.value)}
                onBlur={() => handleBlur("surname")}
                maxLength={100}
                className="mt-1"
                style={{
                  borderColor: touched.surname && errors.surname ? "#C56B86" : "#EED1C4",
                }}
                data-testid="input-surname"
              />
              {touched.surname && errors.surname && (
                <p className="text-sm mt-1" style={{ color: "#C56B86" }} data-testid="error-surname">
                  {errors.surname}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <Label htmlFor="email" style={{ color: "#3C0920" }}>
                Email Address <span style={{ color: "#C56B86" }}>*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                onBlur={() => handleBlur("email")}
                maxLength={150}
                className="mt-1"
                style={{
                  borderColor: touched.email && errors.email ? "#C56B86" : "#EED1C4",
                }}
                data-testid="input-email"
              />
              {touched.email && errors.email && (
                <p className="text-sm mt-1" style={{ color: "#C56B86" }} data-testid="error-email">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Contact Number Field */}
            <div>
              <Label htmlFor="contactNumber" style={{ color: "#3C0920" }}>
                Contact Number <span style={{ color: "#C56B86" }}>*</span>
              </Label>
              <Input
                id="contactNumber"
                type="tel"
                placeholder="e.g. 0812345678"
                value={formData.contactNumber}
                onChange={(e) => handleChange("contactNumber", e.target.value)}
                onBlur={() => handleBlur("contactNumber")}
                maxLength={15}
                className="mt-1"
                style={{
                  borderColor:
                    touched.contactNumber && errors.contactNumber ? "#C56B86" : "#EED1C4",
                }}
                data-testid="input-contact-number"
              />
              {touched.contactNumber && errors.contactNumber && (
                <p className="text-sm mt-1" style={{ color: "#C56B86" }} data-testid="error-contact-number">
                  {errors.contactNumber}
                </p>
              )}
            </div>

            {/* Description Field */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <Label htmlFor="description" style={{ color: "#3C0920" }}>
                  Description <span style={{ color: "#C56B86" }}>*</span>
                </Label>
                <span className="text-sm" style={{ color: "#3C0920" }} data-testid="character-counter">
                  {characterCount}/500 characters
                </span>
              </div>
              <Textarea
                id="description"
                placeholder="Please describe what you're looking for..."
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                onBlur={() => handleBlur("description")}
                maxLength={500}
                rows={4}
                className="mt-1 resize-none"
                style={{
                  borderColor:
                    touched.description && errors.description ? "#C56B86" : "#EED1C4",
                }}
                data-testid="input-description"
              />
              {touched.description && errors.description && (
                <p className="text-sm mt-1" style={{ color: "#C56B86" }} data-testid="error-description">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!isFormValid() || isSubmitting}
              className="w-full font-semibold text-white"
              style={{ backgroundColor: "#C56B86" }}
              data-testid="button-submit-form"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send to Berry Team"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md text-center" style={{ backgroundColor: "#F7F2EF" }}>
          <div className="flex flex-col items-center space-y-4 py-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#C56B86" }}
            >
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold" style={{ color: "#44062D" }}>
              Thank You!
            </DialogTitle>
            <DialogDescription className="text-base" style={{ color: "#3C0920" }}>
              Your custom solution request has been received. Our Berry team will be in touch shortly.
            </DialogDescription>
            <Button
              onClick={() => setShowSuccess(false)}
              className="font-semibold text-white"
              style={{ backgroundColor: "#C56B86" }}
              data-testid="button-close-success"
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Modal */}
      <Dialog open={showError} onOpenChange={setShowError}>
        <DialogContent className="sm:max-w-md text-center" style={{ backgroundColor: "#F7F2EF" }}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold" style={{ color: "#44062D" }}>
              Oops!
            </DialogTitle>
            <DialogDescription className="text-base" style={{ color: "#3C0920" }}>
              Something went wrong. Please try again or contact us directly at{" "}
              <a href="mailto:support@berryevents.co.za" style={{ color: "#C56B86" }}>
                support@berryevents.co.za
              </a>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button
              onClick={() => {
                setShowError(false);
                setIsOpen(true);
              }}
              className="flex-1 font-semibold text-white"
              style={{ backgroundColor: "#C56B86" }}
              data-testid="button-try-again"
            >
              Try Again
            </Button>
            <Button
              onClick={() => setShowError(false)}
              variant="outline"
              className="flex-1"
              style={{ borderColor: "#C56B86", color: "#44062D" }}
              data-testid="button-close-error"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
