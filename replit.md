# Overview

Berry Events is a domestic services marketplace connecting customers with verified providers for home services like cleaning, plumbing, electrical, chef/catering, and garden care. It aims to be a premium platform in South Africa, focusing on quality, security, and specialized services (e.g., African cuisine). Key features include dynamic pricing, an advanced booking system with geolocation, provider matching, reviews, secure Stripe payments (with all funds routed through "Berry Events Bank"), an AI recommendation engine, interactive onboarding, and a comprehensive Progressive Web App (PWA) with mobile-native capabilities.

# Recent Changes

## November 18, 2025
- Enhanced My Bookings page with complete booking management features:
  - **Auto-move logic**: Bookings automatically move from "Upcoming" to "Past" based on scheduledDate/scheduledTime comparison using isBookingInPast() helper function
  - **Button Cleanup**: Past bookings now show ONLY "Review your berry" and "Re-book" buttons. Removed Chat, Reschedule, Share, WhatsApp Share, and Cancel buttons from past bookings for cleaner UI.
  - **Review Modal**: Added "Review your berry" button for past/completed bookings with ReviewBerryModal component featuring:
    - 0-5 star rating system with hover effects
    - **Service provider details** (name, not service type) prominently displayed
    - Complete booking summary
    - Optional comments text area for written feedback
    - Placeholder submission handler (logs to console until backend API is implemented)
  - **Re-book Flow**: Fixed "Re-book" button to use EXACT same flow as Profile page "Book Now":
    - Uses identical state management (isBookingOpen, selectedServiceId, prefillData)
    - Opens ModernServiceModal with prefillFromRecent prop for data pre-population
    - Navigates to complete booking steps flow with all service-specific fields
    - Gate code deliberately excluded for security
    - Date and time fields left blank for user to select new appointment
    - Supports all 9 service types with their unique configuration fields
- Updated header and navigation design:
  - **Header Background**: Changed to dark plum (#44062D) for premium brand aesthetic
  - **Admin Portal**: Moved from top header navigation to Footer Support section for better organization
  - **Navigation Icons**: Home and Services use distinct icons (Home vs Briefcase) for clear differentiation
  - **User Initials Avatar**: Updated background color to brand color (#C56B86) for consistency
  - **Text Colors**: All header text updated to white with light beige (#EED1C4) hover states for optimal visibility on dark background
  - **Search Bar**: Styled with semi-transparent background and white text for cohesive dark theme integration

## November 16, 2025
- Implemented complete real-time chat system for customer-provider communication:
  - Backend: WebSocket handlers (server/routes.ts), REST API endpoints (server/chat-routes.ts), storage methods for conversations and messages
  - Database: Conversations and messages tables with proper relationships
  - Frontend: ChatInterface component with real-time messaging, auto-scroll, and typing indicators
  - Integration: Added chat dialogs to customer bookings page and provider portal
  - Features: Real-time message delivery via WebSocket, conversation persistence, message read tracking

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

The design features a minimalistic approach, inspired by platforms like SweepSouth, with clean layouts, simplified user flows, and reduced visual clutter. The platform incorporates a complete Berry Events brand color system (deep plum, light beige, etc.) using semantic Tailwind classes for consistent styling across all components.

## Feature Specifications

- **Services**: Supports 8 service categories with a streamlined 4-step booking workflow, including location-based booking. A cart-based booking system allows users to add multiple services (max 3) and checkout together.
- **Chef & Catering**: Specializes in African cuisine with flavor preferences, dual menu options (pre-made/custom), and real-time pricing.
- **Provider Onboarding**: A 4-step application process with document capture, ID verification, and banking details.
- **Training & Certification**: Multi-level training modules, progress tracking, and skill assessments for providers.
- **Recommendation Engine**: AI-powered service matching based on user preferences, location, ratings, and history.
- **Dynamic Pricing**: Market-comparable pricing with service-specific surcharges and customizations.
- **Mobile App Companion**: A PWA with push notifications, offline functionality, and an installable mobile experience.
- **Payment Validation**: Client-side validation for card numbers (Luhn algorithm, auto-formatting, brand detection), expiry dates, CVV, and bank accounts, with real-time error feedback.
- **PDF Receipt Generation**: Professional, branded PDF receipts generated with jsPDF for booking confirmations, including detailed pricing, masked payment info, and platform commission.
- **Currency Handling**: Centralized utilities (`parseDecimal`, `formatCurrency`) for safe handling of PostgreSQL decimal strings and consistent formatting (R{amount.toFixed(2)}).
- **Booking Management Suite**: Features to reschedule, cancel, re-book, share, and view receipts for bookings.
- **Gate Code Security**: Secure transfer of gate codes from cart to order items via `sourceCartItemId` to prevent data loss.
- **House Cleaning Enhancements**: Enhanced provider cards (bio, experience, qualifications), optional tipping functionality (not subject to commission), a 3-button CTA layout, estimated hours logic, and dedicated database columns for tips.
- **Customizable User Profiles**: Users can select preferred services and save favorite providers for personalized recommendations and quick rebooking. The `users` table is extended with fields like `preferred_services` and `preferred_providers`.
- **Dynamic Time Estimation**: Intelligent service duration calculation (`config/estimates.ts`) with base times, add-on logic, and specialized calculations for house cleaning based on cleaning type, room count, and add-ons. Estimated hours are displayed in real-time during booking.
- **Real-Time Chat System**: WebSocket-based messaging between customers and service providers for each booking. Includes conversation management, message persistence, real-time delivery, auto-scroll, and read receipts. Accessible from both customer bookings page and provider dashboard.

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