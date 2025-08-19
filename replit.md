# Overview

Berry Events - All your Home Services In One is a comprehensive domestic services marketplace platform that connects customers with verified service providers for house cleaning, plumbing, electrical work, chef/catering, waitering, and garden care services. The platform features a React frontend with shadcn/ui components, an Express.js backend with REST API endpoints, and PostgreSQL database using Drizzle ORM. The application supports service booking with geolocation functionality, provider matching, reviews, and payment processing with Stripe integration using South African Rand (ZAR) currency.

## Recent Changes (August 2025)

✓ **Uber-Style Location Matching**: Implemented sophisticated location-based provider allocation system:
  - Real-time geolocation detection with fallback options
  - Radius-based provider matching (default 20km)
  - Distance calculation using Haversine formula
  - Combined scoring algorithm (70% rating, 30% distance proximity)
  
✓ **Enhanced Rating System**: Comprehensive multi-aspect review functionality:
  - 5-star overall rating with detailed breakdowns
  - Service quality, punctuality, and professionalism ratings
  - Written reviews with recommendation system
  - Real-time provider rating updates
  
✓ **Advanced Payment Integration**: Complete payment method management system:
  - Multiple payment options (cards, bank transfer, cash)
  - Secure card storage with masked display
  - Card type detection (Visa, Mastercard, Amex)
  - Default payment method selection
  
✓ **Smart Job Queue System**: Automatic provider allocation infrastructure:
  - Queue-based job processing with priority levels
  - 30-minute automatic expiration for unassigned jobs
  - Provider online/offline status tracking
  - Location updates for real-time matching
  
✓ **Enhanced Booking Flow**: Complete 3-step booking experience:
  - Service details collection with location detection
  - Nearby provider selection with distance display
  - Payment method selection and booking confirmation

✓ **Interactive Workflow Demonstration**: Engaging service preview system:
  - Chef & Catering focused 3-step booking demonstration (Service Selection → Cuisine Selection → Chef Matching)
  - Real-time progress tracking with authentic provider data and pricing
  - Integrated "Watch How It Works" button with smooth scroll navigation
  - Simplified demo experience focused exclusively on Chef & Catering service

✓ **Enhanced Provider Onboarding**: Professional application system with mobile optimization:
  - Mobile camera document capture for ID verification and certificates
  - Smart device detection with context-appropriate upload options
  - Complete application submission workflow with 24-48 hour review timeline
  - Post-submission success screen with detailed next steps and contact information
  - Email and SMS notification integration for application status updates

✓ **Enhanced Booking Navigation**: Seamless service selection flow:
  - "Book Service Now" button navigates to dedicated `/booking` page
  - Comprehensive service portal with 6 service cards (Chef & Catering, House Cleaning, Plumbing, Electrical, Garden Care, Home Moving)
  - Visual service cards with icons, pricing, badges, and hover animations
  - Click-to-book functionality opens service-specific booking modals
  - Complete brand consistency with "Berry Events" throughout platform

✓ **Database Storage Implementation**: Production-ready data persistence (August 2025):
  - Switched from in-memory storage to PostgreSQL database using Drizzle ORM
  - DatabaseStorage class implementing full CRUD operations for all entities
  - Service provider registration details stored in database tables
  - Optimized query performance with proper indexing and caching

✓ **Enhanced Chef & Catering Experience**: Comprehensive cuisine and menu system:
  - Advanced cuisine selection: South African Traditional, Nigerian, Ethiopian, Moroccan + international options
  - Flavor-based preference system (Smoky BBQ, Spicy Peri-Peri, Aromatic Herbs, Complex Spices)
  - Dual menu options: Popular pre-made menus with authentic dishes and pricing
  - Custom menu builder with selectable items and add/remove functionality
  - Real-time pricing calculations based on selected items and guest count
  - Enhanced booking component with step-by-step cuisine customization

✓ **Performance Optimizations**: Faster user experience:
  - Reduced service card transition animations from 300ms to 200ms
  - Added staleTime and cacheTime for React Query to prevent unnecessary API calls
  - Optimized database queries with proper indexing and connection pooling

✓ **Comprehensive Training & Certification System**: Complete provider development infrastructure (August 2025):
  - **Training Modules**: Multi-level courses with video content, interactive exercises, quizzes, and practical assignments
  - **Progress Tracking**: Real-time monitoring of completion percentages, time spent, last accessed dates, and performance scores
  - **Certification Framework**: Service-specific certifications with earned status, expiration dates, and verification codes
  - **Skill Assessments**: Quiz, practical, and portfolio-based evaluations with automated scoring and feedback
  - **Database Integration**: Full PostgreSQL schema with 6 new tables for comprehensive training data management
  - **API Infrastructure**: Complete REST endpoints for training modules, progress tracking, certifications, and assessments
  - **Provider Development**: Structured pathway from basic training to expert certification across all service categories

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