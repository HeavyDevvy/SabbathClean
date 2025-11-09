import type { Express } from "express";
import { storage } from "./storage";
import { authenticateToken } from "./auth-routes";
import { z } from "zod";

// Validation schemas
const currentYear = new Date().getFullYear();

const addPaymentMethodSchema = z.object({
  type: z.enum(['card', 'bank_transfer']),
  cardHolderName: z.string().optional(),
  cardLast4: z.string().length(4).optional(),
  cardBrand: z.string().optional(),
  expiryMonth: z.coerce.number().int().min(1).max(12).optional(),
  expiryYear: z.coerce.number().int().min(currentYear).optional(),
  bankName: z.string().optional(),
  accountHolderName: z.string().optional(),
  nickname: z.string().optional(),
  isDefault: z.boolean().default(false)
}).refine(
  (data) => {
    if (data.type === 'card') {
      return data.cardHolderName && data.cardLast4 && data.expiryMonth && data.expiryYear;
    }
    return true;
  },
  {
    message: 'Card holder name, card last 4 digits, expiry month, and expiry year are required for card payments'
  }
);

export function registerPaymentRoutes(app: Express) {
  // Get user's payment methods
  app.get('/api/payment-methods', authenticateToken, async (req: any, res) => {
    try {
      const paymentMethods = await storage.getUserPaymentMethods(req.user.id);
      res.json(paymentMethods);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      res.status(500).json({ message: 'Failed to fetch payment methods' });
    }
  });

  // Add a new payment method
  app.post('/api/payment-methods', authenticateToken, async (req: any, res) => {
    try {
      const validatedData = addPaymentMethodSchema.parse(req.body);
      
      // If this is set as default, unset other default payment methods
      if (validatedData.isDefault) {
        await storage.unsetDefaultPaymentMethods(req.user.id);
      }

      const paymentMethod = await storage.addPaymentMethod({
        userId: req.user.id,
        ...validatedData
      });

      res.status(201).json({
        message: 'Payment method added successfully',
        paymentMethod
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
      }
      console.error('Error adding payment method:', error);
      res.status(500).json({ message: 'Failed to add payment method' });
    }
  });

  // Update a payment method
  app.put('/api/payment-methods/:id', authenticateToken, async (req: any, res) => {
    try {
      const paymentMethodId = req.params.id;
      const updateData = req.body;

      // Check if the payment method belongs to the user
      const paymentMethod = await storage.getPaymentMethod(paymentMethodId);
      if (!paymentMethod || paymentMethod.userId !== req.user.id) {
        return res.status(404).json({ message: 'Payment method not found' });
      }

      // If setting as default, unset other default payment methods
      if (updateData.isDefault) {
        await storage.unsetDefaultPaymentMethods(req.user.id);
      }

      const updatedPaymentMethod = await storage.updatePaymentMethod(paymentMethodId, updateData);
      
      res.json({
        message: 'Payment method updated successfully',
        paymentMethod: updatedPaymentMethod
      });
    } catch (error) {
      console.error('Error updating payment method:', error);
      res.status(500).json({ message: 'Failed to update payment method' });
    }
  });

  // Remove a payment method
  app.delete('/api/payment-methods/:id', authenticateToken, async (req: any, res) => {
    try {
      const paymentMethodId = req.params.id;

      // Check if the payment method belongs to the user
      const paymentMethod = await storage.getPaymentMethod(paymentMethodId);
      if (!paymentMethod || paymentMethod.userId !== req.user.id) {
        return res.status(404).json({ message: 'Payment method not found' });
      }

      await storage.removePaymentMethod(paymentMethodId);
      
      res.json({ message: 'Payment method removed successfully' });
    } catch (error) {
      console.error('Error removing payment method:', error);
      res.status(500).json({ message: 'Failed to remove payment method' });
    }
  });

  // Set payment method as default
  app.patch('/api/payment-methods/:id/set-default', authenticateToken, async (req: any, res) => {
    try {
      const paymentMethodId = req.params.id;

      // Check if the payment method belongs to the user
      const paymentMethod = await storage.getPaymentMethod(paymentMethodId);
      if (!paymentMethod || paymentMethod.userId !== req.user.id) {
        return res.status(404).json({ message: 'Payment method not found' });
      }

      // Unset other default payment methods
      await storage.unsetDefaultPaymentMethods(req.user.id);
      
      // Set this one as default
      await storage.updatePaymentMethod(paymentMethodId, { isDefault: true });
      
      res.json({ message: 'Payment method set as default' });
    } catch (error) {
      console.error('Error setting default payment method:', error);
      res.status(500).json({ message: 'Failed to set default payment method' });
    }
  });
}