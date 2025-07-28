/**
 * Type Export Helper for FormMonkey
 * 
 * This file provides a consolidated export of all shared types and constants.
 * Frontend code should import types from this file rather than
 * defining local variants or importing directly from individual files.
 */

// Re-export all types from types.ts except those that might conflict with constants.ts
export {
  // Types
  UploadStatus,
  UploadMetadata,
  TextLocation,
  TextFieldPrediction,
  FieldType,
  FieldPrediction,
  AIPredictedField,
  UserCorrection,
  ProfilePatch,
  ProcessingStatus,
  DocumentMetadata,
  ParseStatusType,
  ParseStatus,
  
  // Schemas
  UploadMetadataSchema,
  TextLocationSchema,
  TextFieldPredictionSchema,
  FieldPredictionSchema,
  AIPredictedFieldSchema,
  UserCorrectionSchema,
  ProfilePatchSchema,
  DocumentMetadataSchema,
  ParseStatusSchema,
  
  // Validation helpers
  validateFileExtension,
  validateFileSize,
  
  // Type aliases
  TextFieldPredictionValidated,
  UploadMetadataValidated,
  DocumentMetadataValidated,
  ParseStatusValidated,
  
  // Constants
  API_ENDPOINTS
} from "./types";

// Re-export constants from constants.ts
export {
  // Enums
  PredictionSource,
  CorrectionReason,
  
  // Constants
  AI_PREDICTION_CONFIDENCE,
  CONFIDENCE_THRESHOLDS,
  LEARNING_RATES,
  FIELD_PREDICTION_SETTINGS,
  SUPPORTED_FILE_TYPES,
  CONFIG_KEYS
} from './constants';

/**
 * Type Compatibility Functions
 * 
 * These utility functions help ensure compatibility between
 * TypeScript and Python types.
 */

/**
 * Convert camelCase property names to snake_case
 * Used when sending data to the backend
 */
export function toSnakeCase<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    // Convert camelCase to snake_case
    const snakeKey = key.replace(/[A-Z]/g, (letter: string) => `_${letter.toLowerCase()}`);
    
    // Handle nested objects recursively
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[snakeKey] = toSnakeCase(value);
    } else if (Array.isArray(value)) {
      // Handle arrays
      result[snakeKey] = value.map(item => 
        typeof item === 'object' && item !== null ? toSnakeCase(item) : item
      );
    } else {
      result[snakeKey] = value;
    }
  });
  
  return result;
}

/**
 * Convert snake_case property names to camelCase
 * Used when receiving data from the backend
 */
export function toCamelCase<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    // Convert snake_case to camelCase
    const camelKey = key.replace(/_([a-z])/g, (_: string, letter: string) => letter.toUpperCase());
    
    // Handle nested objects recursively
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[camelKey] = toCamelCase(value);
    } else if (Array.isArray(value)) {
      // Handle arrays
      result[camelKey] = value.map(item => 
        typeof item === 'object' && item !== null ? toCamelCase(item) : item
      );
    } else {
      result[camelKey] = value;
    }
  });
  
  return result;
}

/**
 * Type guard to ensure an object conforms to a shared type
 * Uses Zod schema validation
 */
export function validateSharedType<T>(obj: unknown, schema: any): obj is T {
  try {
    schema.parse(obj);
    return true;
  } catch (error) {
    return false;
  }
}
