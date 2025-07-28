# FormMonkey Validation Strategy

## Architecture Overview

### 1. **Centralized Validation Logic** (`shared/validators.ts`)
- **Single Source of Truth**: All validation rules defined once
- **Cross-Platform**: Works in both Node.js (backend) and browser (frontend)
- **Type-Safe**: Full TypeScript integration with Zod schemas

### 2. **Layered Validation Approach**

#### **Layer 1: Frontend (Immediate Feedback)**
- **Purpose**: User experience optimization
- **Scope**: Form validation, field-level feedback, UI state management
- **Security Level**: LOW (client-side can be bypassed)
- **Implementation**: Import shared validators for consistency

```typescript
// Frontend: Immediate validation for UX
import { validateField, validateProfile } from '@shared/validators';

const handleFieldChange = (field: ParsedField) => {
  const validation = validateField(field);
  if (!validation.isValid) {
    setFieldError(field.id, validation.errors);
  }
};
```

#### **Layer 2: Backend (Security Enforcement)**
- **Purpose**: Security, data integrity, business rules enforcement
- **Scope**: API input validation, database constraints, business logic
- **Security Level**: HIGH (server-side authoritative)
- **Implementation**: Same shared validators + additional server-only checks

```python
# Backend: Security-critical validation
from shared.validators import validate_profile, validate_field

@router.post("/profile")
async def create_profile(profile_data: dict):
    # Use same validation logic as frontend
    validation = validate_profile(profile_data)
    if not validation.is_valid:
        raise HTTPException(400, validation.errors)
    
    # Additional server-only checks
    await check_business_rules(profile_data)
    await verify_permissions(current_user, profile_data)
```

### 3. **Validation Categories**

#### **A. Structural Validation** (Both Frontend + Backend)
- Data types, required fields, schema compliance
- Uses shared Zod schemas for consistency
- Example: Email format, date ranges, file types

#### **B. Business Logic Validation** (Both Frontend + Backend)
- Legal document rules, cross-field dependencies
- Example: Contract dates, party validations, jurisdiction rules

#### **C. Security Validation** (Backend Only)
- Authorization, data sanitization, rate limiting
- Example: User permissions, PII redaction, SQL injection prevention

#### **D. UX Validation** (Frontend Only)
- Progressive disclosure, conditional fields, auto-completion
- Example: Address suggestions, real-time formatting

### 4. **Implementation Plan**

#### **Phase 1: Shared Validator Foundation**
```typescript
// shared/validators.ts
export const fieldValidators = {
  email: (value: string) => emailSchema.safeParse(value),
  date: (value: string) => dateSchema.safeParse(value),
  phone: (value: string) => phoneSchema.safeParse(value),
  // ... legal-specific validators
};

export const businessRules = {
  contractDates: (startDate: string, endDate: string) => {
    // Cross-field validation logic
  },
  partyValidation: (parties: Party[]) => {
    // Legal party requirements
  }
};
```

#### **Phase 2: Frontend Integration**
```typescript
// frontend/src/hooks/useValidation.ts
import { fieldValidators, businessRules } from '@shared/validators';

export const useValidation = () => {
  const validateFieldRealtime = (field: ParsedField) => {
    // Immediate feedback without server round-trip
    return fieldValidators[field.type](field.value);
  };
  
  const validateFormSubmission = async (formData: FormData) => {
    // Pre-submission validation
    const clientValidation = validateForm(formData);
    if (!clientValidation.isValid) {
      return clientValidation;
    }
    
    // Submit to backend for authoritative validation
    return await api.validateAndSubmit(formData);
  };
};
```

#### **Phase 3: Backend Integration**
```python
# backend/api/dependencies.py
from shared.validators import validate_request_data

async def validate_api_input(request_data: dict, schema: str):
    """Authoritative validation for all API inputs"""
    validation = validate_request_data(request_data, schema)
    if not validation.is_valid:
        raise ValidationError(validation.errors)
    return validation.data
```

### 5. **Performance Optimizations**

#### **Frontend Optimizations**
- **Debounced Validation**: Real-time validation with 300ms delay
- **Incremental Validation**: Only validate changed fields
- **Progressive Validation**: Basic → advanced → business rules

#### **Backend Optimizations**
- **Cached Validators**: Reuse compiled validation functions
- **Batch Validation**: Validate multiple fields together
- **Early Exit**: Stop on first critical error

### 6. **Error Handling Strategy**

```typescript
// shared/types.ts
export interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  context?: Record<string, any>;
}
```

### 7. **Security Considerations**

#### **Never Trust Frontend Validation**
- Frontend validation is for UX only
- Backend MUST re-validate everything
- Use allowlists, not blocklists for input validation

#### **Defense in Depth**
```python
# Backend: Multiple validation layers
async def process_document(document_data: dict):
    # Layer 1: Schema validation
    await validate_schema(document_data)
    
    # Layer 2: Business rules
    await validate_business_rules(document_data)
    
    # Layer 3: Security checks
    await validate_permissions(current_user, document_data)
    await sanitize_pii(document_data)
    
    # Layer 4: Database constraints
    await validate_database_constraints(document_data)
```

### 8. **Testing Strategy**

#### **Shared Validator Tests**
```typescript
// shared/validators.test.ts
describe('Email Validation', () => {
  test('accepts valid emails', () => {
    expect(validateEmail('user@example.com').isValid).toBe(true);
  });
  
  test('rejects invalid emails', () => {
    expect(validateEmail('invalid-email').isValid).toBe(false);
  });
});
```

#### **Cross-Platform Consistency Tests**
```typescript
// Ensure frontend and backend use same validation
test('frontend and backend validation consistency', async () => {
  const testData = { email: 'test@example.com' };
  
  const frontendResult = validateEmailFrontend(testData.email);
  const backendResult = await validateEmailBackend(testData.email);
  
  expect(frontendResult.isValid).toBe(backendResult.isValid);
});
```

### 9. **Migration Path**

#### **Current State Analysis**
- ✅ Zod schemas in `shared/types.ts`
- ✅ Basic frontend validation in `frontend/src/services/api.ts`
- ✅ Backend Pydantic validation in routers
- ❌ No centralized validation logic
- ❌ Inconsistent error handling

#### **Step-by-Step Migration**
1. **Consolidate shared validators** → Complete `shared/validators.ts`
2. **Update frontend** → Replace local validation with shared validators  
3. **Update backend** → Add shared validator integration
4. **Add comprehensive tests** → Ensure consistency across platforms
5. **Performance tuning** → Optimize for production load

### 10. **Benefits of This Approach**

✅ **Consistency**: Same validation logic everywhere
✅ **Security**: Backend authoritative validation
✅ **UX**: Immediate frontend feedback
✅ **Maintainability**: Single source of truth
✅ **Type Safety**: Full TypeScript integration
✅ **Performance**: Optimized for both platforms
✅ **Testability**: Shared test suites possible

### 11. **Next Steps**

1. Implement comprehensive shared validators
2. Create validation hooks for frontend components
3. Add backend validation middleware
4. Write comprehensive test suite
5. Monitor performance and optimize

This hybrid approach gives you the best of both worlds: great UX with immediate feedback while maintaining rock-solid security through server-side validation.
