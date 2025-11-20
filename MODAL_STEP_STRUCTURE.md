# Modern Service Modal - Current Step Structure

**File:** `client/src/components/modern-service-modal.tsx`  
**Total Lines:** 4,270

## Step Functions Overview

| Step | Function | Line Start | Responsibility |
|------|----------|------------|----------------|
| 1 | `renderStep1()` | 2077 | Property type + Address + Gate code + Service-specific fields (cleaning, garden, plumbing, electrical, chef) |
| 2 | `renderStep2()` | 2754 | Unknown - Need to examine |
| 3 | `renderStep3()` | 3003 | Unknown - Need to examine |
| 4 | `renderStep4()` | 3207 | Unknown - Need to examine |
| 5 | `renderStep5()` | 3512 | Unknown - Need to examine |

## Step 1 Breakdown (Lines 2077-2754, ~677 lines)

### Common Fields (All Services)
- Property Type dropdown (required)
- Service Address input (required)
- Gate/Access Code input (optional, conditional on property type)

### Service-Specific Fields

#### House Cleaning (`isHouseCleaning`)
- Cleaning Type (basic, deep, move-in, spring clean)
- Property Size selection
- Additional fields (TBD - need to examine full block)

#### Garden Service (`isGardenService`)
- Garden Size Range selector
- Garden multiplier display
- Additional fields (TBD)

#### Plumbing Service
- (TBD - need to locate plumbing-specific fields)

#### Electrical Service
- (TBD - need to locate electrical-specific fields)

#### Chef & Catering
- (TBD - need to locate chef-specific fields)

## Decomposition Strategy (Option C - Hybrid)

### Phase 1: Extract Service-Specific Form Components

Keep Step 1 as orchestrator:
```typescript
const renderStep1 = () => (
  <div>
    {/* Common fields - keep here */}
    <PropertyTypeSelect />
    <AddressInput />
    <GateCodeInput />
    
    {/* Service-specific forms - extracted to components */}
    {isHouseCleaning && <CleaningServiceForm />}
    {isGardenService && <GardenServiceForm />}
    {isPlumbing && <PlumbingServiceForm />}
    {isElectrical && <ElectricalServiceForm />}
    {isChef && <ChefServiceForm />}
  </div>
);
```

### Proof-of-Concept: CleaningServiceForm

**Goal:** Extract cleaning-specific fields into `booking-forms/CleaningServiceForm.tsx`

**Fields to Extract:**
- Cleaning Type selector
- Property Size selector
- Additional cleaning-specific fields (room count, pool cleaning, etc.)

**Props Interface:**
```typescript
interface CleaningServiceFormProps {
  formData: BookingFormData;
  setFormData: (data: BookingFormData | ((prev: BookingFormData) => BookingFormData)) => void;
  currentConfig: ServiceConfig;
}
```

**Testing:**
- Verify cleaning booking flow works end-to-end
- Check price estimation updates correctly
- Validate form validation still works

**Next Steps After POC:**
1. Extract GardenServiceForm
2. Extract PlumbingServiceForm
3. Extract ElectricalServiceForm
4. Extract ChefServiceForm
5. Then move to Step 2-5 extraction

## Notes

- This hybrid approach preserves the existing booking flow
- Minimal risk of breaking existing functionality
- Easy rollback if issues arise
- Incremental testing after each extraction
