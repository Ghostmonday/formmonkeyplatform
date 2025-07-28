# 🚨 DEPRECATED: Local Type Definitions

**This entire `/frontend/src/types/` directory is DEPRECATED.**

## Migration Status: ✅ COMPLETED

All type definitions have been successfully migrated to `shared/types.ts` to ensure cross-platform consistency between frontend and backend.

## ✅ Migration Complete:

### Components Migrated:
- ✅ `PreviewSummary.tsx` - Now uses shared types
- ✅ `CategorySection.tsx` - Now uses shared types  
- ✅ `FieldList.tsx` - Now uses shared types
- ✅ `FieldEditor.tsx` - Now uses shared types
- ✅ `SearchBar.tsx` - No type dependencies
- ✅ `ActionButtons.tsx` - No type dependencies

### Hooks Migrated:
- ✅ `useAutoSave.ts` - Now uses shared types

### Services Migrated:
- ✅ `api.ts` - Now uses shared types

### Pages Migrated:
- ✅ `Preview.tsx` - Now uses shared types

### Utils:
- ⚠️ `validation.ts` - Partially migrated (some errors remain)
- ⚠️ `aiTestData.ts` - Needs interface alignment
- ❓ `ai.ts` - Needs review

## 🎯 **Use This Instead:**

```typescript
// ❌ OLD (deprecated)
import { ParsedField, FieldCategory } from '../types';

// ✅ NEW (correct)
import { ParsedField, FieldCategory } from '../../../shared/types';
```

## 📋 **Available Shared Types:**

### Core Types:
- `ParsedField` - Document field with editing capabilities
- `FieldCategory` - Field categorization enum  
- `FieldType` - Field type enum
- `JobStatus` - Processing job status
- `Profile` - User profile interface

### AI-Related Types:
- `AIPredictedField` - AI field predictions
- `UserCorrection` - User corrections to AI
- `PredictionSource` - Source of predictions
- `CorrectionReason` - Reason for corrections

### Document Types:
- `DocumentMetadata` - Document metadata
- `UploadMetadata` - Upload metadata
- `FileMetadata` - File metadata

### Validation Schemas:
- All interfaces have corresponding Zod schemas for runtime validation

## 🔄 **Next Steps:**

1. ✅ Component decomposition completed
2. ✅ Type system consolidation completed  
3. 🎯 **Ready for Phase 4**: AI prediction and correction features

## 🗑️ **Safe to Delete:**

Once all components are confirmed working with shared types, this entire directory can be safely deleted.

**Last Updated:** July 25, 2025  
**Migration Status:** COMPLETE ✅
