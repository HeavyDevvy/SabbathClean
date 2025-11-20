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
- **Architectural Refactoring**: Systematic modal decomposition reducing `modern-service-modal.tsx` from 4,270 lines to 2,062 lines (51.7% reduction) through 6 phases, extracting 12 focused components with complete TypeScript type safety and zero runtime errors.

### Modal Decomposition Progress (Phases 1-6)
**Phase 1**: Service Configuration & Pricing Utilities
- Extracted: `service-configs.ts` (392 lines), `payment-validation.ts` (113 lines)
- Modal: 4,270 → 4,148 lines (-122 lines, 3% reduction)

**Phase 2**: Service-Specific Forms
- Extracted: 7 service forms (CleaningForm, PoolMaintenanceForm, GardenCareForm, MovingPackingForm, PlumbingForm, ElectricalForm, EventStaffForm)
- Modal: 4,148 → 3,368 lines (-780 lines, 19% reduction)

**Phase 3**: Chef & Catering Form
- Extracted: ChefCateringForm (331 lines)
- Modal: 3,368 → 3,087 lines (-281 lines, 8% reduction)

**Phase 4**: Location Step
- Extracted: LocationStep (352 lines)
- Modal: 3,087 → 2,766 lines (-321 lines, 10% reduction)

**Phase 5**: Review Step
- Extracted: ReviewStep (609 lines)
- Modal: 2,766 → 2,547 lines (-219 lines, 8% reduction)

**Phase 6**: Payment Step & TypeScript Fixes ✅
- Fixed: 13 TypeScript null safety errors for `currentConfig`
- Extracted: PaymentStep (609 lines) - payment summary, card/bank forms, validation
- Modal: 2,547 → 2,062 lines (-485 lines, 19% reduction)
- Status: ✅ Production-ready, architect-approved, zero LSP diagnostics, zero runtime errors

**Cumulative Results**: 4,270 → 2,062 lines (-2,208 lines, 51.7% total reduction)

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