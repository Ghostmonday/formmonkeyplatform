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

// Field prediction source types
export enum PredictionSource {
  REGEX = 'regex',
  ML_MODEL = 'ml_model',
  MANUAL = 'manual',
  USER_INPUT = 'user_input'
}

/**
 * AI prediction confidence thresholds for determining UI treatment and automation
 */
export const AI_PREDICTION_CONFIDENCE = {
  // Below this threshold, predictions are considered unreliable
  LOW: 0.3,
  // Between LOW and MEDIUM, predictions require user verification
  MEDIUM: 0.7,
  // Above HIGH, predictions can be auto-accepted
  HIGH: 0.9
} as const;

// Confidence threshold constants
export const CONFIDENCE_THRESHOLDS = {
  low: 0.3,
  medium: 0.6,
  high: 0.85
} as const;

// Learning rate parameters for model adaptation
export const LEARNING_RATES = {
  USER_CORRECTION: 0.8,   // High weight for explicit corrections
  TEMPLATE_MATCH: 0.6,    // Medium-high weight for template matches
  SIMILAR_DOCUMENT: 0.4,  // Medium weight for similar documents
  DEFAULT_RATE: 0.1       // Conservative default learning rate
} as const;

// Field prediction settings
export const FIELD_PREDICTION_SETTINGS = {
  MIN_CONFIDENCE_FOR_AUTOFILL: 0.7,
  MIN_CONFIDENCE_FOR_SUGGESTION: 0.4,
  MAX_SUGGESTIONS_PER_FIELD: 3,
  CONTEXT_WINDOW_SIZE: 100  // Characters before/after for context window
} as const;

/**
 * Cross-Platform Synchronization:
 * - Values must be identical between frontend and backend
 * - Use environment-aware constants where needed (dev vs prod)
 * - Ensure type compatibility between TypeScript and Python
 * - Support for runtime constant validation and override
 *
 * Keep logic-free. This file should serve as a single source of truth for shared static config.
 */

// TODO [0]: Define file type constants, endpoint names, validation ranges
// TODO [0.1]: Add environment-specific constant overrides with validation
// TODO [0.2]: Implement constant validation at application startup
// TODO [1]: Used across all modules; ensure synchronization
// TODO [1.1]: Add MIME type validation mapping for security
// TODO [1.2]: Add jurisdiction-specific field validation rules
// TODO [1.3]: Add multilingual error message support
// TODO [1.4]: Add configuration validation between frontend and backend
