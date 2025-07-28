# Module Rename Notice: types.py → schemas.py

## Important Architectural Change

The shared data models previously defined in `types.py` have been renamed to `schemas.py` to avoid shadowing Python's built-in `types` module. This change resolves potential import conflicts and ensures better compatibility with Python's standard library.

## Migration Guide

### For Python Code:

Change your imports from:
```python
from shared.types import AIPredictedField, DocumentMetadata
```

To:
```python
from shared.schemas import AIPredictedField, DocumentMetadata
```

Or better yet, use the barrel export:
```python
from shared.index import AIPredictedField, DocumentMetadata
```

### For TypeScript Code:

Change your imports from:
```typescript
import { AIPredictedField, DocumentMetadata } from '@shared/types';
```

To:
```typescript
import { AIPredictedField, DocumentMetadata } from '@shared/schemas';
```

Or better yet, use the barrel export:
```typescript
import { AIPredictedField, DocumentMetadata } from '@shared/index';
```

## Rationale for Change

1. **Avoid Module Shadowing**: Python's built-in `types` module is used for runtime type checking and reflection. Shadowing it can cause subtle import resolution issues.

2. **Semantic Clarity**: "schemas" more accurately describes the purpose of these definitions - they define the structure and validation rules for our data models.

3. **Import Consistency**: This change allows for more consistent import patterns across the codebase.

## Backward Compatibility

For now, `types.py` still exists and re-exports everything from `schemas.py` with a deprecation warning, but this compatibility layer will be removed in a future release. Please update your imports as soon as possible.

## Verifying Migration

To verify that all imports have been updated in your codebase, you can run:

```
grep -r "from shared.types import" --include="*.py" .
grep -r "import { .* } from '@shared/types'" --include="*.ts" .
```
