# Overview

Berry Events - All your Home Services In One is a comprehensive domestic services marketplace platform connecting customers with verified service providers for various home services, including cleaning, plumbing, electrical work, chef/catering, waitering, and garden care. The platform aims to be a leading premium service provider in South Africa, emphasizing quality, security, and specialized services like African cuisine catering. It offers a dynamic pricing model, an advanced booking system with geolocation, provider matching, reviews, and secure payment processing via Stripe, with all payments flowing through "Berry Events Bank" to ensure trust and security. The platform also includes an AI-powered recommendation engine, an interactive onboarding tutorial, and a comprehensive Progressive Web App (PWA) with mobile companion features including push notifications, offline functionality, and native app-like experience.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend is built with React 18 and TypeScript, leveraging a component-based architecture with shadcn/ui. It uses Wouter for client-side routing, TanStack Query for server state management, and Tailwind CSS for styling with a "new-york" shadcn theme. Form handling is managed by React Hook Form with Zod validation. The structure is modular, organizing components by feature and UI elements.

## Backend Architecture

The backend is an Express.js application built with TypeScript, implementing a RESTful API. It follows a `/api/resource` pattern for endpoints and utilizes middleware for JSON parsing, URL encoding, and centralized error handling. The architecture ensures a clean separation of concerns between route handlers, storage operations, and business logic. It integrates with Vite for development-time hot module replacement.

## Data Architecture

The platform uses a PostgreSQL database with Drizzle ORM for schema definition and interaction. Key entities include Users, Service Providers, Services, Bookings, and Reviews, with proper foreign key relationships and UUID primary keys. The schema supports detailed provider profiles (including verification and banking details), commission tracking, and payment status management.

## Authentication & Security

The system includes basic user management and is designed to support comprehensive authentication and session management. It tracks provider verification status and prepares for secure session handling. All payments are processed through Berry Events Bank with an escrow-like protection, and a 15% platform commission is applied.

## UI/UX Decisions

**Major Design Overhaul (Dec 2024):** Completely redesigned to mirror SweepSouth's minimalistic approach with clean, spacious layouts and simplified user flows. Removed redundant features and focused on core functionality. 

The platform now features:
- Minimalistic hero section with focused quick-booking flow
- Streamlined services grid (6 core services vs previous 8+ categories)  
- Clean navigation with reduced menu items
- Spacious card layouts with ample white space
- Simplified trust indicators and testimonials
- Single-path user journeys without complex branching
- Removed animated elements that added visual noise
- Consolidated multiple similar components into unified, clean interfaces

Previous comprehensive features are still available at `/enhanced` route for comparison.

**Brand Styling Implementation (Nov 13, 2025):** Complete Berry Events brand color system rollout across all user-facing components. Updated CSS variables in `client/src/index.css` with brand palette: deep plum primary (#3C0B2C), light beige backgrounds (#F5E1CF), complementary error (#C23844), and success (#2D5C3F). Replaced hard-coded blue/purple colors with semantic Tailwind classes (bg-primary, text-primary, hover:bg-accent, text-success) in 8+ key components including home page, header, authentication, booking modals, cart/checkout, and order confirmation. All buttons, badges, loading states, and interactive elements now use Berry Events brand colors consistently. Maintained light-only theme enforcement for brand coherence.

## Feature Specifications

- **Services**: Supports 8 comprehensive service categories (cleaning, garden-care, plumbing, electrical, chef-catering, event-staff, moving, au-pair) with streamlined 4-step booking workflow. Includes location-based booking and specific requirements for each service. **Cart-Based Booking (Nov 2025)**: Removed payment step from booking flow - users now add services to cart (max 3) and checkout together at /cart-checkout.
- **Chef & Catering**: Specializes in African cuisine (South African, West African, East African, North African, Central African) with flavor-based preferences, dual menu options (pre-made and custom builders), and real-time pricing.
- **Provider Onboarding**: A 4-step professional application process including mobile camera document capture for ID verification, business documents, banking details, and a 24-48 hour review timeline.
- **Training & Certification**: A comprehensive system for providers including multi-level training modules, progress tracking, service-specific certifications with expiration dates, and skill assessments.
- **Recommendation Engine**: AI-powered service matching based on user preferences, location, ratings, and history, with contextual suggestions and real-time scoring.
- **Dynamic Pricing**: Market-comparable pricing with service-specific surcharges, customizations, and competitive positioning against industry benchmarks.
- **Mobile App Companion**: Complete Progressive Web App implementation with push notifications, offline functionality, service worker caching, PWA manifest, installable mobile experience, and native app features including background sync and notification management.
- **Payment Validation (Steps 6-7 - Nov 2025)**: Comprehensive client-side payment validation with Luhn algorithm card number verification, auto-formatting for card numbers (spaces every 4 digits) and expiry dates (MM/YY), card brand detection (Visa, Mastercard, Amex, Discover), CVV validation (3-4 digits based on card type), bank account validation (8-12 digits), real-time error feedback with touched state tracking, and security best practices (no PAN/CVV logging, masked storage with only last 4 digits + brand, state cleanup after booking completion, validation guard before booking confirmation).
- **PDF Receipt Generation (Step 8 - Nov 2025)**: Professional PDF receipt generation using jsPDF with comprehensive booking confirmation. Features include: Berry Events branded design with purple/green color scheme, persistent booking reference (useMemo), organized sections (Service Details, Provider Details, Payment Summary), pricing breakdown with discounts and add-ons, masked payment info display (last 4 digits only), Berry Events Bank protection notice, platform commission disclosure (15%), professional footer with contact info, automatic download on confirmation, error handling with toast notifications, and fallback handling for missing data.
- **Currency Handling (Nov 10, 2025)**: Implemented centralized currency utilities (`client/src/lib/currency.ts`) with `parseDecimal()` and `formatCurrency()` functions to safely handle PostgreSQL decimal string conversions. Applied across cart drawer, cart checkout, and order confirmation pages to prevent NaN displays. All monetary calculations now use safe parsing with fallback to 0 for invalid/null values, and consistent R{amount.toFixed(2)} formatting.
- **Booking Management Suite (Nov 12, 2025)**: Complete booking lifecycle management with five core features: (1) **Reschedule**: Date/time picker dialog for upcoming bookings with PATCH `/api/bookings/:id/reschedule` endpoint and immediate UI refresh via query invalidation, (2) **Cancel**: AlertDialog with optional reason capture, refund status tracking (pending/processing), res.ok validation for error handling, and 5-7 business day refund policy notice, (3) **Re-book**: "Book Again" button on completed bookings that opens ModernServiceModal with pre-populated data (address, gate code, preferences, schedule) for seamless rebooking with automatic query invalidation, (4) **Share**: ShareBookingDialog with multiple sharing options (copy shareable link, copy details text, email via mailto), async clipboard operations with try/catch error handling for HTTP origins, privacy-conscious (excludes payment data), and professional booking summary with Berry Events branding, (5) **View Receipt**: Generate and download professional PDF receipts for completed bookings using normalized BookingReceiptData interface with Berry Events branding, pricing breakdown, and masked payment information.
- **Gate Code Security (Nov 12, 2025)**: Secure cart-to-order gate code transfer with stable 1:1 mapping via `sourceCartItemId` field in order_items table. Checkout flow populates sourceCartItemId when converting cart items to order items, enabling exact ID matching for gate code transfer in createOrder transaction. Eliminates composite key race conditions that caused gate code loss on duplicate bookings. Gate codes are transferred within transaction boundary with safe parameter binding using Drizzle's inArray helper, then original cart gate codes are deleted after successful transfer.
- **House Cleaning Enhancements (Nov 13, 2025)**: Service-specific booking enhancements exclusively for House Cleaning: (1) **Enhanced Provider Cards**: Display provider bio (line-clamp-2), profile images (16x16 rounded), jobs completed + years experience, qualifications as badges, and availability vs specializations. Provider data kept generic to avoid contamination across services. (2) **Tipping Functionality**: Provider tipping UI at step 4 with preset buttons (R0, R20, R50, R100) and custom input (0-1000 range, 2 decimal precision, NaN/empty string validation). Tips stored separately in cart payload and serviceDetails JSON, excluded from subtotal, and exempt from 15% platform commission. (3) **3-Button CTA Layout**: Modified footer buttons showing "Back", "Add to cart & Select Another", and "Add & Go to Cart" for streamlined booking flow. (4) **Estimated Hours Logic**: 6-hour minimum baseline + 0.5 hours per add-on (implemented in config/estimates.ts). (5) **Database Schema**: Added tip_amount column (DECIMAL(10,2) DEFAULT 0) to both cart_items and order_items tables. Checkout flow transfers tips from cart to order, includes tips in total calculation (subtotal + tips + platformFee), and persists through complete booking lifecycle (cart → checkout → order → receipt).

# External Dependencies

## Database
- **Neon Database**: Serverless PostgreSQL hosting, utilized with `@neondatabase/serverless` driver.
- **Drizzle ORM**: Used for type-safe database interactions and schema migrations.

## Payment Processing
- **Stripe**: Integrated for secure payment processing using `@stripe/stripe-js` and `@stripe/react-stripe-js`.

## UI Framework
- **shadcn/ui**: Component library built on Radix UI primitives.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Radix UI**: Provides accessible, unstyled component primitives.

## Development Tools
- **Vite**: Fast build tool for development.
- **TypeScript**: Used for type safety across the entire application.
- **ESBuild**: Utilized for fast production builds.

## Session & Storage
- **connect-pg-simple**: For PostgreSQL-backed Express session management.

## Form & Validation
- **React Hook Form**: For performant form handling.
- **Zod**: Used for runtime type validation and schema parsing.

## PDF Generation
- **jsPDF**: Used for generating professional PDF receipts with Berry Events branding.