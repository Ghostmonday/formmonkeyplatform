/**
Claude, use this file to define global constants shared between frontend and backend.

Examples:
- MAX_FILE_SIZE_MB
- SUPPORTED_FILE_TYPES
- DEFAULT_PROFILE_VALUES
- API_ROUTE_NAMES (e.g., 'upload', 'parse', etc.)

Dependencies & Integration:
- Imported by backend/config.py for validation limits and default values
- Used by frontend/src/components/FileUploadWidget.tsx for file type validation
- Referenced by backend/routers/*.py for consistent API route naming
- Imported by frontend/src/services/api.ts for API endpoint construction
- Used by backend/services/parser_engine.py for processing limits
- Referenced by shared/validators.ts for validation thresholds

Cross-Platform Synchronization:
- Values must be identical between frontend and backend
- Use environment-aware constants where needed (dev vs prod)
- Ensure type compatibility between TypeScript and Python
- Support for runtime constant validation and override

Keep logic-free. This file should serve as a single source of truth for shared static config.
*/

// TODO [0]: Define file type constants, endpoint names, validation ranges
// TODO [0.1]: Add environment-specific constant overrides with validation
// TODO [0.2]: Implement constant validation at application startup
// TODO [1]: Used across all modules; ensure synchronization
// TODO [1.1]: Add MIME type validation mapping for security
// TODO [1.2]: Add jurisdiction-specific field validation rules
// TODO [1.3]: Add multilingual error message support
// TODO [1.4]: Add configuration validation between frontend and backend
