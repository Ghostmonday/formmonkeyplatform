/**
Claude, define shared TypeScript interfaces and types here for use across frontend and backend.

Contents:
- JobStatus: type representing upload/parse/export job lifecycle
- FieldType: enum for semantic document fields (Name, Date, Amount, etc.)
- Profile: structure of Master Profile (name, address, etc.)
- ParsedField: structure for extracted document fields (label, value, type, position?, confidence?)

Dependencies & Integration:
- Imported by backend/routers/*.py for request/response models
- Used by frontend/src/services/api.ts for type-safe API calls
- Referenced by backend/services/*.py for data structure consistency
- Imported by frontend/src/components/*.tsx for props and state typing
- Used by shared/validators.ts for runtime type validation
- Referenced by frontend/src/pages/*.tsx for consistent data handling

Cross-Platform Considerations:
- Must be compatible with both TypeScript (frontend) and Python typing (backend)
- Use JSON-serializable types only (no functions, complex objects)
- Ensure field names match between frontend camelCase and backend snake_case
- Support for optional fields and nullable values across both platforms

Make these types as portable and robust as possible. This file ensures consistency across API boundaries.
*/

// TODO [0]: Define canonical interfaces for Field, ProfileData, JobMeta
// TODO [0.1]: Add comprehensive validation decorators for all interface fields
// TODO [0.2]: Implement runtime type checking with detailed error messages
// TODO [1]: Must be consumed by backend + frontend
// TODO [1.1]: Add field dependency mapping for complex form relationships
// TODO [1.2]: Add granular progress states with percentage tracking
// TODO [2]: Maintain typing compatibility across environments
// TODO [2.1]: Add multi-entity profile management with role-based access
// TODO [2.2]: Add confidence scoring interfaces for AI predictions
