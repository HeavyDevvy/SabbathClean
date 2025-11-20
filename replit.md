# Overview

Berry Events is a premium domestic services marketplace in South Africa, connecting customers with verified providers for home services like cleaning, plumbing, electrical, chef/catering, and garden care. The platform emphasizes quality, security, dynamic pricing, advanced geolocation-based booking, AI-driven provider matching, interactive onboarding, and secure Stripe payments routed through "Berry Events Bank." It operates as a comprehensive Progressive Web App (PWA) with mobile-native capabilities, offering specialized services like African cuisine.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## UI/UX Decisions
The design adopts a minimalistic approach with clean layouts, simplified user flows, and reduced visual clutter, inspired by platforms like SweepSouth. It incorporates a complete Berry Events brand color system using semantic Tailwind classes for consistent styling, with header elements designed for visual harmony and mobile optimization.

## Technical Implementations
- **Frontend**: Built with React 18 and TypeScript, utilizing a component-based architecture with shadcn/ui and Tailwind CSS. Wouter handles lazy-loaded routing, TanStack Query manages server state with optimized caching, and React Hook Form with Zod handles form validation. Centralized AuthProvider and CartProvider prevent duplicate API calls.
- **Backend**: An Express.js application in TypeScript, providing a RESTful API with clear separation of concerns between route handlers, storage, and business logic.
- **Data**: PostgreSQL database with Drizzle ORM. Key entities include Users, Service Providers, Services, Bookings, and Reviews, with UUID primary keys and proper relationships. Optimized with indexes on frequently-queried columns for sub-second query performance.
- **Authentication & Security**: Designed for secure session handling with basic user management and provider verification tracking. All payments are processed through Berry Events Bank with escrow-like protection.
- **Performance Optimizations**: Implemented database indexing, lazy loading for frontend routes, centralized authentication context, and aggressive caching strategies to significantly reduce load times and API response times. Image assets are optimized to WebP format, reducing total image size by 97.8%.
- **Architectural Refactoring**: Ongoing effort to reduce technical debt, including modularization of the storage layer into domain-specific modules and consolidation of redundant modal components. A clear strategy for decomposing monolithic components has been defined, utilizing composition over inheritance, gradual migration, and a hooks-first approach.

## Feature Specifications
- **Services**: Supports 8 service categories with a 4-step, location-based booking workflow and a cart system for booking up to 3 services simultaneously. Includes specialized Chef & Catering services with African cuisine focus and real-time pricing.
- **Provider Management**: Features a 4-step onboarding process with verification, banking details capture, multi-level training, and skill assessments.
- **Recommendation Engine**: AI-powered service matching based on user preferences, location, ratings, and history.
- **Dynamic Pricing**: Market-comparable pricing with service-specific surcharges.
- **Mobile App Companion**: PWA offering push notifications, offline functionality, and an installable mobile experience.
- **Payment Validation**: Client-side validation for card numbers, expiry dates, CVV, and bank accounts.
- **PDF Receipt Generation**: Branded PDF receipts for booking confirmations.
- **Currency Handling**: Centralized utilities for consistent currency formatting.
- **Booking Management Suite**: Features to reschedule, cancel, re-book, share, and view receipts for bookings.
- **Real-Time Chat System**: WebSocket-based messaging between customers and service providers per booking.
- **Real-Time Notifications System**: Secure, authentication-protected notifications for booking updates, payments, messages, and reviews.
- **Customizable User Profiles**: Users can select preferred services and save favorite providers.
- **Dynamic Time Estimation**: Intelligent service duration calculation based on base times and add-on logic.

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

# Recent Architecture Improvements

## Phase 4: Location & Review Step Extraction (November 2025)

### Objective
Extract common location fields (Step 1) and complete provider review workflow (Step 4) to further reduce modal complexity and improve code organization.

### Completed Work

#### 1. LocationStep Component (Step 1 Common Fields)
- **File**: `client/src/components/booking-steps/LocationStep.tsx` (93 lines)
- **Extracted logic**:
  - Property Type selection (all services)
  - Service Address input with 20km radius confirmation
  - Gate/Access Code input (conditional on property type: apartment, townhouse, villa)
  - Encrypted gate code security messaging
- **Props interface**: formData, setFormData, currentConfig, handleAddressChange

#### 2. ReviewStep Component (Step 4 Complete)
- **File**: `client/src/components/booking-steps/ReviewStep.tsx` (355 lines)
- **Extracted logic**:
  - **Berry Star pre-selected provider flow**: Locked provider card with star branding, pre-selection notice
  - **Normal provider selection**: Card-based provider list with enhanced details (profile image, bio, jobs completed, experience, qualifications, specializations, availability)
  - **Tip selection**: Preset amounts (R0, R20, R50, R100) + custom input with validation
  - **Booked services counter**: Display already-booked services in multi-service cart
- **Props interface**: formData, setFormData, providers, preSelectedProviderId/Name, showEnhancedProviderDetails, isHouseCleaning, bookedServices, setProviderDetailsModal
- **Critical fix**: Moved Berry Star provider initialization to useEffect to prevent React state mutation during render

### Integration
- LocationStep integrated into renderStep1()
- ReviewStep integrated into renderStep4()
- All data flows preserved through explicit props
- All data-testids maintained for testing
- React best practices enforced (no render-time state mutations)

### Impact
- **Modal size**: 3,558 → 3,268 lines (-290 lines, 8.2% reduction in Phase 4)
- **Step components created**: 2 files, 448 total lines (93 + 355)
- **Cumulative modal reduction (Phases 2-4)**: 4,270 → 3,268 lines (-1,002 lines, 23.5%)

### Quality
- ✅ Architect-reviewed and approved
- ✅ React render bug fixed (useEffect for Berry Star initialization)
- ✅ Application running without errors
- ✅ All functionality preserved (normal + Berry Star flows)

## Phase 3: Shared Step Component Extraction (November 2025)

### Objective
Extract shared booking workflow steps (Schedule, AddOns) from the monolithic `modern-service-modal.tsx` to improve maintainability and establish reusable step components for the 4-step booking flow.

### Completed Work

#### 1. ScheduleStep Component (Step 2)
- **File**: `client/src/components/booking-steps/ScheduleStep.tsx` (282 lines)
- **Extracted logic**:
  - Date selection with service-specific minimum notice requirements (24hrs for Chef/Garden)
  - Time preference with intelligent past-time filtering and 24-hour notice validation
  - Recurring schedule options with automatic discount messaging
  - Materials & equipment supplier selection with pricing adjustments
  - Service-specific insurance checkboxes (Plumbing, Electrical)
- **Props interface**: Clean separation with formData, setFormData, service-type flags, and computed values

#### 2. AddOnsStep Component (Step 3)
- **File**: `client/src/components/booking-steps/AddOnsStep.tsx` (241 lines)
- **Extracted logic**:
  - Comments/additional details textarea with smart placeholder
  - Keyword-based smart add-on suggestions (AI-powered)
  - Add-ons dropdown with multi-selection capability
  - Selected add-ons display with inline removal
  - Estimated hours calculation and display
  - "Add Another Service" button for multi-service cart bookings
- **Props interface**: All dependencies cleanly passed (formData, pricing, callbacks, config)

### Integration
- Both components integrated via renderStep2() and renderStep3()
- All data flows preserved through explicit props
- All data-testids maintained for testing
- Zero functional regressions

### Impact
- **Modal size**: 4,026 → 3,611 lines (-415 lines, 10.3% reduction)
- **Step components created**: 2 files, 523 total lines (282 + 241)
- **Modularity**: Shared steps now reusable across booking flows
- **Maintainability**: Each step isolated with clear interfaces

### Quality
- ✅ Architect-reviewed and approved
- ✅ All functionality preserved
- ✅ Application running without errors
- ✅ Clean prop interfaces

### Remaining Opportunities
- **LocationStep** (Step 1): Property type, address, gate code fields can be extracted
- **ReviewStep** (Step 4): Provider selection and payment review can be componentized
- Further decomposition would reduce modal to <3,000 lines

## Phase 2: Image Optimization & Service Form Extraction (November 2025)

### 1. Image Optimization
- Optimized 22 images: 140.47MB → 3.04MB (97.8% reduction)
- Format: WebP (85% quality, 1920px max width)
- Updated 3 components with optimized assets
- Browser support: 97%+

### 2. Service Form Extraction
- Extracted 5 service-specific forms from Step 1:
  - CleaningServiceForm (60 lines)
  - GardenServiceForm (58 lines)
  - PoolServiceForm (58 lines)
  - PlumbingServiceForm (119 lines)
  - ElectricalServiceForm (129 lines)
- Modal reduced: 4,270 → 4,026 lines (-244 lines)
- Total forms: 424 lines across 5 modular components

## Phase 1: Storage Modularization & Modal Consolidation (November 2025)

### Storage Modularization
- Created 4 domain-specific storage modules
- Fixed critical CartStorage bug affecting guest carts
- Net reduction: ~6,950 lines (29% cleaner codebase)

### Modal Consolidation
- Deleted 9 unused booking modals (~7,165 lines)
- Consolidated to single `modern-service-modal.tsx`
- Zero production functionality impact

## Overall Architecture Progress
- **Total modal reduction**: 4,270 → 3,268 lines (-1,002 lines, 23.5%)
- **Components created**: 7 service forms + 4 step components (1,395 lines)
- **Images optimized**: 97.8% size reduction (140MB → 3MB)
- **Code quality**: Modular, maintainable, architect-approved

# Known Issues

## Development Environment
- **Vite HMR WebSocket Error**: Browser console shows `Failed to construct 'WebSocket': The URL 'wss://localhost:undefined/?token=...' is invalid.` This is a development-only Vite HMR configuration issue that does not affect application functionality. Hot module replacement still works correctly, and the app loads and runs without any functional impact.