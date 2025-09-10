import type { Express } from "express";
import { storage } from "./storage";
import { createInsertSchema } from "drizzle-zod";
import { supportTickets } from "@shared/schema";
import { z } from "zod";
import { nanoid } from "nanoid";

// Contact form schema
const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  category: z.enum([
    "general",
    "booking", 
    "payment",
    "service_quality",
    "technical",
    "provider",
    "safety",
    "feedback"
  ]),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export function registerSupportRoutes(app: Express) {
  
  // Contact form submission endpoint
  app.post('/api/support/contact', async (req, res) => {
    try {
      // Validate the request body
      const validationResult = contactFormSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid form data',
          errors: validationResult.error.errors
        });
      }

      const { name, email, phone, category, subject, message } = validationResult.data;

      // Generate a ticket number
      const ticketNumber = `BERRY-${Date.now()}-${nanoid(6).toUpperCase()}`;

      // For now, we'll log the contact form submission
      // In a full implementation, you might create a support ticket or send an email
      console.log('📨 Contact form submission received:', {
        ticketNumber,
        name,
        email,
        phone,
        category,
        subject,
        message,
        timestamp: new Date().toISOString()
      });

      // TODO: In a full implementation, you might:
      // 1. Save to support_tickets table if user is authenticated
      // 2. Send email notification to support team
      // 3. Send confirmation email to user
      // 4. Integrate with support ticketing system

      // For now, return success response
      res.status(201).json({ 
        message: 'Your message has been received successfully. We will contact you within 24 hours.',
        ticketNumber: ticketNumber,
        estimatedResponse: '24 hours'
      });

    } catch (error: any) {
      console.error('❌ Contact form submission error:', error);
      res.status(500).json({ 
        message: 'Failed to submit your message. Please try again or call our support line at 0800 237 779.' 
      });
    }
  });

  // Get support ticket (for authenticated users)
  app.get('/api/support/tickets/:ticketId', async (req, res) => {
    try {
      const { ticketId } = req.params;
      
      // TODO: Implement ticket lookup
      // For now, return placeholder
      res.json({
        message: 'Support ticket system coming soon',
        ticketId: ticketId
      });

    } catch (error: any) {
      console.error('❌ Support ticket lookup error:', error);
      res.status(500).json({ message: 'Failed to retrieve support ticket' });
    }
  });

  // Create support ticket (for authenticated users)
  app.post('/api/support/tickets', async (req, res) => {
    try {
      // TODO: Implement full support ticket creation
      // This would use the supportTickets table from the schema
      
      res.status(501).json({
        message: 'Support ticket creation coming soon. Please use the contact form for now.'
      });

    } catch (error: any) {
      console.error('❌ Support ticket creation error:', error);
      res.status(500).json({ message: 'Failed to create support ticket' });
    }
  });

  // Get FAQ data
  app.get('/api/support/faq', async (req, res) => {
    try {
      // Return static FAQ data for now
      // In a full implementation, this might come from a database
      const faqs = [
        {
          id: 'booking',
          category: 'Booking',
          question: 'How do I book a service?',
          answer: 'You can book a service by browsing our services page, selecting your desired service, filling in your details and location, and confirming your booking. Payment is processed securely through Berry Events Bank.'
        },
        {
          id: 'payment',
          category: 'Payment',
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit cards, debit cards, and bank transfers through our secure Berry Events Bank payment system. All payments are protected with escrow-style security.'
        },
        {
          id: 'cancellation',
          category: 'Booking',
          question: 'Can I cancel or reschedule my booking?',
          answer: 'Yes, you can cancel or reschedule your booking up to 24 hours before the scheduled time without any fees. Cancellations within 24 hours may incur a small cancellation fee.'
        }
      ];

      res.json({ faqs });

    } catch (error: any) {
      console.error('❌ FAQ retrieval error:', error);
      res.status(500).json({ message: 'Failed to retrieve FAQ data' });
    }
  });
}