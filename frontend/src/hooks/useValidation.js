/**
 * FormMonkey Frontend Validation Hooks
 *
 * Provides React hooks for form validation using shared validators.
 * Implements the hybrid validation strategy with immediate feedback.
 */
import { validateField as baseValidateField } from '../services/api';
import { useCallback, useEffect, useState } from 'react';
// Adapter function to convert string validation to ValidationResult
const validateField = (field) => {
    const error = baseValidateField(field);
    return {
        isValid: !error,
        errors: error ? [{ field: field.name, message: error }] : [],
        warnings: []
    };
};
// Simple AI prediction validation (placeholder for frontend-only)
const validateAIPrediction = (data) => {
    return {
        isValid: true,
        errors: [],
        warnings: []
    };
};
// ============================================================================
// FIELD VALIDATION HOOK
// ============================================================================
/**
 * Hook for real-time field validation with debouncing
 * Provides immediate UX feedback while preventing excessive validation calls
 */
export const useFieldValidation = (field, debounceMs = 300) => {
    const [validationState, setValidationState] = useState({
        isValid: true,
        errors: [],
        warnings: [],
        isValidating: false
    });
    const validateFieldDebounced = useCallback(debounce((fieldToValidate) => {
        setValidationState(prev => ({ ...prev, isValidating: true }));
        const result = validateField(fieldToValidate);
        setValidationState({
            isValid: result.isValid,
            errors: result.errors,
            warnings: result.warnings,
            isValidating: false
        });
    }, debounceMs), [debounceMs]);
    useEffect(() => {
        validateFieldDebounced(field);
    }, [field.value, field.type, validateFieldDebounced]);
    return {
        ...validationState,
        validateNow: () => {
            const result = validateField(field);
            setValidationState({
                isValid: result.isValid,
                errors: result.errors,
                warnings: result.warnings,
                isValidating: false
            });
            return result;
        }
    };
};
// ============================================================================
// FORM VALIDATION HOOK
// ============================================================================
/**
 * Hook for managing validation state across multiple fields
 * Provides form-level validation status and bulk validation operations
 */
export const useFormValidation = (fields) => {
    const [formState, setFormState] = useState({
        fields: {},
        isFormValid: true,
        hasWarnings: false,
        isValidating: false
    });
    const validateAllFields = useCallback(async () => {
        setFormState(prev => ({ ...prev, isValidating: true }));
        const results = [];
        const fieldStates = {};
        // Validate all fields
        for (const field of fields) {
            const result = validateField(field);
            results.push(result);
            fieldStates[field.id] = {
                isValid: result.isValid,
                errors: result.errors,
                warnings: result.warnings,
                isValidating: false
            };
        }
        // Calculate form-level state
        const isFormValid = results.every(r => r.isValid);
        const hasWarnings = results.some(r => r.warnings.length > 0);
        setFormState({
            fields: fieldStates,
            isFormValid,
            hasWarnings,
            isValidating: false
        });
        return results;
    }, [fields]);
    const validateSingleField = useCallback((fieldId) => {
        const field = fields.find(f => f.id === fieldId);
        if (!field)
            return null;
        const result = validateField(field);
        setFormState(prev => ({
            ...prev,
            fields: {
                ...prev.fields,
                [fieldId]: {
                    isValid: result.isValid,
                    errors: result.errors,
                    warnings: result.warnings,
                    isValidating: false
                }
            }
        }));
        return result;
    }, [fields]);
    // Auto-validate when fields change
    useEffect(() => {
        validateAllFields();
    }, [validateAllFields]);
    return {
        ...formState,
        validateAllFields,
        validateSingleField,
        getFieldValidation: (fieldId) => formState.fields[fieldId] || {
            isValid: true,
            errors: [],
            warnings: [],
            isValidating: false
        }
    };
};
// ============================================================================
// API VALIDATION HOOK
// ============================================================================
/**
 * Hook for handling server-side validation errors
 * Integrates frontend validation with backend responses
 */
export const useApiValidation = () => {
    const [serverErrors, setServerErrors] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const submitWithValidation = useCallback(async (data, submitFn) => {
        setIsSubmitting(true);
        setServerErrors([]);
        try {
            const result = await submitFn(data);
            return { success: true, data: result };
        }
        catch (error) {
            // Handle validation errors from backend
            if (error.response?.status === 400 && error.response?.data?.validation) {
                const validationErrors = error.response.data.validation.map((err) => ({
                    field: err.field || 'general',
                    message: err.message || 'Validation failed'
                }));
                setServerErrors(validationErrors);
            }
            return { success: false, error };
        }
        finally {
            setIsSubmitting(false);
        }
    }, []);
    const clearServerErrors = useCallback(() => {
        setServerErrors([]);
    }, []);
    return {
        serverErrors,
        isSubmitting,
        submitWithValidation,
        clearServerErrors
    };
};
// ============================================================================
// AI PREDICTION VALIDATION HOOK
// ============================================================================
/**
 * Hook for validating AI predictions before displaying to users
 * Ensures prediction data integrity and confidence thresholds
 */
export const useAIPredictionValidation = () => {
    const validatePrediction = useCallback((prediction, minConfidence = 0.7) => {
        // First, validate the prediction structure
        const structuralValidation = validateAIPrediction(prediction);
        if (!structuralValidation.isValid) {
            return structuralValidation;
        }
        // Additional UX-specific validation
        const warnings = [...structuralValidation.warnings];
        if (prediction.confidence < minConfidence) {
            warnings.push({
                field: 'confidence',
                message: `Prediction confidence (${Math.round(prediction.confidence * 100)}%) is below recommended threshold`
            });
        }
        return {
            ...structuralValidation,
            warnings
        };
    }, []);
    return { validatePrediction };
};
// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
/**
 * Debounce utility function
 */
function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(undefined, args), wait);
    };
}
/**
 * Format validation errors for display
 */
export const formatValidationError = (error) => {
    return `${error.field}: ${error.message}`;
};
/**
 * Get validation errors for a specific field
 */
export const getFieldErrors = (fieldId, validationState) => {
    return validationState.fields[fieldId]?.errors || [];
};
/**
 * Check if a field has validation errors
 */
export const hasFieldErrors = (fieldId, validationState) => {
    return getFieldErrors(fieldId, validationState).length > 0;
};
