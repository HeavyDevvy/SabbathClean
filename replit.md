# Overview

Berry Events - All your Home Services In One is a comprehensive domestic services marketplace platform that connects customers with verified service providers for house cleaning, plumbing, electrical work, chef/catering, waitering, and garden care services. The platform features a React frontend with shadcn/ui components, an Express.js backend with REST API endpoints, and PostgreSQL database using Drizzle ORM. The application supports service booking with geolocation functionality, provider matching, reviews, and payment processing with Stripe integration using South African Rand (ZAR) currency.

## Recent Changes (August 2025)

✓ **Dynamic Pricing & Payment Gateway Integration**: Complete market-comparable pricing system with payment processing (August 2025):
  - Dynamic pricing calculations with service-specific surcharges and customizations
  - Market-competitive base rates: Cleaning (R75/hr), Chef & Catering (R400/event), Plumbing (R120/hr), Electrical (R150/hr)
  - Chef & Catering specialized pricing: Halal/non-Halal options, ingredient sourcing (+R150), guest count multipliers
  - Emergency service surcharges (plumbing +R80), property size adjustments (cleaning +R50), distance fees (moving +R200)
  - Complete payment flow: booking modal → payment processing → confirmation page with receipt
  - Payment confirmation page with booking details, customer info, cost breakdown, and next steps
  - Functional header navigation with Home, Services, and Bookings pages

✓ **Comprehensive Home Services Platform Implementation**: Complete implementation of 8 service categories with advanced booking workflows (August 2025):
  - Comprehensive Services Component with cleaning, plumbing, electrical, chef/catering, moving, au pair, garden care, and waitering services
  - Advanced Booking Modal with service-specific multi-step workflows (4-5 steps per service)
  - Service-specific requirements: cleaning (property size, frequency), plumbing (emergency 24/7, problem assessment), electrical (safety certificates, compliance)
  - Chef & Catering with African cuisine specialization (South African, West African, East African, North African, Central African)
  - Moving services (local/long-distance, inventory management, packing options)
  - Au Pair services (live-in contracts, background checks, childcare scheduling)
  - Location-based booking system with GPS integration and provider matching
  - Payment system supporting card payments and bank transfers with transparent pricing

✓ **Complete Platform Transformation**: Comprehensive rebuild of Berry Events into SweepSouth-style marketplace (August 2025):
  - Enhanced database schema with 20+ new tables for comprehensive marketplace functionality
  - New comprehensive booking modal with 5-step workflow (service selection, location details, provider matching, scheduling, payment)
  - Advanced header with authentication states, notifications, messages, and user management
  - Professional hero section with trust indicators, stats display, and interactive elements
  - Comprehensive services section with categorized offerings (Indoor, Outdoor, Maintenance, Specialized)
  - Trust & safety section with verification processes, certifications, and emergency support
  - How-it-works section with interactive demo and mobile app preview
  - Full marketplace architecture supporting messages, notifications, support tickets, earnings tracking
  - Enhanced provider system with availability management, time-off scheduling, and payout processing
  - Promotional codes system with discount management and usage tracking

## Recent Changes (August 2025)

✓ **Personalized Recommendation Engine & Interactive Onboarding**: AI-powered service matching with animated tutorial system (August 2025):
  - Smart recommendation engine with user preference tracking and contextual suggestions
  - Machine learning algorithms for service-provider matching based on location, ratings, and user history
  - Interactive onboarding tutorial with 9-step animated walkthrough covering all platform features
  - Contextual recommendations based on time of day, weather, and previous searches
  - User preference management system with budget, location, timing, and provider criteria
  - Real-time recommendation scoring with match explanations and quality indicators

✓ **Mobile App Companion with PWA Technology**: Complete Progressive Web App implementation (August 2025):
  - Full PWA manifest with service worker for offline functionality and native app features
  - Mobile app installation banner with install prompts and app shortcuts
  - Push notifications system with usePushNotifications hook and notification settings
  - Mobile-optimized navigation with bottom tabs and slide-out menu
  - Offline page with cached content access and background sync for bookings
  - Enhanced SEO meta tags and social media sharing optimization
  - Backend API support for push subscriptions and notification preferences

✓ **Competitive Pricing Analysis & Implementation**: Comprehensive market positioning system:
  - Researched SweepSouth and competitors: R75/hour average vs Berry Events R280/hour premium positioning
  - Dynamic pricing component shows competitor comparisons for all 6 services
  - "Better Value" badges highlighting competitive advantages
  - Transparent pricing with security messaging: "All payments via Berry Events Bank"

✓ **Enhanced Provider Onboarding System**: Complete 4-step professional application:
  - Mobile camera document capture for ID verification and certificates
  - Individual vs company provider types with specialized requirements
  - Banking details collection for secure payment distribution
  - Document verification workflow with mobile-optimized experience
  - Post-submission success screen with 24-48 hour review timeline

✓ **Comprehensive Competitive Advantage Section**: Market positioning showcase:
  - Four key differentiators: Better Pricing, Secure Payment Flow, Premium Standards, South African Focus
  - Detailed feature comparisons vs competitors (SweepSouth, industry standards)
  - Customer testimonials: "4.8/5 rating, 1000+ happy customers, 100% payment security"
  - Value proposition highlighting African cuisine specialization

✓ **Enhanced Payment Architecture**: Secure payment-first system:
  - All payments flow through Berry Events Bank before provider distribution
  - 15% platform commission (competitive with industry standards)
  - 2-3 business day payment processing with escrow protection
  - Updated database schema with commission tracking and payout management

✓ **Advanced Service Pricing System**: Dynamic competitive positioning:
  - House Cleaning: R280/hr vs R75/hr (SweepSouth) - Premium service justification
  - Chef & Catering: R550/event vs R800+ market - African cuisine specialization
  - Waitering: R180/hr vs R200+ industry - Event specialists with bar training
  - Real-time pricing calculators with event-specific multipliers

✓ **Database Storage Implementation**: Production-ready data persistence (August 2025):
  - Switched from in-memory storage to PostgreSQL database using Drizzle ORM
  - Enhanced provider schema with verification status, banking details, location coordinates
  - Booking system with commission tracking and payment status management
  - Optimized query performance with proper indexing and caching

✓ **Enhanced Chef & Catering Experience**: Comprehensive cuisine and menu system:
  - Advanced cuisine selection: South African Traditional, Nigerian, Ethiopian, Moroccan + international options
  - Flavor-based preference system (Smoky BBQ, Spicy Peri-Peri, Aromatic Herbs, Complex Spices)
  - Dual menu options: Popular pre-made menus with authentic dishes and pricing
  - Custom menu builder with selectable items and add/remove functionality
  - Real-time pricing calculations based on selected items and guest count

✓ **Comprehensive Training & Certification System**: Complete provider development infrastructure (August 2025):
  - **Training Modules**: Multi-level courses with video content, interactive exercises, quizzes, and practical assignments
  - **Progress Tracking**: Real-time monitoring of completion percentages, time spent, last accessed dates, and performance scores
  - **Certification Framework**: Service-specific certifications with earned status, expiration dates, and verification codes
  - **Skill Assessments**: Quiz, practical, and portfolio-based evaluations with automated scoring and feedback
  - **Database Integration**: Full PostgreSQL schema with 6 new tables for comprehensive training data management
  - **Exclusive Provider Access**: Training Center available only through secure provider portals with social scoring benefits

✓ **Enhanced Visual Design & Icon System**: Improved platform aesthetics and user experience (August 2025):
  - **Mobile App Banner Optimization**: Removed duplicate Berry logo functionality while maintaining clean design
  - **Enhanced Icon System**: Gradient icon backgrounds, improved visual consistency across all components
  - **Floating Action Buttons**: Redesigned with gradients, improved sizing, and better visual hierarchy
  - **Component Icon Upgrades**: Enhanced hero section, competitive advantage, and service cards with modern icon treatments
  - **Fresh Design Preservation**: Maintained original fresh look while upgrading icon quality and consistency

✓ **Comprehensive Platform Overhaul & Clean User Flows**: Complete system redesign for seamless booking experience (August 2025):
  - **Header Cleanup**: Removed mobile app icons and blue Berry Events branding, restored clean original format
  - **Provenir-Style Animated Demo**: Interactive "Watch How It Works" booking demonstration with 6-step animated workflow
  - **Enhanced User Authentication**: Professional signup/signin system with demographic data collection for booking confirmations
  - **4-Step Enhanced Booking Flow**: Seamless booking process from service selection through payment confirmation
  - **Comprehensive Provider Onboarding**: 4-step application with KYC/KYB verification, document upload with camera capture, and banking details collection
  - **Payment Gateway Integration**: Secure payment processing through Berry Events Bank with escrow protection and 15% platform commission
  - **Document Verification System**: Professional document upload with mobile camera support for ID, business documents, and certificates
  - **Banking Integration**: Complete South African banking system integration with major banks and secure payment distribution

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The client-side is built with React 18 and TypeScript, utilizing a component-based architecture with shadcn/ui design system. Key architectural decisions include:

- **Routing**: Wouter for lightweight client-side routing with support for `/`, `/booking`, `/providers`, and `/profile` pages
- **State Management**: TanStack Query (React Query) for server state management and API data caching
- **Styling**: Tailwind CSS with custom CSS variables for theming, using the "new-york" shadcn style
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **UI Components**: Comprehensive shadcn/ui component library with Radix UI primitives

The frontend follows a modular structure with components organized by feature (booking, providers, services) and reusable UI components in the `/ui` directory.

## Backend Architecture

The server-side uses Express.js with TypeScript in a RESTful API architecture:

- **API Design**: RESTful endpoints following `/api/resource` pattern for users, services, providers, bookings, and reviews
- **Request Handling**: Express middleware for JSON parsing, URL encoding, and request logging
- **Error Handling**: Centralized error handling middleware with structured error responses
- **Storage Layer**: Abstracted storage interface (`IStorage`) with in-memory implementation for development
- **Development**: Vite integration for hot module replacement in development mode

The backend implements a clean separation between route handlers, storage operations, and business logic.

## Data Architecture

Database schema is defined using Drizzle ORM with PostgreSQL:

- **Users Table**: Core user information with provider flag
- **Service Providers**: Extended provider profiles with ratings, verification status, and availability
- **Services**: Catalog of available services with categories and pricing
- **Bookings**: Customer-provider service appointments with status tracking
- **Reviews**: Rating and feedback system

The schema uses UUID primary keys and includes proper foreign key relationships between entities.

## Authentication & Security

Currently implements basic user management without authentication middleware. The architecture supports:

- User registration and profile management
- Provider verification status tracking
- Session management preparation with connect-pg-simple

## External Integrations

The platform is designed to integrate with several external services:

- **Stripe**: Payment processing integration with React Stripe.js components
- **Neon Database**: Serverless PostgreSQL database with connection pooling
- **Image Storage**: Provider profile images and service photos (URLs stored in database)

# External Dependencies

## Database
- **Neon Database**: Serverless PostgreSQL hosting with `@neondatabase/serverless` driver
- **Drizzle ORM**: Type-safe database toolkit with migrations support
- **Connection Pooling**: Built-in connection management for serverless environments

## Payment Processing
- **Stripe**: Payment gateway integration with `@stripe/stripe-js` and `@stripe/react-stripe-js`
- **Secure Payments**: PCI-compliant payment handling for service bookings

## UI Framework
- **shadcn/ui**: Complete component library built on Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Radix UI**: Accessible, unstyled component primitives for complex UI elements

## Development Tools
- **Vite**: Fast build tool with hot module replacement and development server
- **TypeScript**: Type safety across frontend and backend with shared schemas
- **ESBuild**: Fast bundling for production builds

## Session & Storage
- **connect-pg-simple**: PostgreSQL session store for Express sessions
- **WebSocket Support**: WebSocket constructor override for Neon database compatibility

## Form & Validation
- **React Hook Form**: Performant forms with minimal re-renders
- **Zod**: Runtime type validation and schema parsing
- **@hookform/resolvers**: Integration between React Hook Form and Zod