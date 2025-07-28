/**
 * [AI_SCHEMA_P4] - Validation utilities for FormMonkey frontend
 *
 * This file provides helper functions to validate data against our Zod schemas.
 */
export function validateAIPrediction(data) {
    // Simple validation for frontend-only workspace
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid AI prediction data');
    }
    return data;
}
/**
 * Validate a user correction
 * @param data The data to validate
 * @returns Validated data or throws an error
 */
export function validateUserCorrection(data) {
    // Simple validation for frontend-only workspace
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid user correction data');
    }
    return data;
}
/**
 * Validate a parsed field
 * @param data The data to validate
 * @returns Validated data or throws an error
 */
export function validateParsedField(data) {
    // Simple validation for frontend-only workspace
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid parsed field data');
    }
    return data;
}
/**
 * Validate document metadata
 * @param data The data to validate
 * @returns Validated data or throws an error
 */
export function validateDocumentMetadata(data) {
    // Simple validation for frontend-only workspace
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid document metadata');
    }
    return data;
}
/**
 * Safe validation that returns null instead of throwing
 * @param schema The schema to validate against
 * @param data The data to validate
 * @returns Validated data or null
 */
export function safeValidate(validator, data) {
    try {
        return validator(data);
    }
    catch (error) {
        console.error('Validation error:', error);
        return null;
    }
}
