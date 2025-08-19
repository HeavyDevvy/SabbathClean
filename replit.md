# Overview

Berry Events - All your Home Services In One is a comprehensive domestic services marketplace platform that connects customers with verified service providers for house cleaning, plumbing, electrical work, chef/catering, waitering, and garden care services. The platform features a React frontend with shadcn/ui components, an Express.js backend with REST API endpoints, and PostgreSQL database using Drizzle ORM. The application supports service booking with geolocation functionality, provider matching, reviews, and payment processing with Stripe integration using South African Rand (ZAR) currency.

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