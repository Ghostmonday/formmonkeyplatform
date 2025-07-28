# Backend Type Deprecation Guide

## Overview

This guide outlines the plan for deprecating local model definitions in the backend codebase and replacing them with imports from the shared type system. This is part of our architectural improvement initiative to establish a single source of truth for all type definitions.

## Why Consolidate Types?

1. **Eliminate Duplication**: Reduces maintenance overhead and prevents drift between different model definitions
2. **Type Safety**: Ensures frontend and backend are working with identical data structures
3. **Validation Consistency**: Centralizes validation rules in one place
4. **Developer Experience**: Simplifies the mental model for developers working across the stack
5. **Bug Prevention**: Catches type mismatches during development rather than in production

## Deprecation Timeline

| Phase | Description | Target Completion |
|-------|-------------|-------------------|
| 1     | Inventory existing model duplications | Week 1 |
| 2     | Add deprecation docstring comments | Week 2 |
| 3     | Create migration helpers | Week 2 |
| 4     | Update service imports | Weeks 3-4 |
| 5     | Remove deprecated models | Week 5 |

## Migration Instructions

### For Python Files

**Before:**
```python
# app/models/document.py
from pydantic import BaseModel, Field

class DocumentMetadata(BaseModel):
    job_id: str
    filename: str
    # ...other fields

# app/services/document_service.py
from app.models.document import DocumentMetadata
```

**After:**
```python
# app/services/document_service.py
from shared.types import DocumentMetadata
# or using the re-export
from shared.index import DocumentMetadata
```

### Using Type Conversion Helpers

When working with data from the frontend:

```python
from shared.index import to_snake_case, DocumentMetadata, validate_shared_type

# Validate and convert incoming data
raw_data = request.json()
snake_case_data = to_snake_case(raw_data)

# Validate against the shared model
is_valid = validate_shared_type(snake_case_data, DocumentMetadata)
if is_valid:
    document_data = DocumentMetadata(**snake_case_data)
    # Process the document
else:
    # Handle validation error
```

When sending data to the frontend:

```python
from shared.index import to_camel_case

document = DocumentMetadata(
    job_id='123',
    filename='contract.pdf',
    # ...other fields
)

return JSONResponse(content=to_camel_case(document.dict()))
```

## Checklist for Model Migration

For each module or service:

1. [ ] Identify local model definitions that duplicate shared types
2. [ ] Add deprecation docstring comments
3. [ ] Update imports to use shared types
4. [ ] Use to_camel_case/to_snake_case helpers for API interactions
5. [ ] Run type checks and tests
6. [ ] Remove local model definitions once all references are updated

## Model Verification

To verify model compatibility between backend and frontend:

```python
from shared.index import validate_shared_type, DocumentMetadata

# Check if a dictionary matches the shared type
is_valid = validate_shared_type(data, DocumentMetadata)
```
