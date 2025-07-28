# FormMonkey Shared Types

This directory contains the single source of truth for all type definitions in the FormMonkey application.

## Type System Architecture

### Core Principles

1. **Single Source of Truth**: All types should be defined once in the shared folder and imported by both frontend and backend.
2. **Cross-Platform Compatibility**: TypeScript interfaces and Python Pydantic models must maintain perfect parity.
3. **Validation Consistency**: Zod schemas (TS) and Pydantic validators (Python) should enforce identical validation rules.
4. **Case Conventions**: TypeScript uses camelCase, Python uses snake_case - both implementations must be in sync.

### Deprecation Path for Duplicated Types

Any types duplicated in frontend-specific or backend-specific files should follow this deprecation path:

1. Import shared types instead of using local definitions
2. Add "@deprecated" comments to any remaining local types
3. Gradually replace usages with shared imports
4. Remove duplicate types once all references are migrated

## Type Validation Contract

The shared types directory establishes a contract between frontend and backend:

- API request/response formats
- Data validation rules
- Entity structure definitions
- Enumeration values

Breaking changes to this contract require careful coordination between frontend and backend teams.

## Usage Guidelines

### For Frontend Developers

```typescript
// DON'T: Define local types that duplicate shared ones
// interface UserProfile { ... } ❌

// DO: Import from shared types
import { UserProfile } from '@shared/types';
```

### For Backend Developers

```python
# DON'T: Define local models that duplicate shared ones
# class UserProfile(BaseModel): ... ❌

# DO: Import from shared types
from shared.types import UserProfile
```

## Type Migration Checklist

When adding or modifying types:

1. ✅ Update both TypeScript and Python implementations
2. ✅ Ensure validation rules match exactly
3. ✅ Add Zod schemas for runtime validation in TypeScript
4. ✅ Add Pydantic validators in Python
5. ✅ Document fields with consistent descriptions
6. ✅ Update unit tests for both implementations
