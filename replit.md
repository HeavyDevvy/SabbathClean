# Overview

Berry Events is a premium domestic services marketplace in South Africa, connecting customers with verified providers for home services like cleaning, plumbing, electrical, chef/catering, and garden care. It emphasizes quality, security, and specialized offerings (e.g., African cuisine). The platform features dynamic pricing, an advanced geolocation-based booking system, AI-driven provider matching and recommendations, interactive onboarding, and secure Stripe payments routed through "Berry Events Bank." It operates as a comprehensive Progressive Web App (PWA) with mobile-native capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend

Built with React 18 and TypeScript, using a component-based architecture with shadcn/ui and Tailwind CSS (new-york theme). Wouter handles routing, TanStack Query manages server state, and React Hook Form with Zod handles form validation.

## Backend

An Express.js application in TypeScript, providing a RESTful API with a `/api/resource` pattern. It uses middleware for parsing and error handling, separating concerns between route handlers, storage, and business logic.

## Data

PostgreSQL database with Drizzle ORM. Key entities include Users, Service Providers, Services, Bookings, and Reviews, with UUID primary keys and proper relationships. Supports detailed provider profiles, commission tracking, and payment status.

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