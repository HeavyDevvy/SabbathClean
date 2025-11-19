# Overview

Berry Events is a premium domestic services marketplace in South Africa, connecting customers with verified providers for home services like cleaning, plumbing, electrical, chef/catering, and garden care. It emphasizes quality, security, and specialized offerings (e.g., African cuisine). The platform features dynamic pricing, an advanced geolocation-based booking system, AI-driven provider matching and recommendations, interactive onboarding, and secure Stripe payments routed through "Berry Events Bank." It operates as a comprehensive Progressive Web App (PWA) with mobile-native capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend

Built with React 18 and TypeScript, using a component-based architecture with shadcn/ui and Tailwind CSS (new-york theme). Wouter handles routing with lazy loading for non-critical routes, TanStack Query manages server state with optimized caching (2-5 minute stale times), and React Hook Form with Zod handles form validation. Centralized AuthProvider and CartProvider prevent duplicate API calls.

## Backend

An Express.js application in TypeScript, providing a RESTful API with a `/api/resource` pattern. It uses middleware for parsing and error handling, separating concerns between route handlers, storage, and business logic.

## Data

PostgreSQL database with Drizzle ORM. Key entities include Users, Service Providers, Services, Bookings, and Reviews, with UUID primary keys and proper relationships. Supports detailed provider profiles, commission tracking, and payment status. Optimized with indexes on frequently-queried columns: cart_items(cart_id, added_at), carts(user_id + status, session_token + status) for sub-second query performance.

## Authentication & Security

Includes basic user management and is designed for secure session handling. Provider verification status is tracked. All payments are processed through Berry Events Bank with escrow-like protection and a 15% platform commission.

## UI/UX Decisions

The design adopts a minimalistic approach, inspired by platforms like SweepSouth, featuring clean layouts, simplified user flows, and reduced visual clutter. It incorporates a complete Berry Events brand color system (deep plum, light beige, etc.) using semantic Tailwind classes for consistent styling. Header elements are designed for visual harmony and mobile optimization, with consistent button styling.

## Feature Specifications

- **Services**: Supports 8 service categories with a streamlined 4-step, location-based booking workflow. A cart-based system allows users to book multiple services (max 3) simultaneously.
- **Chef & Catering**: Specializes in African cuisine with flavor preferences, dual menu options, and real-time pricing.
- **Provider Management**: Includes a 4-step onboarding process with document/ID verification, banking details capture, multi-level training modules, progress tracking, and skill assessments.
- **Recommendation Engine**: AI-powered service matching based on user preferences, location, ratings, and history.
- **Dynamic Pricing**: Market-comparable pricing with service-specific surcharges and customizations.
- **Mobile App Companion**: A PWA offering push notifications, offline functionality, and an installable mobile experience.
- **Payment Validation**: Client-side validation for card numbers (Luhn algorithm, auto-formatting, brand detection), expiry dates, CVV, and bank accounts, with real-time error feedback.
- **PDF Receipt Generation**: Professional, branded PDF receipts generated with jsPDF for booking confirmations, including detailed pricing and masked payment info.
- **Currency Handling**: Centralized utilities (`parseDecimal`, `formatCurrency`) for safe handling of PostgreSQL decimal strings and consistent formatting.
- **Booking Management Suite**: Features for users to reschedule, cancel, re-book, share, and view receipts for their bookings. Past bookings automatically move to a "Past" section and offer options to "Review your berry" or "Re-book".
- **Gate Code Security**: Secure transfer of gate codes from cart to order items via `sourceCartItemId`.
- **House Cleaning Enhancements**: Enhanced provider cards (bio, experience, qualifications), optional tipping functionality, estimated hours logic, and dedicated database columns for tips.
- **Customizable User Profiles**: Users can select preferred services and save favorite providers for personalized recommendations and quick rebooking.
- **Dynamic Time Estimation**: Intelligent service duration calculation (`config/estimates.ts`) with base times, add-on logic, and specialized calculations for house cleaning. Estimated hours are displayed in real-time.
- **Real-Time Chat System**: WebSocket-based messaging between customers and service providers for each booking, including conversation management, message persistence, real-time delivery, auto-scroll, and read receipts.
- **Berry Stars Integration**: Direct booking from featured "Berry Stars" providers pre-selects the provider in the booking flow, maintaining the standard 4-step process.
- **Real-Time Notifications System**: Secure, authentication-protected notification system with unread count display in header, mark-as-read functionality, and automatic expiry support. Notifications are created internally via NotificationHelper for booking updates, payment confirmations, new messages, and reviews. Features database indexes for performance and enforces user ownership for all operations.

# External Dependencies

## Database
- **Neon Database**: Serverless PostgreSQL hosting.
- **Drizzle ORM**: Type-safe database interactions.

## Payment Processing
- **Stripe**: Secure payment processing.

## UI Framework
- **shadcn/ui**: Component library.
- **Tailwind CSS**: Utility-first CSS framework.
- **Radix UI**: Accessible, unstyled component primitives.

## Development Tools
- **Vite**: Fast build tool.
- **TypeScript**: Type safety.
- **ESBuild**: Fast production builds.

## Session & Storage
- **connect-pg-simple**: PostgreSQL-backed Express session management.

## Form & Validation
- **React Hook Form**: Form handling.
- **Zod**: Runtime type validation.

## PDF Generation
- **jsPDF**: PDF receipt generation.

# Performance Optimizations (November 2025)

## Database Optimizations
- **Indexes Added**: cart_items(cart_id, added_at), carts(user_id + status, session_token + status)
- **Result**: Cart API response time reduced from ~2.5s to ~565ms (77% improvement)

## Frontend Optimizations
- **Lazy Loading**: 30+ routes converted to React.lazy() with Suspense, keeping only critical pages (Home, Auth, Profile, Checkout) eager-loaded
- **Auth Centralization**: Header and EnhancedHeader now use centralized AuthContext, eliminating duplicate /api/auth/user calls
- **Cache Optimization**: AuthContext (2min stale, 10min cache), CartContext (1min stale, 5min cache), refetchOnWindowFocus disabled
- **Memoization**: Added useMemo to CartContext for cart normalization and itemCount calculation
- **Logout Optimization**: Replaced window.location.reload() with navigation, changed queryClient.clear() to targeted invalidation

## Expected Performance Gains
- Initial load time: 50-60% reduction
- Cart API response: 77% reduction (from 2.5s to <600ms)
- Eliminated duplicate authentication API calls
- Reduced unnecessary re-renders with memoization

## Pending Optimizations
- Image compression (see IMAGE_OPTIMIZATION_GUIDE.md): 19MB+ images need compression to WebP format
- Service modal component splitting: 4,169-line component needs decomposition
- Vendor library lazy loading: Stripe, jsPDF could be dynamically imported