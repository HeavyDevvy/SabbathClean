# Modern Service Modal Decomposition Plan
**Date:** November 20, 2025  
**Target:** Reduce 4,270-line monolithic component to modular structure (<500 lines orchestrator)

---

## Current Structure Analysis

**File:** `client/src/components/modern-service-modal.tsx`  
**Lines:** 4,270  
**Steps:** 5-step booking wizard (renderStep1-5)  
**Services Supported:**
- House Cleaning
- Plumbing
- Electrical
- Garden Care/Maintenance
- Chef & Catering

**Key Problems:**
1. ❌ All service-specific forms embedded in one file
2. ❌ Pricing logic scattered throughout component
3. ❌ No reusable step components
4. ❌ State management deeply coupled
5. ❌ Validation logic inline with UI
6. ❌ ~677 lines per step on average
7. ❌ Difficult to test individual services
8. ❌ High cognitive load for developers

---

## Decomposition Strategy

### Phase 1: Extract Service-Specific Forms (Lines 2077-2753)

Create `/client/src/components/booking-forms/` directory with:

**1. CleaningServiceForm.tsx** (~300 lines)
- Cleaning type selection (basic, deep, move-in, spring)
- Property size selection
- Room count
- Pool cleaning option
- Bedrooms/bathrooms
- Add-ons specific to cleaning

**2. PlumbingServiceForm.tsx** (~200 lines)
- Plumbing issue selector (leaks, installation, emergency, etc.)
- Urgency indicator
- Location of issue
- Description field
- Plumbing-specific add-ons

**3. ElectricalServiceForm.tsx** (~200 lines)
- Electrical issue selector (power outage, wiring, panel, etc.)
- Urgency indicator
- Safety priority toggle
- Description field
- Electrical-specific add-ons

**4. GardenServiceForm.tsx** (~250 lines)
- Garden size selector (small, medium, large, extra-large)
- Garden condition (well-maintained, moderate, overgrown)
- Garden type (lawn, flower beds, vegetable, mixed)
- Service frequency
- Garden-specific add-ons

**5. ChefServiceForm.tsx** (~400 lines)
- Number of guests
- Event type (casual, formal, etc.)
- Cuisine preferences (African, continental, etc.)
- Dietary restrictions
- Menu options (standard/premium)
- Chef-specific add-ons

**Total Lines Extracted:** ~1,350 lines  
**Remaining in Modal:** ~2,920 lines

---

### Phase 2: Extract Shared Step Components (Lines 2754-3162)

Create `/client/src/components/booking-steps/` directory with:

**1. LocationStep.tsx** (~300 lines)
- Address input with autocomplete
- Gate code field (encrypted)
- Location verification
- Access instructions
- Reusable across all services

**2. ScheduleStep.tsx** (~350 lines)
- Date picker
- Time slot selector
- Recurring schedule option (weekly/bi-weekly/monthly)
- Availability checking
- Service duration display

**3. AddOnsStep.tsx** (~250 lines)
- Dynamic add-ons based on service
- Suggested add-ons logic
- Tip amount selector (for cleaning)
- Add-on pricing display

**4. ReviewStep.tsx** (~400 lines)
- Service summary
- Provider selection (if applicable)
- Price breakdown
- Special instructions
- Payment method preview
- Confirmation CTA

**Total Lines Extracted:** ~1,300 lines  
**Remaining in Modal:** ~1,620 lines

---

### Phase 3: Extract Business Logic Hooks

Create `/client/src/hooks/booking/` directory with:

**1. useBookingFlow.ts** (~150 lines)
```typescript
export function useBookingFlow(serviceId: string) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({...});
  
  const nextStep = () => { /* validation + navigation */ };
  const prevStep = () => { /* go back */ };
  const resetFlow = () => { /* clear state */ };
  
  return { step, formData, nextStep, prevStep, resetFlow, updateFormData };
}
```

**2. usePriceEstimation.ts** (~200 lines)
```typescript
export function usePriceEstimation(serviceId: string, formData: any) {
  const basePrice = useMemo(() => {
    // Service-specific base price logic
  }, [serviceId, formData]);
  
  const estimatedHours = useMemo(() => {
    // Calculate from config/estimates.ts
  }, [serviceId, formData]);
  
  const totalPrice = useMemo(() => {
    // Base + add-ons + tips + commission
  }, [basePrice, formData.selectedAddOns, formData.tip]);
  
  return { basePrice, estimatedHours, totalPrice, priceBreakdown };
}
```

**3. useServiceValidation.ts** (~100 lines)
```typescript
export function useServiceValidation(serviceId: string, formData: any, step: number) {
  const errors = useMemo(() => {
    // Step-specific validation
    // Service-specific validation
  }, [serviceId, formData, step]);
  
  const canProceed = !errors.length;
  
  return { errors, canProceed, validateStep };
}
```

**4. useAddOnSuggestions.ts** (~80 lines)
```typescript
export function useAddOnSuggestions(serviceId: string, formData: any) {
  const suggestedAddOns = useMemo(() => {
    // Call suggestAddOns from config/addons.ts
  }, [serviceId, formData]);
  
  return { suggestedAddOns };
}
```

**Total Lines Extracted:** ~530 lines  
**Remaining in Modal:** ~1,090 lines

---

### Phase 4: Create Thin Orchestrator Component

**New ModernServiceModal.tsx** (~400 lines)

```typescript
export default function ModernServiceModal({
  isOpen,
  onClose,
  preSelectedService,
  preSelectedProvider,
  editBookingData
}: ModernServiceModalProps) {
  // Use hooks for business logic
  const { step, formData, nextStep, prevStep, updateFormData } = useBookingFlow(serviceId);
  const { totalPrice, estimatedHours, priceBreakdown } = usePriceEstimation(serviceId, formData);
  const { errors, canProceed } = useServiceValidation(serviceId, formData, step);
  const { suggestedAddOns } = useAddOnSuggestions(serviceId, formData);
  
  // Render appropriate service form
  const renderServiceForm = () => {
    switch (serviceId) {
      case 'house-cleaning': return <CleaningServiceForm {...props} />;
      case 'plumbing': return <PlumbingServiceForm {...props} />;
      case 'electrical': return <ElectricalServiceForm {...props} />;
      case 'garden-care': return <GardenServiceForm {...props} />;
      case 'chef-catering': return <ChefServiceForm {...props} />;
      default: return null;
    }
  };
  
  // Render appropriate step
  const renderStep = () => {
    switch (step) {
      case 1: return renderServiceForm();
      case 2: return <LocationStep {...props} />;
      case 3: return <ScheduleStep {...props} />;
      case 4: return <AddOnsStep {...props} />;
      case 5: return <ReviewStep {...props} />;
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        {/* Progress indicator */}
        {/* Step content */}
        {renderStep()}
        {/* Navigation buttons */}
      </DialogContent>
    </Dialog>
  );
}
```

**Total Lines:** ~400 lines  
**Reduction:** 4,270 → 400 lines (90% reduction)

---

## Shared Configuration (Keep in place)

These files remain unchanged:
- ✅ `config/addons.ts` - Service add-ons configuration
- ✅ `config/estimates.ts` - Time estimation logic
- ✅ `config/banks.ts` - Bank validation
- ✅ `contexts/CartContext.tsx` - Cart state management

---

## File Structure After Refactoring

```
client/src/
├── components/
│   ├── booking-forms/
│   │   ├── CleaningServiceForm.tsx      (300 lines)
│   │   ├── PlumbingServiceForm.tsx      (200 lines)
│   │   ├── ElectricalServiceForm.tsx    (200 lines)
│   │   ├── GardenServiceForm.tsx        (250 lines)
│   │   └── ChefServiceForm.tsx          (400 lines)
│   ├── booking-steps/
│   │   ├── LocationStep.tsx             (300 lines)
│   │   ├── ScheduleStep.tsx             (350 lines)
│   │   ├── AddOnsStep.tsx               (250 lines)
│   │   └── ReviewStep.tsx               (400 lines)
│   ├── modern-service-modal.tsx         (400 lines) ⬅️ NEW
│   └── booking-confirmation-modal.tsx   (kept)
├── hooks/
│   └── booking/
│       ├── useBookingFlow.ts            (150 lines)
│       ├── usePriceEstimation.ts        (200 lines)
│       ├── useServiceValidation.ts      (100 lines)
│       └── useAddOnSuggestions.ts       (80 lines)
└── config/
    ├── addons.ts                        (existing)
    ├── estimates.ts                     (existing)
    └── banks.ts                         (existing)
```

---

## Benefits

**Code Organization:**
- ✅ Each service form is self-contained
- ✅ Shared steps are reusable
- ✅ Business logic separated from UI
- ✅ Easy to test individual components

**Maintainability:**
- ✅ Add new service = create new form component
- ✅ Modify service = edit one file
- ✅ No 4,000+ line file to navigate

**Performance:**
- ✅ Can lazy-load service-specific forms
- ✅ Smaller bundle chunks
- ✅ Faster compile times

**Developer Experience:**
- ✅ Clear component boundaries
- ✅ Easier code reviews
- ✅ Lower cognitive load
- ✅ Better IDE performance

---

## Migration Strategy

### Step 1: Create Directory Structure
```bash
mkdir -p client/src/components/booking-forms
mkdir -p client/src/components/booking-steps
mkdir -p client/src/hooks/booking
```

### Step 2: Extract Service Forms (One at a time)
1. Extract CleaningServiceForm.tsx
2. Test cleaning bookings still work
3. Extract PlumbingServiceForm.tsx
4. Test plumbing bookings still work
5. Continue for each service...

### Step 3: Extract Shared Steps
1. Extract LocationStep.tsx
2. Test all services with new LocationStep
3. Extract ScheduleStep.tsx
4. Test scheduling across services
5. Continue for each step...

### Step 4: Extract Business Logic Hooks
1. Create useBookingFlow.ts
2. Create usePriceEstimation.ts
3. Create useServiceValidation.ts
4. Create useAddOnSuggestions.ts

### Step 5: Build New Orchestrator
1. Create new ModernServiceModal.tsx using hooks
2. Wire up service form routing
3. Wire up step routing
4. Test complete booking flow

### Step 6: Delete Old File
1. Verify all services work with new structure
2. Delete old 4,270-line modern-service-modal.tsx
3. Update imports across codebase

---

## Risk Assessment

**Low Risk:**
- ✅ Service forms are isolated - can extract one at a time
- ✅ Hooks don't change UI - safe to refactor
- ✅ Gradual migration path available

**Medium Risk:**
- ⚠️ Shared steps used by all services - need thorough testing
- ⚠️ Pricing logic complex - need unit tests

**Mitigation:**
1. Extract and test one service at a time
2. Keep old component until all services migrated
3. Add unit tests for pricing hooks
4. Test with real bookings before deleting old code

---

## Success Criteria

- ✅ All 5 services (cleaning, plumbing, electrical, garden, chef) work correctly
- ✅ Cart functionality unchanged
- ✅ Pricing calculations match old version
- ✅ No regression in booking flow
- ✅ ModernServiceModal.tsx < 500 lines
- ✅ Each service form < 500 lines
- ✅ All imports updated across codebase
- ✅ LSP shows no errors
- ✅ Application builds and runs without errors

---

## Timeline Estimate

**Phase 1:** Extract service forms (2-3 hours)  
**Phase 2:** Extract shared steps (2-3 hours)  
**Phase 3:** Extract hooks (1-2 hours)  
**Phase 4:** Build orchestrator (1-2 hours)  
**Testing:** End-to-end validation (1 hour)

**Total:** 7-11 hours of focused refactoring work

---

## Immediate Next Steps

1. ✅ Create directory structure
2. ✅ Start with CleaningServiceForm.tsx (most complex, ~300 lines)
3. ✅ Test cleaning bookings work
4. ✅ Continue with other services
5. ✅ Extract shared steps after all forms done
6. ✅ Extract hooks
7. ✅ Build orchestrator
8. ✅ Clean up and test

---

**Note:** This is a significant refactoring but follows best practices:
- Gradual migration (not big bang)
- Test after each extraction
- Keep old code until fully verified
- Clear rollback path if issues arise

This decomposition will make the Berry Events booking system **significantly more maintainable** and **easier to extend** with new services in the future.
