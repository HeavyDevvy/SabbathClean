# Overview

Berry Events is a premium domestic services marketplace in South Africa, connecting customers with verified providers for home services like cleaning, plumbing, electrical, chef/catering, and garden care. The platform emphasizes quality, security, dynamic pricing, advanced geolocation-based booking, AI-driven provider matching, interactive onboarding, and secure Stripe payments routed through "Berry Events Bank." It operates as a comprehensive Progressive Web App (PWA) with mobile-native capabilities, offering specialized services like African cuisine, aiming to capture the market for high-quality domestic services.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## UI/UX Decisions
The design adopts a minimalistic approach with clean layouts, simplified user flows, and reduced visual clutter. It incorporates a complete Berry Events brand color system using semantic Tailwind classes for consistent styling, with header elements designed for visual harmony and mobile optimization.

## Technical Implementations
- **Frontend**: Built with React 18 and TypeScript, utilizing a component-based architecture with shadcn/ui and Tailwind CSS. Wouter handles lazy-loaded routing, TanStack Query manages server state with optimized caching, and React Hook Form with Zod handles form validation.
- **Backend**: An Express.js application in TypeScript, providing a RESTful API with clear separation of concerns.
- **Data**: PostgreSQL database with Drizzle ORM, optimized with indexes for sub-second query performance.
- **Authentication & Security**: Secure session handling with user management and provider verification. All payments are processed through "Berry Events Bank" with escrow-like protection.
- **Performance Optimizations**: Database indexing, lazy loading, centralized authentication context, aggressive caching, and image optimization (WebP format).
- **Architectural Refactoring**: Focus on modularization of the storage layer, consolidation of redundant components, and a hooks-first approach to reduce technical debt and improve maintainability.

## Feature Specifications
- **Services**: Supports 8 service categories with a 4-step, location-based booking workflow and a cart system for booking up to 3 services simultaneously. Includes specialized Chef & Catering services with African cuisine focus and real-time pricing.
- **Provider Management**: Features a 4-step onboarding process with verification, banking details capture, multi-level training, and skill assessments.
- **Recommendation Engine**: AI-powered service matching based on user preferences, location, ratings, and history.
- **Dynamic Pricing**: Market-comparable pricing with service-specific surcharges.
- **Mobile App Companion**: PWA offering push notifications, offline functionality, and an installable mobile experience.
- **Payment Validation**: Client-side validation for card numbers, expiry dates, CVV, and bank accounts.
- **PDF Receipt Generation**: Branded PDF receipts for booking confirmations.
- **Booking Management Suite**: Features to reschedule, cancel, re-book, share, and view receipts for bookings.
- **Real-Time Chat System**: WebSocket-based messaging between customers and service providers per booking.
- **Real-Time Notifications System**: Secure, authentication-protected notifications for booking updates, payments, messages, and reviews.
- **Customizable User Profiles**: Users can select preferred services and save favorite providers.
- **Dynamic Time Estimation**: Intelligent service duration calculation.

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