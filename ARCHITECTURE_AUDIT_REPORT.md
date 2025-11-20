# Berry Events - Comprehensive Architecture Audit Report
**Date:** November 20, 2025  
**Status:** Read-only Analysis - No code changes made

---

## Executive Summary

The Berry Events codebase has grown organically and now requires systematic refactoring to improve maintainability, reduce complexity, and establish clear architectural boundaries. While the application is functional, several critical structural issues create technical debt and make future changes risky.

**Key Metrics:**
- **Frontend Components:** 74 component files (many duplicated/variant)
- **Largest Files:** 
  - `modern-service-modal.tsx`: 4,270 lines
  - `server/storage.ts`: 2,441 lines (143 methods)
  - `server/routes.ts`: 51KB
- **Backend Route Files:** 11 separate route modules
- **Context API Calls:** 13 React Query hooks in contexts (should be 0)

---

## 🔴 CRITICAL ISSUES (Immediate Action Required)

### 1. Monolithic Storage Layer (server/storage.ts)
**Severity:** CRITICAL  
**File:** `server/storage.ts` (2,441 lines, 87KB, 143 methods)

**Problem:**
- Single class handles ALL database operations: users, orders, carts, wallets, notifications, providers, reviews, chat, bookings, gate codes, assessments
- Violates Single Responsibility Principle massively
- Makes transaction safety hard to reason about
- Impossible to test in isolation
- High risk of merge conflicts

**Impact:**
- Every developer must touch the same file
- Transaction boundaries unclear
- Difficult to optimize specific domains
- Testing requires entire database setup

**Recommendation:**
Split into domain-specific repository classes:
```
server/storage/
├── base-storage.ts           # Shared interfaces & transaction helpers
├── user-storage.ts           # Users, authentication, profiles
├── booking-storage.ts        # Bookings, orders, order items
├── cart-storage.ts           # Carts, cart items
├── wallet-storage.ts         # Wallet, transactions
├── provider-storage.ts       # Service providers, verification
├── notification-storage.ts   # Notifications, push notifications
├── review-storage.ts         # Reviews, ratings
├── chat-storage.ts           # Messages, conversations
└── index.ts                  # Export aggregated interface
```

**Effort:** 2-3 days | **Priority:** P0

---

### 2. Massive Service Modal Component
**Severity:** CRITICAL  
**File:** `client/src/components/modern-service-modal.tsx` (4,270 lines)

**Problem:**
- Single component contains 4,270 lines of code
- Mixes UI rendering, form logic, validation, API calls, state management
- Handles ALL service types in one file (cleaning, plumbing, electrical, chef, garden, etc.)
- Impossible to code review effectively
- High coupling between service types

**Impact:**
- Changes to one service affect all others
- Performance issues (entire component re-renders)
- Difficult to maintain and test
- New developers cannot understand flow

**Recommendation:**
Decompose into service-specific modals and shared components:
```
client/src/features/booking/
├── components/
│   ├── booking-steps/
│   │   ├── LocationStep.tsx
│   │   ├── ScheduleStep.tsx
│   │   ├── CustomizationStep.tsx
│   │   └── ReviewStep.tsx
│   ├── service-forms/
│   │   ├── CleaningForm.tsx
│   │   ├── PlumbingForm.tsx
│   │   ├── ChefForm.tsx
│   │   └── ...
│   └── shared/
│       ├── BookingProgressBar.tsx
│       ├── PriceCalculator.tsx
│       └── ProviderSelector.tsx
├── hooks/
│   ├── useBookingFlow.ts
│   └── usePriceEstimation.ts
└── BookingModal.tsx (orchestrator < 200 lines)
```

**Effort:** 3-4 days | **Priority:** P0

---

### 3. Component Explosion & Duplication
**Severity:** CRITICAL  
**Location:** `client/src/components/` (74 files)

**Problem:**
Multiple variants of the same concept with no clear ownership:

**Booking Modals (20+ variants):**
- `advanced-booking-modal.tsx` (976 lines)
- `comprehensive-booking-modal.tsx` (810 lines)
- `enhanced-booking-modal.tsx`
- `quick-booking-modal.tsx`
- `booking-modal.tsx`
- `service-specific-booking.tsx` (1,011 lines)
- `service-specific-booking-backup.tsx` (1,621 lines)
- `service-detail-modal.tsx`
- `service-selection-modal.tsx`
- `enhanced-service-modal.tsx` (944 lines)
- `modern-service-modal.tsx` (4,270 lines)

**Hero Variants:**
- `hero.tsx`
- `enhanced-hero.tsx`
- `minimalist-hero.tsx`

**Services Variants:**
- 48 component files reference "services"
- `services.tsx`
- `enhanced-services.tsx`
- `comprehensive-services.tsx`
- `minimalist-services.tsx`
- `sweepsouth-style-services.tsx`
- `services-showcase.tsx`

**Impact:**
- Unclear which component to use or modify
- Duplication of logic across variants
- Inconsistent user experience
- Wasted bundle size

**Recommendation:**
Consolidate to SINGLE canonical component per concept:
1. **Delete unused variants** - Identify which is actually used in production
2. **Keep ONE booking modal** - Make it configurable via props
3. **Keep ONE hero component** - Use theme variants via props
4. **Keep ONE services component** - Use layout prop for different styles

**Effort:** 4-5 days | **Priority:** P0

---

### 4. Business Logic in UI Components
**Severity:** HIGH  
**Files:** Multiple booking modals, contexts

**Problem:**
- Payment processing logic in React components
- Price calculation in UI layer
- Validation rules scattered across components
- No testable service layer

**Examples:**
```typescript
// IN COMPONENT (BAD):
const calculatePrice = () => {
  let total = basePrice;
  if (addon1) total += 50;
  if (addon2) total += 100;
  // ... 50 more lines
}
```

**Recommendation:**
Extract to testable service modules:
```
client/src/services/
├── booking-service.ts      # Booking business logic
├── pricing-service.ts      # Price calculation rules
├── validation-service.ts   # Validation schemas
└── payment-service.ts      # Payment orchestration
```

**Effort:** 3-4 days | **Priority:** P0

---

## 🟠 HIGH PRIORITY ISSUES

### 5. Routes Mixing Business Logic & HTTP Concerns
**Severity:** HIGH  
**Files:** `server/cart-routes.ts` (16KB), `server/routes.ts` (51KB), etc.

**Problem:**
- Route handlers contain business logic (validation, calculations, orchestration)
- Duplicated validation across routes
- No service layer to enforce business rules
- Difficult to reuse logic (e.g., webhooks need same logic as API routes)

**Current Pattern:**
```typescript
// IN ROUTE (BAD):
app.post("/api/checkout", async (req, res) => {
  // Validation logic
  const { items, paymentMethod } = req.body;
  if (!items || items.length === 0) return res.status(400);
  
  // Business logic
  const total = items.reduce((sum, item) => sum + item.price, 0);
  const commission = total * 0.15;
  
  // Database calls
  const order = await storage.createOrder(...);
  await storage.processPayment(...);
  
  res.json(order);
});
```

**Recommended Pattern:**
```typescript
// services/booking-service.ts
class BookingService {
  async checkout(userId: string, items: CartItem[], paymentMethod: string) {
    this.validateCheckout(items); // Centralized validation
    const pricing = this.calculatePricing(items); // Centralized calculation
    return await this.createOrderWithPayment(userId, items, paymentMethod, pricing);
  }
}

// routes/booking-routes.ts (THIN)
app.post("/api/checkout", authenticateToken, async (req, res) => {
  const result = await bookingService.checkout(req.user.id, req.body.items, req.body.paymentMethod);
  res.json(result);
});
```

**Effort:** 4-5 days | **Priority:** P1

---

### 6. Schema Duplication & Drift Risk
**Severity:** HIGH  
**Files:** `shared/schema.ts`, `shared/admin-schema.ts`

**Problem:**
- Two separate schema files with overlapping concerns
- Admin schema duplicates user models
- Risk of divergence between admin and user views
- Unclear source of truth

**Recommendation:**
Consolidate schemas with role-based views:
```
shared/
├── schema.ts              # All database schemas
├── types/
│   ├── user-types.ts      # User-facing types
│   ├── admin-types.ts     # Admin-facing types (extends base)
│   └── api-types.ts       # API DTOs
└── validation/
    ├── user-schemas.ts    # Zod schemas for users
    └── admin-schemas.ts   # Zod schemas for admins
```

**Effort:** 1-2 days | **Priority:** P1

---

### 7. Contexts Mixing Network & State Concerns
**Severity:** HIGH  
**Files:** `client/src/contexts/CartContext.tsx`, `client/src/contexts/AuthContext.tsx`

**Problem:**
- Contexts contain 13 React Query hooks (useQuery/useMutation)
- Mixing server state (React Query) with client state (Context)
- Re-renders propagate unnecessarily
- Caching logic duplicated

**Current Pattern (BAD):**
```typescript
// CartContext.tsx
const CartProvider = ({ children }) => {
  const { data: cart } = useQuery({ queryKey: ['/api/cart'] }); // Should NOT be here
  const addMutation = useMutation(...); // Should NOT be here
  
  return <CartContext.Provider value={{ cart, addToCart: addMutation.mutate }}>
    {children}
  </CartContext.Provider>
};
```

**Recommended Pattern:**
```typescript
// hooks/use-cart.ts (React Query hook)
export const useCart = () => {
  return useQuery({ queryKey: ['/api/cart'], ... });
};

// contexts/CartContext.tsx (UI state only)
const CartProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  
  return <CartContext.Provider value={{ isOpen, setIsOpen, selectedItems }}>
    {children}
  </CartContext.Provider>
};

// In components:
const { data: cart } = useCart(); // React Query
const { isOpen, setIsOpen } = useCartUI(); // Context
```

**Effort:** 2-3 days | **Priority:** P1

---

## 🟡 MEDIUM PRIORITY ISSUES

### 8. Configuration Scatter
**Severity:** MEDIUM  
**Files:** `client/src/config/`, `config/`, inline configs

**Problem:**
- Pricing config in `client/src/config/gardenPricing.ts`, `client/src/config/poolPricing.ts`
- Estimation config in `config/estimates.ts`
- Add-ons in `config/addons.json` and `config/addons.ts`
- Bank data in `config/banks.ts`
- Some configs hardcoded in components

**Recommendation:**
Centralize all configuration:
```
shared/config/
├── pricing/
│   ├── services.ts        # All service pricing
│   ├── addons.ts          # All add-on pricing
│   └── estimates.ts       # Time estimates
├── constants/
│   ├── banks.ts
│   ├── regions.ts
│   └── categories.ts
└── index.ts               # Single import point
```

**Effort:** 1-2 days | **Priority:** P2

---

### 9. Large Page Components
**Severity:** MEDIUM  
**Files:**
- `client/src/pages/admin-portal.tsx` (1,012 lines)
- `client/src/pages/profile.tsx` (922 lines)
- `client/src/pages/enhanced-provider-onboarding.tsx` (894 lines)
- `client/src/pages/bookings.tsx` (806 lines)

**Problem:**
- Page components doing too much
- Mixing layout, data fetching, business logic
- Difficult to navigate and maintain

**Recommendation:**
Extract reusable features:
```
client/src/features/
├── admin/
│   ├── components/
│   │   ├── UserManagementTable.tsx
│   │   ├── ProviderVerification.tsx
│   │   └── Analytics Dashboard.tsx
│   ├── hooks/
│   │   └── use-admin-data.ts
│   └── AdminPortalPage.tsx (< 200 lines)
├── profile/
│   ├── components/
│   │   ├── ProfileForm.tsx
│   │   ├── BookingHistory.tsx
│   │   └── PreferenceSettings.tsx
│   └── ProfilePage.tsx (< 200 lines)
└── ...
```

**Effort:** 3-4 days | **Priority:** P2

---

### 10. Utility Libraries Without Types/Tests
**Severity:** MEDIUM  
**Files:** `client/src/lib/*`

**Problem:**
- Domain logic in utility files (paymentAggregator, pdfGenerator, schedulingUtils)
- No unit tests
- Missing or weak TypeScript types
- Difficult to verify correctness

**Recommendation:**
1. Add comprehensive TypeScript types
2. Write unit tests (Jest/Vitest)
3. Extract to proper service modules where appropriate

**Effort:** 2-3 days | **Priority:** P2

---

### 11. Route File Fragmentation
**Severity:** MEDIUM  
**Files:** 11 separate route files in `server/`

**Problem:**
- `server/auth-routes.ts` (45KB)
- `server/routes.ts` (51KB) - "main" routes but unclear purpose
- `server/cart-routes.ts` (17KB)
- `server/training-routes.ts` (13KB)
- `server/support-routes.ts` (11KB)
- `server/customer-review-routes.ts` (11KB)
- `server/push-notification-routes.ts` (6KB)
- `server/payment-routes.ts` (5.1KB)
- `server/notification-routes.ts` (2.7KB)
- `server/chat-routes.ts` (3.3KB)

**Issues:**
- No consistent organization pattern
- Unclear what goes in `routes.ts` vs dedicated files
- Middleware duplication

**Recommendation:**
Standardize route organization with domain pattern:
```
server/routes/
├── index.ts               # Route aggregator
├── auth.routes.ts
├── booking.routes.ts      # Combine cart + orders
├── provider.routes.ts     # Combine provider + training
├── payment.routes.ts
├── notification.routes.ts
├── chat.routes.ts
└── admin.routes.ts
```

**Effort:** 1-2 days | **Priority:** P2

---

## 🟢 OPTIONAL ENHANCEMENTS

### 12. Naming Consistency
**Severity:** LOW  
**Location:** Multiple files

**Problem:**
- Inconsistent naming: "booking" vs "order"
- "service-modal" vs "booking-modal" vs "service-specific-booking"
- "enhanced-" prefix overused

**Recommendation:**
Establish naming conventions:
- Use "booking" for customer-facing features
- Use "order" for backend/admin
- Avoid vague prefixes like "enhanced", "comprehensive", "advanced"

**Effort:** 1 day | **Priority:** P3

---

### 13. Missing Architecture Documentation
**Severity:** LOW  

**Problem:**
- No architecture decision records (ADRs)
- No module boundary documentation
- New developers must reverse-engineer structure

**Recommendation:**
Create documentation:
- `docs/ARCHITECTURE.md` - System overview
- `docs/FEATURE_MODULES.md` - Feature boundaries
- `docs/DATA_FLOW.md` - How data moves through app
- ADRs for major decisions

**Effort:** 2-3 days | **Priority:** P3

---

### 14. Lint Rules for Component Creation
**Severity:** LOW  

**Problem:**
- No automated prevention of duplicate components
- No warnings for large files
- No enforcement of structure

**Recommendation:**
Add ESLint rules:
- Max file length (500 lines warning, 1000 error)
- Restrict component directory (enforce feature folders)
- Naming conventions

**Effort:** 1 day | **Priority:** P3

---

## 📊 Recommended Implementation Plan

### Phase 1: Critical Foundations (Week 1-2)
**Goal:** Eliminate critical blockers

1. ✅ **Decompose modern-service-modal.tsx** (4,270 lines → modular structure)
   - Extract service-specific forms
   - Create shared step components
   - Build thin orchestrator
   - **Impact:** Immediate maintainability improvement

2. ✅ **Split storage.ts into domain repositories**
   - Start with wallet, cart, booking (most active)
   - Maintain backward compatibility with facade
   - **Impact:** Reduced merge conflicts, clearer transaction boundaries

3. ✅ **Consolidate booking modal variants** (20+ files → 1-3 canonical)
   - Audit which are actually used
   - Delete unused variants
   - Create configurable canonical component
   - **Impact:** -70% component count, bundle size reduction

### Phase 2: Business Logic Extraction (Week 3)
**Goal:** Separate concerns properly

4. ✅ **Create service layer** (extract from routes)
   - booking-service.ts
   - pricing-service.ts
   - payment-service.ts
   - **Impact:** Testable business logic, reusable across routes/webhooks

5. ✅ **Refactor contexts** (remove React Query from contexts)
   - Move to custom hooks
   - Keep contexts for UI state only
   - **Impact:** Better performance, clearer data flow

### Phase 3: Organization & Standards (Week 4)
**Goal:** Long-term maintainability

6. ✅ **Consolidate schemas** (2 files → 1 with organized structure)
   - **Impact:** Single source of truth

7. ✅ **Centralize configuration** (scattered → shared/config/)
   - **Impact:** Easier to update pricing/settings

8. ✅ **Decompose large page components**
   - **Impact:** Better code navigation

### Phase 4: Quality & Documentation (Week 5)
**Goal:** Prevent regression

9. ✅ **Add unit tests for services**
   - **Impact:** Confidence in refactoring

10. ✅ **Create architecture documentation**
    - **Impact:** Onboarding speed

11. ✅ **Add lint rules**
    - **Impact:** Prevent future sprawl

---

## 🎯 Success Metrics

Track progress with these metrics:

| Metric | Current | Target | Phase |
|--------|---------|--------|-------|
| Largest component | 4,270 lines | < 500 lines | Phase 1 |
| Storage methods | 143 methods | < 30 per file | Phase 1 |
| Booking modal variants | 20+ files | 1-3 files | Phase 1 |
| Lines of business logic in routes | High | < 50 per route | Phase 2 |
| React Query in contexts | 13 instances | 0 instances | Phase 2 |
| Config file locations | 3+ directories | 1 directory | Phase 3 |
| Test coverage for services | 0% | > 80% | Phase 4 |
| Architecture docs | 0 pages | 4+ pages | Phase 4 |

---

## ⚠️ Risk Assessment

### Low Risk Refactors (Start Here):
- Configuration consolidation
- Schema consolidation
- Documentation addition
- Lint rule addition

### Medium Risk Refactors (Test Thoroughly):
- Component consolidation (may affect UI)
- Context refactoring (affects many consumers)
- Page component decomposition

### High Risk Refactors (Require Extensive Testing):
- Storage layer splitting (affects all database operations)
- Service layer extraction (changes request flow)
- Modal decomposition (complex state management)

**Recommendation:** Start with low-risk items to build confidence, then tackle high-risk items with comprehensive testing.

---

## 🔧 Technical Debt Estimate

| Category | Debt Level | Effort to Resolve | Priority |
|----------|------------|-------------------|----------|
| Component duplication | Very High | 4-5 days | Critical |
| Monolithic storage | Very High | 2-3 days | Critical |
| Massive modal | Critical | 3-4 days | Critical |
| Business logic in UI | High | 3-4 days | High |
| Route organization | Medium | 1-2 days | Medium |
| Config scatter | Medium | 1-2 days | Medium |
| Missing tests | High | 2-3 days | Medium |
| Documentation | Low | 2-3 days | Low |

**Total Estimated Effort:** 4-5 weeks (1 developer)  
**Recommended Team Size:** 2 developers (reduce to 2.5-3 weeks)

---

## 📋 Next Steps

1. **Review this audit** with the team
2. **Prioritize phases** based on current sprint goals
3. **Create tracking tickets** for each item
4. **Assign owners** to each phase
5. **Set up testing environment** for validation
6. **Begin Phase 1** with storage splitting

---

## Conclusion

The Berry Events codebase is functional but has accumulated significant technical debt through organic growth. The most critical issues are:

1. **Component duplication** (20+ booking modals)
2. **Monolithic files** (4,270-line modal, 2,441-line storage)
3. **Mixed concerns** (business logic in UI, network in contexts)

These issues are **fixable** with systematic refactoring over 4-5 weeks. The recommended phased approach minimizes risk while delivering incremental improvements.

**Key Success Factor:** Resist the temptation to add new "enhanced" or "comprehensive" variants. Instead, make existing components configurable through props and feature flags.

---

**Report Generated:** November 20, 2025  
**Auditor:** Architecture Review Team  
**Status:** Ready for Team Review & Planning
