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

## Feature Specifications

- **Services**: Supports 8 comprehensive service categories with advanced, multi-step booking workflows (4-5 steps per service). Includes location-based booking and specific requirements for each service (e.g., property size for cleaning, emergency 24/7 for plumbing).
- **Chef & Catering**: Specializes in African cuisine (South African, West African, East African, North African, Central African) with flavor-based preferences, dual menu options (pre-made and custom builders), and real-time pricing.
- **Provider Onboarding**: A 4-step professional application process including mobile camera document capture for ID verification, business documents, banking details, and a 24-48 hour review timeline.
- **Training & Certification**: A comprehensive system for providers including multi-level training modules, progress tracking, service-specific certifications with expiration dates, and skill assessments.
- **Recommendation Engine**: AI-powered service matching based on user preferences, location, ratings, and history, with contextual suggestions and real-time scoring.
- **Dynamic Pricing**: Market-comparable pricing with service-specific surcharges, customizations, and competitive positioning against industry benchmarks.
- **Mobile App Companion**: Complete Progressive Web App implementation with push notifications, offline functionality, service worker caching, PWA manifest, installable mobile experience, and native app features including background sync and notification management.
- **Payment Validation (Step 6 - Nov 2025)**: Comprehensive client-side payment validation with Luhn algorithm card number verification, auto-formatting for card numbers (spaces every 4 digits) and expiry dates (MM/YY), card brand detection (Visa, Mastercard, Amex, Discover), CVV validation (3-4 digits based on card type), bank account validation, real-time error feedback with touched state tracking, and security best practices (no PAN/CVV logging, Stripe integration for actual processing).

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