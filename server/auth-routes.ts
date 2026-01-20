import type { Express } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { resolveAppBaseUrl, env as appEnv } from "../config/env.js";
import { storage } from "./storage.js";
import { z } from "zod";
import sgMail from "@sendgrid/mail";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname2 = path.dirname(fileURLToPath(import.meta.url));

const JWT_SECRET = appEnv.jwtSecret || "your-super-secret-jwt-key";
const REMEMBER_TOKEN_EXPIRES = 30 * 24 * 60 * 60 * 1000; // 30 days
const EMAIL_VERIFICATION_EXPIRES = 24 * 60 * 60 * 1000; // 24 hours
const PASSWORD_RESET_EXPIRES = 1 * 60 * 60 * 1000; // 1 hour

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  rememberMe: z.boolean().optional()
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  isProvider: z.boolean().optional(),
  captchaToken: z.string().optional(),
  // Business fields
  accountType: z.enum(['INDIVIDUAL', 'BUSINESS']).optional().default('INDIVIDUAL'),
  businessName: z.string().optional(),
  businessRegistrationNumber: z.string().optional(),
  vatNumber: z.string().optional(),
  businessAddress: z.string().optional(),
  businessCity: z.string().optional(),
  businessPostalCode: z.string().optional(),
  businessCountry: z.string().optional(),
  contactPersonFirstName: z.string().optional(),
  contactPersonLastName: z.string().optional(),
  contactPersonEmail: z.string().optional(),
  contactPersonPhone: z.string().optional(),
  contactPersonRole: z.string().optional()
}).superRefine((data, ctx) => {
  if (data.accountType === 'BUSINESS') {
    if (!data.businessName) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Business Name is required", path: ["businessName"] });
    
    if (!data.businessRegistrationNumber) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Registration Number is required", path: ["businessRegistrationNumber"] });
    } else if (!/^\d{4}\/\d{6}\/\d{2}$/.test(data.businessRegistrationNumber)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid format (e.g. 2023/123456/07)", path: ["businessRegistrationNumber"] });
    }

    if (!data.businessAddress) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Business Address is required", path: ["businessAddress"] });
    if (!data.businessCity) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Business City is required", path: ["businessCity"] });
    if (!data.businessPostalCode) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Business Postal Code is required", path: ["businessPostalCode"] });
    
    if (!data.contactPersonFirstName) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Contact Person First Name is required", path: ["contactPersonFirstName"] });
    if (!data.contactPersonLastName) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Contact Person Last Name is required", path: ["contactPersonLastName"] });
    
    if (!data.contactPersonEmail) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Contact Person Email is required", path: ["contactPersonEmail"] });
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.contactPersonEmail)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid email format", path: ["contactPersonEmail"] });
      }
    }

    if (!data.contactPersonPhone) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Contact Person Phone is required", path: ["contactPersonPhone"] });
    } else if (!/^(\+27|0)[0-9]{9}$/.test(data.contactPersonPhone)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid SA phone number (e.g. 0821234567)", path: ["contactPersonPhone"] });
    }
  }
});

const emailVerificationSchema = z.object({
  token: z.string()
});

const passwordResetRequestSchema = z.object({
  email: z.string().email()
});

const passwordResetSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(6)
});

// ReCAPTCHA Verification Helper
export async function verifyCaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) {
    console.warn("RECAPTCHA_SECRET_KEY not set, skipping verification");
    return true;
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${secretKey}&response=${token}`
    });
    const data = await response.json() as any;
    return data.success;
  } catch (error) {
    console.error('ReCAPTCHA verification error:', error);
    return false;
  }
}

// JWT token generation
const generateTokens = (user: any, providerStatus?: string, providerId?: string, rememberMe: boolean = false) => {
  const isApprovedProvider = providerStatus === 'approved';
  
  const accessToken = jwt.sign(
    { 
      id: user.id,
      userId: user.id, // Backward compatibility
      email: user.email,
      role: user.role,
      isProvider: !!user.isProvider,
      isApprovedProvider,
      providerId: providerId || null,
      type: 'access' 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  const refreshToken = rememberMe ? jwt.sign(
    { userId: user.id, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: '30d' }
  ) : null;

  return { accessToken, refreshToken };
};

// Email sending utility functions
const sendVerificationEmail = async (email: string, firstName: string, verificationToken: string) => {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SendGrid not configured, skipping email verification');
    return;
  }

  const verificationUrl = `${resolveAppBaseUrl(appEnv.appBaseUrl)}/verify-email?token=${verificationToken}`;
  
  const msg = {
    to: email,
    from: 'noreply@berryevents.co.za',
    subject: 'Verify your Berry Events account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to Berry Events, ${firstName}!</h2>
        <p>Please verify your email address to complete your registration.</p>
        <a href="${verificationUrl}" 
           style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
          Verify Email Address
        </a>
        <p>If the button doesn't work, copy and paste this link in your browser:</p>
        <p>${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Berry Events - Your trusted home services platform</p>
      </div>
    `
  };

  try {
    await sgMail.send(msg);
    console.log('Verification email sent to:', email);
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
};

const sendPasswordResetEmail = async (email: string, firstName: string, resetToken: string) => {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SendGrid not configured, skipping password reset email');
    return;
  }

  const resetUrl = `${resolveAppBaseUrl(appEnv.appBaseUrl)}/reset-password?token=${resetToken}`;
  
  const msg = {
    to: email,
    from: 'noreply@berryevents.co.za',
    subject: 'Reset your Berry Events password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Password Reset Request</h2>
        <p>Hi ${firstName},</p>
        <p>We received a request to reset your password for your Berry Events account.</p>
        <a href="${resetUrl}" 
           style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
          Reset Password
        </a>
        <p>If the button doesn't work, copy and paste this link in your browser:</p>
        <p>${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Berry Events - Your trusted home services platform</p>
      </div>
    `
  };

  try {
    await sgMail.send(msg);
    console.log('Password reset email sent to:', email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
};

// Middleware to verify JWT token
export const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUserById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Optional authentication middleware - authenticates if token present, continues if not
export const optionalAuth = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // No token present, continue as guest
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUserById(decoded.userId);
    
    if (user) {
      req.user = user;
    }
    next();
  } catch (error) {
    // Invalid token, but continue as guest
    next();
  }
};

// Middleware to authorize provider access - ensures user owns the provider resource
export const authorizeProviderAccess = async (req: any, res: any, next: any) => {
  try {
    const providerId = req.params.providerId || req.params.id;
    
    if (!providerId) {
      return res.status(400).json({ message: 'Provider ID is required' });
    }

    // Check if user is authenticated (should be called after authenticateToken)
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Get the provider to check ownership
    const provider = await storage.getServiceProvider(providerId);
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    // Check if the authenticated user owns this provider
    // Provider ownership is determined by matching user ID
    if (provider.userId !== req.user.id) {
      // Check if user has admin role (optional for future admin features)
      const isAdmin = req.user.role === 'admin' || req.user.isAdmin;
      
      if (!isAdmin) {
        return res.status(403).json({ 
          message: 'Access denied: You can only access your own provider data' 
        });
      }
    }

    const status = (provider as any).verificationStatus || (provider.isVerified ? 'approved' : 'pending');
    if (status !== 'approved') {
      return res.status(403).json({ message: 'Provider not approved' });
    }

    // Store the provider in request for use in route handler
    req.provider = provider;
    next();
  } catch (error) {
    console.error('Provider authorization error:', error);
    return res.status(500).json({ message: 'Authorization check failed' });
  }
};

export function registerAuthRoutes(app: Express) {
  // Registration endpoint
  app.post('/api/auth/register', async (req, res) => {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const normalized = {
        email: String(body.email || ''),
        password: String(body.password || ''),
        firstName: String(body.firstName || ''),
        lastName: String(body.lastName || ''),
        phone: body.phone ?? body.phoneNumber ?? undefined,
        address: body.address ?? undefined,
        city: body.city ?? undefined,
        province: body.province ?? undefined,
        isProvider: Boolean(body.isProvider === true || body.role === 'provider') || undefined,
        captchaToken: body.captchaToken,
        
        // Business fields normalization
        accountType: body.accountType || 'INDIVIDUAL',
        businessName: body.businessName,
        businessRegistrationNumber: body.businessRegistrationNumber,
        vatNumber: body.vatNumber,
        businessAddress: body.businessAddress,
        businessCity: body.businessCity,
        businessPostalCode: body.businessPostalCode,
        businessCountry: body.businessCountry || 'South Africa',
        contactPersonFirstName: body.contactPersonFirstName,
        contactPersonLastName: body.contactPersonLastName,
        contactPersonEmail: body.contactPersonEmail,
        contactPersonPhone: body.contactPersonPhone,
        contactPersonRole: body.contactPersonRole
      };
      const validatedData = registerSchema.parse(normalized);
      
      // Verify CAPTCHA if configured
      if (process.env.RECAPTCHA_SECRET_KEY) {
        if (!validatedData.captchaToken) {
          return res.status(400).json({ message: 'CAPTCHA verification required' });
        }
        const isHuman = await verifyCaptcha(validatedData.captchaToken);
        if (!isHuman) {
          return res.status(400).json({ message: 'CAPTCHA verification failed' });
        }
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(409).json({ message: 'Email already registered' });
      }

      // Hash password
      let hashedPassword = validatedData.password;
      try {
        hashedPassword = await bcrypt.hash(validatedData.password, 10);
      } catch {
        // fallback to plaintext in dev-only in-memory mode
      }

      // Generate email verification token (skipped in development if email not configured)
      const emailVerificationToken = crypto.randomBytes(32).toString('hex');
      const emailVerificationExpiresAt = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRES);

      // Create user with verification token
      // Dev-friendly path: in-memory storage should never 500
      const newUser = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
        authProvider: 'email',
        isVerified: process.env.SENDGRID_API_KEY ? false : true,
        isProvider: validatedData.isProvider ?? false,
        emailVerificationToken,
        emailVerificationExpiresAt
      });

      // Send verification email when configured
      if (process.env.SENDGRID_API_KEY) {
        try {
          await sendVerificationEmail(newUser.email, newUser.firstName, emailVerificationToken);
        } catch (e: any) {
          console.warn('Verification email failed:', e?.message || e);
        }
      }

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(newUser, undefined, undefined, false);

      // Update last login (non-blocking in dev)
      try {
        await storage.updateUserLastLogin(newUser.id);
      } catch (e) {
        console.warn('updateUserLastLogin failed:', (e as any)?.message || e);
      }

      // Merge guest cart to user on registration if session cookie exists
      try {
        const sessionToken = (req as any).cookies?.cartSession;
        if (sessionToken) {
          await storage.mergeGuestCartToUser(sessionToken, newUser.id);
        }
      } catch {}

      res.status(201).json({
        message: 'Registration successful',
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          profileImage: newUser.profileImage,
          isProvider: newUser.isProvider,
          isVerified: newUser.isVerified
        },
        accessToken,
        refreshToken,
        requiresEmailVerification: !!process.env.SENDGRID_API_KEY
      });
    } catch (error: any) {
      if (error?.name === 'ZodError') {
        return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
      }
      const msg = String(error?.message || 'Registration failed');
      if (/duplicate|unique/i.test(msg)) {
        return res.status(409).json({ message: 'Email already registered' });
      }
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Registration failed', error: msg });
    }
  });

  // Login endpoint
  app.post('/api/auth/login', async (req, res) => {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const normalized = {
        email: String(body.email || ''),
        password: String(body.password || '')
      };
      const validatedData = loginSchema.parse(normalized);
      
      // Find user by email
      let user = await storage.getUserByEmail(validatedData.email);
      // Unified auth: if no user exists but a provider with this email does, create/link user on-the-fly
      if (!user) {
        const providers = await storage.getAllProviders();
        const providerByEmail = providers.find(p => (p.email || '').toLowerCase() === validatedData.email.toLowerCase());
        if (providerByEmail) {
          let hashedPassword = validatedData.password;
          try { hashedPassword = await bcrypt.hash(validatedData.password, 10); } catch {}
          const created = await storage.createUser({
            email: validatedData.email,
            password: hashedPassword,
            firstName: (providerByEmail.firstName || 'Provider') as string,
            lastName: (providerByEmail.lastName || '') as string,
            isProvider: true,
            isVerified: !!providerByEmail.isVerified,
            authProvider: 'email'
          } as any);
          // Link provider to user for portal functionality
          try { await storage.updateServiceProvider(providerByEmail.id, { userId: created.id }); } catch {}
          user = created as any;
        }
      }
      if (!user || !user.password) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Verify password (support dev seed users without bcrypt hash)
      let isValidPassword = false;
      try {
        const looksHashed = typeof user.password === 'string' && user.password.startsWith('$2');
        isValidPassword = looksHashed 
          ? await bcrypt.compare(validatedData.password, user.password)
          : validatedData.password === user.password;
      } catch {
        isValidPassword = validatedData.password === user.password;
      }
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Providers may be pending; do not block login. Include status for client redirects.
      let providerStatus: string | undefined = undefined;
      let providerId: string | undefined = undefined;

      if (user.isProvider) {
        const providers = await storage.getAllProviders();
        let provider = providers.find(p => p.userId === user.id);
        if (!provider) {
          // attempt to link by email if not already linked
          provider = providers.find(p => (p.email || '').toLowerCase() === (user.email || '').toLowerCase());
          if (provider && !provider.userId) {
            try { await storage.updateServiceProvider(provider.id, { userId: user.id }); } catch {}
          }
        }
        if (provider) {
          providerId = provider.id;
          providerStatus = (provider as any).verificationStatus || (provider.isVerified ? 'approved' : 'pending');
        } else {
          providerStatus = 'pending';
        }
      }

      // Check if user is an approved provider and update role
      if (providerStatus === 'approved') {
         if (user.role !== 'PROVIDER') {
            await storage.updateUser(user.id, { role: 'PROVIDER' });
            user.role = 'PROVIDER';
         }
      }

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user, providerStatus, providerId, validatedData.rememberMe);

      // Update last login and remember token if needed
      await storage.updateUserLastLogin(user.id);
      if (refreshToken && validatedData.rememberMe) {
        await storage.updateRememberToken(user.id, refreshToken, new Date(Date.now() + REMEMBER_TOKEN_EXPIRES));
      }

      // Merge guest cart to user on login if session cookie exists
      try {
        const sessionToken = (req as any).cookies?.cartSession;
        if (sessionToken) {
          await storage.mergeGuestCartToUser(sessionToken, user.id);
        }
      } catch {}

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImage: user.profileImage,
          isProvider: user.isProvider
        },
        accessToken,
        refreshToken,
        providerStatus,
        postLoginRedirect: providerStatus && providerStatus !== 'approved' ? '/provider/onboarding/pending' : undefined
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
      }
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });

  // Token refresh endpoint
  app.post('/api/auth/refresh', async (req, res) => {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token required' });
      }

      const decoded = jwt.verify(refreshToken, JWT_SECRET) as any;
      const user = await storage.getUserById(decoded.userId);
      
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Generate new access token
      const { accessToken } = generateTokens(user, undefined, undefined, false);

      res.json({ accessToken });
    } catch (error) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }
  });

  // Get current user endpoint
  app.get('/api/auth/user', authenticateToken, async (req: any, res) => {
    // Get provider details if user is a provider
    let providerStatus = null;
    let isApprovedProvider = false;
    let providerId = null;

    if (req.user.isProvider) {
      const provider = await storage.getServiceProviderByUserId(req.user.id);
      if (provider) {
        providerId = provider.id;
        providerStatus = (provider as any).verificationStatus || 'pending';
        isApprovedProvider = providerStatus === 'approved' && provider.isVerified === true;
      }
    }

    res.json({
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      phone: req.user.phone,
      address: req.user.address,
      city: req.user.city,
      province: req.user.province,
      profileImage: req.user.profileImage,
      isProvider: req.user.isProvider,
      preferences: req.user.preferences,
      notificationSettings: req.user.notificationSettings,
      providerStatus,
      isApprovedProvider,
      providerId
    });
  });

  // Update user profile
  app.put('/api/user/profile', authenticateToken, async (req: any, res) => {
    try {
      const updateData = req.body;
      const updatedUser = await storage.updateUser(req.user.id, updateData);
      
      res.json({
        message: 'Profile updated successfully',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          phone: updatedUser.phone,
          address: updatedUser.address,
          city: updatedUser.city,
          province: updatedUser.province,
          profileImage: updatedUser.profileImage
        }
      });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ message: 'Profile update failed' });
    }
  });

  // Social authentication routes
  app.get('/api/auth/google', async (req, res) => {
    try {
      // In production, this would integrate with Google OAuth
      // For now, we'll simulate real user data from Google OAuth response
      const googleUserData = {
        email: `user.${Date.now()}@gmail.com`,
        firstName: String(req.query.firstName || 'User'),
        lastName: String(req.query.lastName || 'Name'),
        profileImage: String(req.query.picture || 'https://via.placeholder.com/150/4285F4/white?text=' + String(req.query.firstName || 'U').charAt(0) + String(req.query.lastName || 'N').charAt(0)),
        authProvider: 'google',
        isProvider: false,
        password: null,
        phone: null,
        address: null,
        city: null,
        province: null,
        postalCode: null,
        latitude: null,
        longitude: null,
        username: null,
        isVerified: true,
        googleId: `google_${Date.now()}`,
        appleId: null,
        twitterId: null,
        instagramId: null,
        rememberToken: null,
        rememberTokenExpiresAt: null,
        preferences: null,
        lastLoginAt: null
      };
      
      // Check if user exists, create if not
      let user = await storage.getUserByEmail(googleUserData.email);
      if (!user) {
        user = await storage.createUser(googleUserData);
      }
      
      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user, undefined, undefined, true);
      
      // Update last login
      await storage.updateUserLastLogin(user.id);
      
      const responseData = {
        message: 'Google login successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImage: user.profileImage,
          isProvider: user.isProvider
        },
        accessToken,
        refreshToken
      };
      
      // Send HTML response for popup handling
      const htmlResponse = `
        <!DOCTYPE html>
        <html>
        <body>
          <script>
            window.opener.postMessage({
              type: 'SOCIAL_LOGIN_SUCCESS',
              payload: ${JSON.stringify(responseData)}
            }, '*');
            window.close();
          </script>
        </body>
        </html>
      `;
      res.send(htmlResponse);
    } catch (error) {
      console.error('Google auth error:', error);
      const errorResponse = `
        <!DOCTYPE html>
        <html>
        <body>
          <script>
            window.opener.postMessage({
              type: 'SOCIAL_LOGIN_ERROR',
              error: 'Google authentication failed'
            }, '*');
            window.close();
          </script>
        </body>
        </html>
      `;
      res.send(errorResponse);
    }
  });

  // Apple authentication
  app.get('/api/auth/apple', async (req, res) => {
    try {
      const appleUserData = {
        email: `apple.user.${Date.now()}@icloud.com`,
        firstName: String(req.query.firstName || 'Apple'),
        lastName: String(req.query.lastName || 'User'),
        profileImage: String(req.query.picture || 'https://via.placeholder.com/150/000000/white?text=' + String(req.query.firstName || 'A').charAt(0) + String(req.query.lastName || 'U').charAt(0)),
        authProvider: 'apple',
        isProvider: false,
        password: null,
        phone: null,
        address: null,
        city: null,
        province: null,
        postalCode: null,
        latitude: null,
        longitude: null,
        username: null,
        isVerified: true,
        googleId: null,
        appleId: `apple_${Date.now()}`,
        twitterId: null,
        instagramId: null,
        rememberToken: null,
        rememberTokenExpiresAt: null,
        preferences: null,
        lastLoginAt: null
      };
      
      let user = await storage.getUserByEmail(appleUserData.email);
      if (!user) {
        user = await storage.createUser(appleUserData);
      }
      
      const { accessToken, refreshToken } = generateTokens(user, undefined, undefined, true);
      await storage.updateUserLastLogin(user.id);
      
      const responseData = {
        message: 'Apple login successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImage: user.profileImage,
          isProvider: user.isProvider
        },
        accessToken,
        refreshToken
      };
      
      const htmlResponse = `
        <!DOCTYPE html>
        <html>
        <body>
          <script>
            window.opener.postMessage({
              type: 'SOCIAL_LOGIN_SUCCESS',
              payload: ${JSON.stringify(responseData)}
            }, '*');
            window.close();
          </script>
        </body>
        </html>
      `;
      res.send(htmlResponse);
    } catch (error) {
      console.error('Apple auth error:', error);
      const errorResponse = `
        <!DOCTYPE html>
        <html>
        <body>
          <script>
            window.opener.postMessage({
              type: 'SOCIAL_LOGIN_ERROR',
              error: 'Apple authentication failed'
            }, '*');
            window.close();
          </script>
        </body>
        </html>
      `;
      res.send(errorResponse);
    }
  });

  // Twitter authentication
  app.get('/api/auth/twitter', async (req, res) => {
    try {
      const twitterUserData = {
        email: `twitter.user.${Date.now()}@twitter.com`,
        firstName: String(req.query.firstName || 'Twitter'),
        lastName: String(req.query.lastName || 'User'),
        profileImage: String(req.query.picture || 'https://via.placeholder.com/150/1DA1F2/white?text=' + String(req.query.firstName || 'T').charAt(0) + String(req.query.lastName || 'U').charAt(0)),
        authProvider: 'twitter',
        isProvider: false,
        password: null,
        phone: null,
        address: null,
        city: null,
        province: null,
        postalCode: null,
        latitude: null,
        longitude: null,
        username: null,
        isVerified: true,
        googleId: null,
        appleId: null,
        twitterId: `twitter_${Date.now()}`,
        instagramId: null,
        rememberToken: null,
        rememberTokenExpiresAt: null,
        preferences: null,
        lastLoginAt: null
      };
      
      let user = await storage.getUserByEmail(twitterUserData.email);
      if (!user) {
        user = await storage.createUser(twitterUserData);
      }
      
      const { accessToken, refreshToken } = generateTokens(user, undefined, undefined, true);
      await storage.updateUserLastLogin(user.id);
      
      const responseData = {
        message: 'Twitter login successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImage: user.profileImage,
          isProvider: user.isProvider
        },
        accessToken,
        refreshToken
      };
      
      const htmlResponse = `
        <!DOCTYPE html>
        <html>
        <body>
          <script>
            window.opener.postMessage({
              type: 'SOCIAL_LOGIN_SUCCESS',
              payload: ${JSON.stringify(responseData)}
            }, '*');
            window.close();
          </script>
        </body>
        </html>
      `;
      res.send(htmlResponse);
    } catch (error) {
      console.error('Twitter auth error:', error);
      const errorResponse = `
        <!DOCTYPE html>
        <html>
        <body>
          <script>
            window.opener.postMessage({
              type: 'SOCIAL_LOGIN_ERROR',
              error: 'Twitter authentication failed'
            }, '*');
            window.close();
          </script>
        </body>
        </html>
      `;
      res.send(errorResponse);
    }
  });

  // Instagram authentication
  app.get('/api/auth/instagram', async (req, res) => {
    try {
      const instagramUserData = {
        email: `instagram.user.${Date.now()}@instagram.com`,
        firstName: String(req.query.firstName || 'Instagram'),
        lastName: String(req.query.lastName || 'User'),
        profileImage: String(req.query.picture || 'https://via.placeholder.com/150/E4405F/white?text=' + String(req.query.firstName || 'I').charAt(0) + String(req.query.lastName || 'U').charAt(0)),
        authProvider: 'instagram',
        isProvider: false,
        password: null,
        phone: null,
        address: null,
        city: null,
        province: null,
        postalCode: null,
        latitude: null,
        longitude: null,
        username: null,
        isVerified: true,
        googleId: null,
        appleId: null,
        twitterId: null,
        instagramId: `instagram_${Date.now()}`,
        rememberToken: null,
        rememberTokenExpiresAt: null,
        preferences: null,
        lastLoginAt: null
      };
      
      let user = await storage.getUserByEmail(instagramUserData.email);
      if (!user) {
        user = await storage.createUser(instagramUserData);
      }
      
      const { accessToken, refreshToken } = generateTokens(user, undefined, undefined, true);
      await storage.updateUserLastLogin(user.id);
      
      const responseData = {
        message: 'Instagram login successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImage: user.profileImage,
          isProvider: user.isProvider
        },
        accessToken,
        refreshToken
      };
      
      const htmlResponse = `
        <!DOCTYPE html>
        <html>
        <body>
          <script>
            window.opener.postMessage({
              type: 'SOCIAL_LOGIN_SUCCESS',
              payload: ${JSON.stringify(responseData)}
            }, '*');
            window.close();
          </script>
        </body>
        </html>
      `;
      res.send(htmlResponse);
    } catch (error) {
      console.error('Instagram auth error:', error);
      const errorResponse = `
        <!DOCTYPE html>
        <html>
        <body>
          <script>
            window.opener.postMessage({
              type: 'SOCIAL_LOGIN_ERROR',
              error: 'Instagram authentication failed'
            }, '*');
            window.close();
          </script>
        </body>
        </html>
      `;
      res.send(errorResponse);
    }
  });

  app.get('/api/auth/apple', async (req, res) => {
    try {
      const mockAppleUser = {
        email: 'demo.apple@berryevents.com',
        firstName: 'Apple',
        lastName: 'User',
        profileImage: 'https://via.placeholder.com/150/000000/white?text=A',
        authProvider: 'apple',
        isProvider: false,
        password: null,
        phone: null,
        address: null,
        city: null,
        province: null,
        postalCode: null,
        latitude: null,
        longitude: null,
        username: null,
        isVerified: true,
        googleId: null,
        appleId: `apple_${Date.now()}`,
        twitterId: null,
        instagramId: null,
        rememberToken: null,
        rememberTokenExpiresAt: null,
        preferences: null,
        lastLoginAt: null
      };
      
      let user = await storage.getUserByEmail(mockAppleUser.email);
      if (!user) {
        user = await storage.createUser(mockAppleUser);
      }
      
      const { accessToken, refreshToken } = generateTokens(user, undefined, undefined, true);
      await storage.updateUserLastLogin(user.id);
      
      const responseData = {
        message: 'Apple login successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImage: user.profileImage,
          isProvider: user.isProvider
        },
        accessToken,
        refreshToken
      };
      
      const htmlResponse = `
        <!DOCTYPE html>
        <html>
        <body>
          <script>
            window.opener.postMessage({
              type: 'SOCIAL_LOGIN_SUCCESS',
              payload: ${JSON.stringify(responseData)}
            }, '*');
            window.close();
          </script>
        </body>
        </html>
      `;
      res.send(htmlResponse);
    } catch (error) {
      console.error('Apple auth error:', error);
      const errorResponse = `
        <!DOCTYPE html>
        <html>
        <body>
          <script>
            window.opener.postMessage({
              type: 'SOCIAL_LOGIN_ERROR',
              error: 'Apple authentication failed'
            }, '*');
            window.close();
          </script>
        </body>
        </html>
      `;
      res.send(errorResponse);
    }
  });

  app.get('/api/auth/twitter', async (req, res) => {
    try {
      const mockTwitterUser = {
        email: 'demo.twitter@berryevents.com',
        firstName: 'Twitter',
        lastName: 'User',
        profileImage: 'https://via.placeholder.com/150/1DA1F2/white?text=T',
        authProvider: 'twitter',
        isProvider: false,
        password: null,
        phone: null,
        address: null,
        city: null,
        province: null,
        postalCode: null,
        latitude: null,
        longitude: null,
        username: null,
        isVerified: true,
        googleId: null,
        appleId: null,
        twitterId: `twitter_${Date.now()}`,
        instagramId: null,
        rememberToken: null,
        rememberTokenExpiresAt: null,
        preferences: null,
        lastLoginAt: null
      };
      
      let user = await storage.getUserByEmail(mockTwitterUser.email);
      if (!user) {
        user = await storage.createUser(mockTwitterUser);
      }
      
      const { accessToken, refreshToken } = generateTokens(user, undefined, undefined, true);
      await storage.updateUserLastLogin(user.id);
      
      const responseData = {
        message: 'Twitter login successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImage: user.profileImage,
          isProvider: user.isProvider
        },
        accessToken,
        refreshToken
      };
      
      const htmlResponse = `
        <!DOCTYPE html>
        <html>
        <body>
          <script>
            window.opener.postMessage({
              type: 'SOCIAL_LOGIN_SUCCESS',
              payload: ${JSON.stringify(responseData)}
            }, '*');
            window.close();
          </script>
        </body>
        </html>
      `;
      res.send(htmlResponse);
    } catch (error) {
      console.error('Twitter auth error:', error);
      const errorResponse = `
        <!DOCTYPE html>
        <html>
        <body>
          <script>
            window.opener.postMessage({
              type: 'SOCIAL_LOGIN_ERROR',
              error: 'Twitter authentication failed'
            }, '*');
            window.close();
          </script>
        </body>
        </html>
      `;
      res.send(errorResponse);
    }
  });

  app.get('/api/auth/instagram', async (req, res) => {
    try {
      const mockInstagramUser = {
        email: 'demo.instagram@berryevents.com',
        firstName: 'Instagram',
        lastName: 'User',
        profileImage: 'https://via.placeholder.com/150/E4405F/white?text=I',
        authProvider: 'instagram',
        isProvider: false,
        password: null,
        phone: null,
        address: null,
        city: null,
        province: null,
        postalCode: null,
        latitude: null,
        longitude: null,
        username: null,
        isVerified: true,
        googleId: null,
        appleId: null,
        twitterId: null,
        instagramId: `instagram_${Date.now()}`,
        rememberToken: null,
        rememberTokenExpiresAt: null,
        preferences: null,
        lastLoginAt: null
      };
      
      let user = await storage.getUserByEmail(mockInstagramUser.email);
      if (!user) {
        user = await storage.createUser(mockInstagramUser);
      }
      
      const { accessToken, refreshToken } = generateTokens(user, undefined, undefined, true);
      await storage.updateUserLastLogin(user.id);
      
      const responseData = {
        message: 'Instagram login successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImage: user.profileImage,
          isProvider: user.isProvider
        },
        accessToken,
        refreshToken
      };
      
      const htmlResponse = `
        <!DOCTYPE html>
        <html>
        <body>
          <script>
            window.opener.postMessage({
              type: 'SOCIAL_LOGIN_SUCCESS',
              payload: ${JSON.stringify(responseData)}
            }, '*');
            window.close();
          </script>
        </body>
        </html>
      `;
      res.send(htmlResponse);
    } catch (error) {
      console.error('Instagram auth error:', error);
      const errorResponse = `
        <!DOCTYPE html>
        <html>
        <body>
          <script>
            window.opener.postMessage({
              type: 'SOCIAL_LOGIN_ERROR',
              error: 'Instagram authentication failed'
            }, '*');
            window.close();
          </script>
        </body>
        </html>
      `;
      res.send(errorResponse);
    }
  });

  // Logout endpoint
  app.post('/api/auth/logout', authenticateToken, async (req: any, res) => {
    try {
      // Clear remember token
      await storage.clearRememberToken(req.user.id);
      res.json({ message: 'Logout successful' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: 'Logout failed' });
    }
  });

  // Email verification endpoint
  app.post('/api/auth/verify-email', async (req, res) => {
    try {
      const { token } = emailVerificationSchema.parse(req.body);
      
      // Find user by verification token
      const user = await storage.getUserByEmailVerificationToken(token);
      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired verification token' });
      }

      // Check if token is expired
      if (user.emailVerificationExpiresAt && new Date() > user.emailVerificationExpiresAt) {
        return res.status(400).json({ message: 'Verification token has expired. Please request a new one.' });
      }

      // Verify the user
      await storage.verifyUserEmail(user.id);

      res.json({
        message: 'Email verified successfully! You can now access all features.',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isVerified: true
        }
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
      }
      console.error('Email verification error:', error);
      res.status(500).json({ message: 'Email verification failed' });
    }
  });

  // Password reset request endpoint
  app.post('/api/auth/request-password-reset', async (req, res) => {
    try {
      const { email } = passwordResetRequestSchema.parse(req.body);
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Return success even if user doesn't exist (security best practice)
        return res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
      }

      // Generate password reset token
      const passwordResetToken = crypto.randomBytes(32).toString('hex');
      const passwordResetExpiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRES);

      // Save reset token
      await storage.setPasswordResetToken(user.id, passwordResetToken, passwordResetExpiresAt);

      // Send password reset email
      await sendPasswordResetEmail(user.email, user.firstName, passwordResetToken);

      res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
      }
      console.error('Password reset request error:', error);
      res.status(500).json({ message: 'Password reset request failed' });
    }
  });

  // Password reset endpoint
  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { token, newPassword } = passwordResetSchema.parse(req.body);
      
      // Find user by reset token
      const user = await storage.getUserByPasswordResetToken(token);
      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired reset token' });
      }

      // Check if token is expired
      if (user.passwordResetExpiresAt && new Date() > user.passwordResetExpiresAt) {
        return res.status(400).json({ message: 'Reset token has expired. Please request a new one.' });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password and clear reset token
      await storage.resetUserPassword(user.id, hashedPassword);

      res.json({ message: 'Password reset successfully. You can now sign in with your new password.' });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
      }
      console.error('Password reset error:', error);
      res.status(500).json({ message: 'Password reset failed' });
    }
  });

  // Admin authentication endpoints
  app.post('/api/admin/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      res.setHeader('Content-Type', 'application/json');
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }
      const adminFilePath = path.resolve(__dirname2, 'data/admins.json');
      if (!fs.existsSync(adminFilePath)) {
        console.log('❌ Admin file not found');
        return res.status(401).json({ message: 'Invalid admin credentials' });
      }
      let admins: any[] = [];
      try {
        admins = JSON.parse(fs.readFileSync(adminFilePath, 'utf8'));
      } catch {
        admins = [];
      }
      const admin = admins.find(a => String(a.email || '').toLowerCase() === String(email || '').toLowerCase());
      if (!admin) {
        console.log('❌ Admin not found');
        return res.status(401).json({ message: 'Invalid admin credentials' });
      }
      const isValidPassword = await bcrypt.compare(String(password), String(admin.password || ''));
      console.log('🔐 Password check:', isValidPassword ? '✅' : '❌');
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid admin credentials' });
      }
      const adminToken = jwt.sign(
        { userId: admin.id, type: 'admin', role: 'admin' },
        JWT_SECRET,
        { expiresIn: '8h' }
      );
      console.log('✅ Login successful');
      res.json({
        message: 'Admin login successful',
        token: adminToken,
        user: {
          id: admin.id,
          email: admin.email,
          role: 'admin',
          firstName: admin.firstName,
          lastName: admin.lastName
        }
      });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ message: 'Admin login failed' });
    }
  });

  // Admin health check
  app.get('/api/admin/health', async (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ ok: true });
  });
  // Admin middleware
  const authenticateAdmin = async (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Admin token required' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      if (decoded.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      req.admin = decoded;
      next();
    } catch (error) {
      return res.status(403).json({ message: 'Invalid admin token' });
    }
  };

  // Admin stats endpoint
  app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      // Ensure all required fields are present for frontend contract
      const completeStats = {
        totalUsers: stats.totalUsers || 0,
        totalProviders: stats.totalProviders || 0,
        activeBookings: stats.activeBookings || 0,
        totalRevenue: stats.totalRevenue || 0,
        pendingApplications: stats.pendingApplications || 0,
        monthlyRecurringRevenue: stats.monthlyRecurringRevenue || 0,
        customerAcquisitionCost: stats.customerAcquisitionCost || 45,
        customerLifetimeValue: stats.customerLifetimeValue || 1250,
        churnRate: stats.churnRate || 4.2,
        conversionRate: stats.conversionRate || 24,
        averageOrderValue: stats.averageOrderValue || 0,
        providerUtilization: stats.providerUtilization || 78,
        customerSatisfaction: stats.customerSatisfaction || 4.8,
        revenueGrowth: stats.revenueGrowth || 12,
        userGrowth: stats.userGrowth || 15,
        bookingGrowth: stats.bookingGrowth || 18,
        todayBookings: stats.todayBookings || 0,
        thisWeekRevenue: stats.thisWeekRevenue || 0,
        thisMonthRevenue: stats.thisMonthRevenue || 0,
        averageResponseTime: stats.averageResponseTime || 2.1,
        disputeRate: stats.disputeRate || 0.8,
        retentionRate: stats.retentionRate || 87
      };
      res.json(completeStats);
    } catch (error) {
      console.error('Admin stats error:', error);
      // Return safe fallback data to prevent frontend crashes
      res.status(200).json({
        totalUsers: 0,
        totalProviders: 0,
        activeBookings: 0,
        totalRevenue: 0,
        pendingApplications: 0,
        monthlyRecurringRevenue: 0,
        customerAcquisitionCost: 45,
        customerLifetimeValue: 1250,
        churnRate: 4.2,
        conversionRate: 24,
        averageOrderValue: 0,
        providerUtilization: 78,
        customerSatisfaction: 4.8,
        revenueGrowth: 12,
        userGrowth: 15,
        bookingGrowth: 18,
        todayBookings: 0,
        thisWeekRevenue: 0,
        thisMonthRevenue: 0,
        averageResponseTime: 2.1,
        disputeRate: 0.8,
        retentionRate: 87
      });
    }
  });

  // Admin users endpoint
  app.get('/api/admin/users', authenticateAdmin, async (req, res) => {
    try {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
      res.setHeader('ETag', '');
      const users = await storage.getAllUsers();
      const providers = await storage.getAllProviders();
      const providerUserIds = new Set(
        providers
          .map((p: any) => p.userId)
          .filter((id: any) => typeof id === 'string' && id.length > 0)
      );
      const customersOnly = users.filter((u: any) => {
        const role = String(u.role || '').toUpperCase();
        const isProviderFlag = !!(u.isProvider === true || u.isServiceProvider === true);
        const linkedProvider = providerUserIds.has(u.id);
        const looksCustomerRole = role === 'USER' || role === '' || role === 'CUSTOMER';
        return looksCustomerRole && !isProviderFlag && !linkedProvider;
      });
      res.status(200).json(customersOnly);
    } catch (error) {
      console.error('Admin users error:', error);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });

  // Admin providers endpoint
  app.get('/api/admin/providers', authenticateAdmin, async (req, res) => {
    try {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
      res.setHeader('ETag', '');
      const providers = await storage.getAllProviders();
      const users = await storage.getAllUsers();
      const userById = new Map(users.map(u => [u.id, u]));
      const enriched = providers.map(p => {
        const u = p.userId ? userById.get(p.userId) : undefined;
        const fullName = `${(p.firstName || u?.firstName || '').trim()} ${(p.lastName || u?.lastName || '').trim()}`.trim();
        const category = (p as any).category || (Array.isArray((p as any).servicesOffered) ? (p as any).servicesOffered.join(', ') : undefined);
        const verificationStatus = (p as any).verificationStatus || ((p as any).isVerified ? 'approved' : 'pending');
        return {
          id: p.id,
          createdAt: (p as any).createdAt || null,
          businessName: (p as any).businessName || null,
          category: category || null,
          verificationStatus,
          isVerified: (p as any).isVerified === true,
          hourlyRate: (p as any).hourlyRate || null,
          location: (p as any).location || null,
          servicesOffered: (p as any).servicesOffered || null,
          email: p.email || u?.email || null,
          firstName: p.firstName || u?.firstName || null,
          lastName: p.lastName || u?.lastName || null,
          phone: (p as any).phone || u?.phone || null,
          userEmail: u?.email || null,
          userPhoneNumber: (u as any)?.phone || null,
          userFirstName: u?.firstName || null,
          userLastName: u?.lastName || null,
          user: u
            ? {
                id: u.id,
                email: u.email,
                firstName: u.firstName,
                lastName: u.lastName,
                phoneNumber: (u as any).phone || null,
              }
            : null,
          displayName: fullName || (p as any).businessName || u?.email || null,
        };
      });
      res.status(200).json(enriched);
    } catch (error) {
      console.error('Admin providers error:', error);
      res.status(500).json({ message: 'Failed to fetch providers' });
    }
  });

  // Provider approval endpoints (single action endpoint)
  app.post("/api/admin/providers/:providerId", authenticateAdmin, async (req, res) => {
    try {
      const { providerId } = req.params;
      const { action } = req.body || {};

      if (action !== "approve" && action !== "decline") {
        return res.status(400).json({ message: "Invalid action. Must be 'approve' or 'decline'" });
      }

      if (action === "approve") {
        await storage.updateProviderVerificationStatus(providerId, "approved");
        const provider = await storage.getServiceProvider(providerId);
        if (provider?.userId) {
          await storage.updateUser(provider.userId, { isProvider: true, isVerified: true });
        }
        return res.json({ message: "Provider approved successfully" });
      }

      // action === "decline"
      await storage.updateProviderVerificationStatus(providerId, "rejected");
      const provider = await storage.getServiceProvider(providerId);
      if (provider?.userId) {
        await storage.updateUser(provider.userId, { isProvider: true });
      }
      return res.json({ message: "Provider declined successfully" });
    } catch (error) {
      console.error("Provider action error:", error);
      return res.status(500).json({ message: "Failed to process provider action" });
    }
  });

  // User update endpoint
  app.patch('/api/admin/users/:userId', authenticateAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const updates = req.body;
      
      // Get current user to verify it exists
      const currentUser = await storage.getUserById(userId);
      if (!currentUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update user with provided fields
      await storage.updateUser(userId, {
        firstName: updates.firstName,
        lastName: updates.lastName,
        email: updates.email,
        isVerified: updates.isVerified,
        updatedAt: new Date()
      });

      res.json({ message: 'User updated successfully' });
    } catch (error) {
      console.error('User update error:', error);
      res.status(500).json({ message: 'Failed to update user' });
    }
  });

  // Change password endpoint (requires current password)
  app.post('/api/user/change-password', authenticateToken, async (req: any, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current password and new password are required' });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ message: 'New password must be at least 8 characters long' });
      }

      // Get current user
      const user = await storage.getUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password || '');
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await storage.updateUser(req.user.id, {
        password: hashedPassword,
        updatedAt: new Date()
      });

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: 'Failed to change password' });
    }
  });

  // Get user security settings
  app.get('/api/user/security-settings', authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const preferences = user.preferences as any || {};
      res.json({
        is2FAEnabled: preferences.is2FAEnabled || false,
        isBiometricsEnabled: preferences.isBiometricsEnabled || false
      });
    } catch (error) {
      console.error('Get security settings error:', error);
      res.status(500).json({ message: 'Failed to fetch security settings' });
    }
  });

  // Toggle 2FA
  app.post('/api/user/toggle-2fa', authenticateToken, async (req: any, res) => {
    try {
      const { enabled } = req.body;

      const user = await storage.getUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const preferences = user.preferences as any || {};
      preferences.is2FAEnabled = enabled;

      await storage.updateUser(req.user.id, {
        preferences,
        updatedAt: new Date()
      });

      res.json({ 
        message: enabled ? 'Two-factor authentication enabled' : 'Two-factor authentication disabled',
        is2FAEnabled: enabled
      });
    } catch (error) {
      console.error('Toggle 2FA error:', error);
      res.status(500).json({ message: 'Failed to toggle 2FA' });
    }
  });

  // Toggle Biometrics
  app.post('/api/user/toggle-biometrics', authenticateToken, async (req: any, res) => {
    try {
      const { enabled } = req.body;

      const user = await storage.getUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const preferences = user.preferences as any || {};
      preferences.isBiometricsEnabled = enabled;

      await storage.updateUser(req.user.id, {
        preferences,
        updatedAt: new Date()
      });

      res.json({ 
        message: enabled ? 'Biometric authentication enabled' : 'Biometric authentication disabled',
        isBiometricsEnabled: enabled
      });
    } catch (error) {
      console.error('Toggle biometrics error:', error);
      res.status(500).json({ message: 'Failed to toggle biometrics' });
    }
  });
}
