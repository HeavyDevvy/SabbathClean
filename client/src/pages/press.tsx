import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Newspaper, Mail, Download } from "lucide-react";

export default function Press() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12 px-4" data-testid="page-press">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Press & Media</h1>
        <p className="text-xl text-gray-600 mb-12">Media inquiries and press resources for Berry Events</p>
        
        <Card className="shadow-lg">
          <CardContent className="p-8">
            <Newspaper className="h-16 w-16 text-blue-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">Media Contact</h2>
            <p className="text-gray-600 mb-6">For press inquiries, interviews, and media requests</p>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => window.location.href = 'mailto:press@berryevents.co.za'}
              data-testid="button-contact-press"
            >
              <Mail className="h-4 w-4 mr-2" />
              Contact Press Team
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}