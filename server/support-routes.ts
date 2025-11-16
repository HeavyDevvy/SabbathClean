import type { Express } from "express";
import { storage } from "./storage";
import { createInsertSchema } from "drizzle-zod";
import { supportTickets } from "@shared/schema";
import { z } from "zod";
import { nanoid } from "nanoid";
import sgMail from "@sendgrid/mail";

// Initialize SendGrid if API key is available
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

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

// Feedback form schema  
const feedbackFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  feedbackType: z.enum([
    "general",
    "service_quality",
    "app_experience", 
    "feature_request",
    "complaint",
    "compliment",
    "suggestion"
  ]),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  rating: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

// Email sending utility functions
const sendContactConfirmationEmail = async (email: string, name: string, ticketNumber: string, subject: string) => {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SendGrid not configured, skipping contact confirmation email');
    return;
  }

  const msg = {
    to: email,
    from: 'support@berryevents.co.za',
    subject: `We received your message - Ticket ${ticketNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #44062D;">Thank you for contacting Berry Events</h2>
        <p>Hi ${name},</p>
        <p>We've received your message regarding: <strong>${subject}</strong></p>
        <div style="background-color: #F7F2EF; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Ticket Number:</strong> ${ticketNumber}</p>
          <p style="margin: 5px 0 0 0;"><strong>Estimated Response:</strong> Within 24 hours</p>
        </div>
        <p>Our support team will review your message and respond as soon as possible.</p>
        <p>If you need urgent assistance, please call us at: <strong>0800 237 779</strong></p>
        <hr style="border: none; border-top: 1px solid #EED1C4; margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">Berry Events - Your trusted home services platform</p>
      </div>
    `
  };

  try {
    await sgMail.send(msg);
    console.log('Contact confirmation email sent to:', email);
  } catch (error) {
    console.error('Error sending contact confirmation email:', error);
  }
};

const sendSupportNotificationEmail = async (ticketNumber: string, name: string, email: string, category: string, subject: string, message: string, phone?: string) => {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SendGrid not configured, skipping support notification email');
    return;
  }

  const msg = {
    to: 'support@berryevents.co.za',
    from: 'noreply@berryevents.co.za',
    subject: `New Support Ticket ${ticketNumber} - ${category}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #44062D;">New Support Ticket Received</h2>
        <div style="background-color: #F7F2EF; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Ticket Number:</strong> ${ticketNumber}</p>
          <p><strong>Category:</strong> ${category}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
          <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <div style="background-color: #fff; padding: 15px; border-left: 4px solid #44062D; margin: 20px 0;">
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        </div>
        <hr style="border: none; border-top: 1px solid #EED1C4; margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">Berry Events Support System</p>
      </div>
    `
  };

  try {
    await sgMail.send(msg);
    console.log('Support notification email sent for ticket:', ticketNumber);
  } catch (error) {
    console.error('Error sending support notification email:', error);
  }
};

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

      // Log the contact form submission (redacted for privacy)
      console.log('📨 Contact form submission received:', {
        ticketNumber,
        category,
        hasPhone: !!phone,
        timestamp: new Date().toISOString()
      });

      // Save to support_tickets table
      try {
        await storage.createSupportTicket({
          ticketNumber,
          userId: (req as any).user?.id || null, // null for guest submissions
          name,
          email,
          phone: phone || null,
          category,
          subject,
          message,
          status: 'open',
          priority: category === 'safety' ? 'high' : 'normal' // Safety issues are high priority
        });
        console.log('✅ Support ticket saved to database');
      } catch (dbError) {
        console.error('❌ Failed to save support ticket to database:', dbError);
        // Continue anyway - we can still send emails
      }

      // Send confirmation email to user
      await sendContactConfirmationEmail(email, name, ticketNumber, subject);

      // Send notification email to support team
      await sendSupportNotificationEmail(ticketNumber, name, email, category, subject, message, phone);

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

  // Get support ticket by ticket number
  app.get('/api/support/tickets/:ticketNumber', async (req, res) => {
    try {
      const { ticketNumber } = req.params;
      
      const ticket = await storage.getSupportTicket(ticketNumber);
      
      if (!ticket) {
        return res.status(404).json({ 
          message: 'Support ticket not found' 
        });
      }

      res.json({ ticket });

    } catch (error: any) {
      console.error('❌ Support ticket lookup error:', error);
      res.status(500).json({ message: 'Failed to retrieve support ticket' });
    }
  });

  // Get user's support tickets (authenticated users)
  app.get('/api/support/my-tickets', async (req, res) => {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        return res.status(401).json({ 
          message: 'Authentication required' 
        });
      }

      const tickets = await storage.getUserSupportTickets(userId);
      res.json({ tickets });

    } catch (error: any) {
      console.error('❌ User tickets lookup error:', error);
      res.status(500).json({ message: 'Failed to retrieve your support tickets' });
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

  // Feedback form submission endpoint
  app.post('/api/support/feedback', async (req, res) => {
    try {
      // Validate the request body
      const validationResult = feedbackFormSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid feedback data',
          errors: validationResult.error.errors
        });
      }

      const { name, email, feedbackType, subject, message, rating } = validationResult.data;

      // Generate a feedback ID
      const feedbackId = `FB-${Date.now()}-${nanoid(6).toUpperCase()}`;

      // Log the feedback submission (redacted for privacy)
      console.log('💬 Feedback submission received:', {
        feedbackId,
        feedbackType,
        hasRating: !!rating,
        timestamp: new Date().toISOString()
      });

      // TODO: In a full implementation, you might:
      // 1. Save to a feedback table in the database
      // 2. Send email notification to feedback team
      // 3. Send confirmation email to user
      // 4. Integrate with feedback analysis system

      res.status(201).json({ 
        message: 'Thank you for your feedback! We appreciate you taking the time to help us improve.',
        feedbackId: feedbackId
      });

    } catch (error: any) {
      console.error('❌ Feedback submission error:', error);
      res.status(500).json({ 
        message: 'Failed to submit feedback. Please try again or contact us directly.' 
      });
    }
  });
}