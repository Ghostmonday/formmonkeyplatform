# Frontend Type Deprecation Guide

## Overview

This guide outlines the plan for deprecating local type definitions in the frontend codebase and replacing them with imports from the shared type system. This is part of our architectural improvement initiative to establish a single source of truth for all type definitions.

## Why Consolidate Types?

1. **Eliminate Duplication**: Reduces maintenance overhead and prevents drift between different type definitions
2. **Type Safety**: Ensures frontend and backend are working with identical data structures
3. **Validation Consistency**: Centralizes validation rules in one place
4. **Developer Experience**: Simplifies the mental model for developers working across the stack
5. **Bug Prevention**: Catches type mismatches at compile time rather than runtime

## Deprecation Timeline

| Phase | Description | Target Completion |
|-------|-------------|-------------------|
| 1     | Inventory existing type duplications | Week 1 |
| 2     | Add @deprecated JSDoc comments | Week 2 |
| 3     | Create migration helpers | Week 2 |
| 4     | Update component imports | Weeks 3-4 |
| 5     | Remove deprecated types | Week 5 |

## Migration Instructions

### For TypeScript Files

**Before:**
```typescript
// src/types/documentTypes.ts
export interface DocumentMetadata {
  jobId: string;
  filename: string;
  // ...other fields
}

// src/components/DocumentViewer.tsx
import { DocumentMetadata } from '../types/documentTypes';
```

**After:**
```typescript
// src/components/DocumentViewer.tsx
import { DocumentMetadata } from '@shared/types';
// or using the barrel export
import { DocumentMetadata } from '@shared/index';
```

### Using Type Conversion Helpers

When working with data from the API:

```typescript
import { toCamelCase, DocumentMetadata, DocumentMetadataSchema } from '@shared/index';

// Validate and convert incoming data
const rawData = await api.fetchDocument(id);
const validData = DocumentMetadataSchema.parse(rawData);
const documentData = toCamelCase(validData) as DocumentMetadata;
```

When sending data to the API:

```typescript
import { toSnakeCase, DocumentMetadata } from '@shared/index';

const documentData: DocumentMetadata = {
  jobId: '123',
  filename: 'contract.pdf',
  // ...other fields
};

await api.updateDocument(toSnakeCase(documentData));
```

## Checklist for Type Migration

For each component or module:

1. [ ] Identify local type definitions that duplicate shared types
2. [ ] Add @deprecated JSDoc comments
3. [ ] Update imports to use shared types
4. [ ] Use toCamelCase/toSnakeCase helpers for API interactions
5. [ ] Run type checks and tests
6. [ ] Remove local type definitions once all references are updated

## Type Verification

To verify type compatibility between frontend and backend:

```typescript
import { validateSharedType, DocumentMetadata, DocumentMetadataSchema } from '@shared/index';

// Check if an object matches the shared type
const isValid = validateSharedType<DocumentMetadata>(data, DocumentMetadataSchema);
```
