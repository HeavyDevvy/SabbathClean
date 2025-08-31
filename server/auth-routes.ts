import type { Express } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";
const REMEMBER_TOKEN_EXPIRES = 30 * 24 * 60 * 60 * 1000; // 30 days

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  rememberMe: z.boolean().optional()
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional()
});

// JWT token generation
const generateTokens = (userId: string, rememberMe: boolean = false) => {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  const refreshToken = rememberMe ? jwt.sign(
    { userId, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: '30d' }
  ) : null;

  return { accessToken, refreshToken };
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

export function registerAuthRoutes(app: Express) {
  // Registration endpoint
  app.post('/api/auth/register', async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(409).json({ message: 'Email already registered' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);

      // Create user
      const newUser = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
        authProvider: 'email'
      });

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(newUser.id, false);

      // Update last login
      await storage.updateUserLastLogin(newUser.id);

      res.status(201).json({
        message: 'Registration successful',
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          profileImage: newUser.profileImage,
          isProvider: newUser.isProvider
        },
        accessToken,
        refreshToken
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
      }
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Registration failed' });
    }
  });

  // Login endpoint
  app.post('/api/auth/login', async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      // Find user by email
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user || !user.password) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(validatedData.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user.id, validatedData.rememberMe);

      // Update last login and remember token if needed
      await storage.updateUserLastLogin(user.id);
      if (refreshToken && validatedData.rememberMe) {
        await storage.updateRememberToken(user.id, refreshToken, new Date(Date.now() + REMEMBER_TOKEN_EXPIRES));
      }

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
        refreshToken
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
      const { accessToken } = generateTokens(user.id, false);

      res.json({ accessToken });
    } catch (error) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }
  });

  // Get current user endpoint
  app.get('/api/auth/user', authenticateToken, async (req: any, res) => {
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
      notificationSettings: req.user.notificationSettings
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
      // Mock Google user data for demo - in production use actual OAuth
      const mockGoogleUser = {
        email: 'demo.google@berryevents.com',
        firstName: 'Google',
        lastName: 'User',
        profileImage: 'https://via.placeholder.com/150/4285F4/white?text=G',
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
      let user = await storage.getUserByEmail(mockGoogleUser.email);
      if (!user) {
        user = await storage.createUser(mockGoogleUser);
      }
      
      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user.id, true);
      
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
      
      const { accessToken, refreshToken } = generateTokens(user.id, true);
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
      
      const { accessToken, refreshToken } = generateTokens(user.id, true);
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
      
      const { accessToken, refreshToken } = generateTokens(user.id, true);
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
}