import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Mail, MessageCircle, Phone, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CustomServiceContact() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleEmailContact = () => {
    const subject = "Custom Service Request - Berry Events";
    const body = `Hi Berry Events Team,

I need a custom service solution that's not listed on your standard services.

Please provide me with:
- Service consultation
- Custom pricing quote  
- Timeline and availability

Service details:
[Please describe your custom service needs here]

Best regards`;
    
    const mailtoUrl = `mailto:customercare@berryevents.co.za?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    
    setIsOpen(false);
    toast({
      title: "Email App Opened!",
      description: "Contact customercare@berryevents.co.za for custom solutions.",
    });
  };

  const handleWhatsAppContact = () => {
    const message = `Hi Berry Events! 👋

I'm interested in a custom service solution that's not listed on your website.

Could you please help me with:
✅ Custom service consultation
✅ Personalized pricing quote
✅ Timeline and availability

Service needed: [Please describe your requirements]

Thank you!`;
    
    const whatsappUrl = `https://api.whatsapp.com/send?phone=27612796476&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    setIsOpen(false);
    toast({
      title: "WhatsApp Opened!",
      description: "Chat with us at +27 61 279 6476 for custom solutions.",
    });
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="w-full border-purple-300 text-purple-600 hover:bg-purple-50"
        data-testid="button-custom-service-contact"
      >
        <Users className="h-4 w-4 mr-2" />
        Contact Us for Custom Solutions
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-purple-600" />
              Custom Service Solutions
            </DialogTitle>
            <DialogDescription>
              Need a service that's not listed? Our team is here to help with custom solutions tailored to your needs.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-sm text-gray-600 bg-purple-50 p-3 rounded-lg">
              <p className="font-medium text-purple-900 mb-1">We specialize in:</p>
              <ul className="list-disc list-inside space-y-1 text-purple-700">
                <li>Event planning & coordination</li>
                <li>Large-scale cleaning projects</li>
                <li>Specialized maintenance services</li>
                <li>Corporate catering solutions</li>
                <li>Multi-service packages</li>
              </ul>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Button
                onClick={handleEmailContact}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                data-testid="button-email-custom-contact"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email: customercare@berryevents.co.za
              </Button>
              
              <Button
                onClick={handleWhatsAppContact}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                data-testid="button-whatsapp-custom-contact"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp: +27 61 279 6476
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                📞 Available Monday-Friday, 8AM-6PM (SAST)
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}