/**
 * [AI_SCHEMA_P4] - Validation utilities for FormMonkey frontend
 * 
 * This file provides helper functions to validate data against our Zod schemas.
 */

import {
  AIPredictedField,
  DocumentMetadata,
  ParsedField,
  UserCorrection
} from '../types'; /**
 * Validate an AI-predicted field
 * @param data The data to validate
 * @returns Validated data or throws an error
 */
export function validateAIPrediction(data: unknown): AIPredictedField {
  // Simple validation for frontend-only workspace
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid AI prediction data');
  }
  return data as AIPredictedField;
}

/**
 * Validate a user correction
 * @param data The data to validate
 * @returns Validated data or throws an error
 */
export function validateUserCorrection(data: unknown): UserCorrection {
  // Simple validation for frontend-only workspace
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid user correction data');
  }
  return data as UserCorrection;
}

/**
 * Validate a parsed field
 * @param data The data to validate
 * @returns Validated data or throws an error
 */
export function validateParsedField(data: unknown): ParsedField {
  // Simple validation for frontend-only workspace
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid parsed field data');
  }
  return data as ParsedField;
}

/**
 * Validate document metadata
 * @param data The data to validate
 * @returns Validated data or throws an error
 */
export function validateDocumentMetadata(data: unknown): DocumentMetadata {
  // Simple validation for frontend-only workspace
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid document metadata');
  }
  return data as DocumentMetadata;
}

/**
 * Safe validation that returns null instead of throwing
 * @param schema The schema to validate against
 * @param data The data to validate
 * @returns Validated data or null
 */
export function safeValidate<T>(
  validator: (data: unknown) => T,
  data: unknown
): T | null {
  try {
    return validator(data);
  } catch (error) {
    console.error('Validation error:', error);
    return null;
  }
}
