/**
 * FormMonkey Shared Validation System
 * 
 * Single source of truth for all validation logic.
 * Works cross-platform: Node.js (backend) and browser (frontend)
 */

import { z } from 'zod';
import {
  AIPredictedField,
  CorrectionReason,
  FieldType,
  ParsedField,
  PredictionSource,
  UserCorrection
} from './types';

// ============================================================================
// VALIDATION RESULT TYPES
// ============================================================================

export interface ValidationResult<T = any> {
  isValid: boolean;
  data?: T;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  context?: Record<string, any>;
}

export interface ValidationWarning {
  field: string;
  code: string;
  message: string;
  suggestion?: string;
}

// ============================================================================
// BASIC FIELD VALIDATORS
// ============================================================================

export const fieldValidators = {
  email: (value: string): ValidationResult<string> => {
    const emailSchema = z.string().email();
    const result = emailSchema.safeParse(value);

    if (result.success) {
      return { isValid: true, data: result.data, errors: [], warnings: [] };
    }

    return {
      isValid: false,
      errors: [{
        field: 'email',
        code: 'INVALID_EMAIL',
        message: 'Please enter a valid email address',
        severity: 'error' as const
      }],
      warnings: []
    };
  },

  phone: (value: string): ValidationResult<string> => {
    // Basic phone validation - can be enhanced for international formats
    const phoneRegex = /^[\+]?[(]?[\+]?\d{1,4}[)]?[-\s\.]?\(?\d{1,3}\)?[-\s\.]?\d{1,4}[-\s\.]?\d{1,4}[-\s\.]?\d{1,9}$/;

    if (phoneRegex.test(value)) {
      return { isValid: true, data: value, errors: [], warnings: [] };
    }

    return {
      isValid: false,
      errors: [{
        field: 'phone',
        code: 'INVALID_PHONE',
        message: 'Please enter a valid phone number',
        severity: 'error' as const
      }],
      warnings: []
    };
  },

  date: (value: string): ValidationResult<string> => {
    const dateSchema = z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/));
    const result = dateSchema.safeParse(value);

    if (result.success) {
      // Additional date validation
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return {
          isValid: false,
          errors: [{
            field: 'date',
            code: 'INVALID_DATE',
            message: 'Please enter a valid date',
            severity: 'error' as const
          }],
          warnings: []
        };
      }

      return { isValid: true, data: result.data, errors: [], warnings: [] };
    }

    return {
      isValid: false,
      errors: [{
        field: 'date',
        code: 'INVALID_DATE_FORMAT',
        message: 'Date must be in YYYY-MM-DD format',
        severity: 'error' as const
      }],
      warnings: []
    };
  },

  text: (value: string, minLength?: number, maxLength?: number): ValidationResult<string> => {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (minLength && value.length < minLength) {
      errors.push({
        field: 'text',
        code: 'TEXT_TOO_SHORT',
        message: `Text must be at least ${minLength} characters`,
        severity: 'error'
      });
    }

    if (maxLength && value.length > maxLength) {
      errors.push({
        field: 'text',
        code: 'TEXT_TOO_LONG',
        message: `Text must not exceed ${maxLength} characters`,
        severity: 'error'
      });
    }

    return {
      isValid: errors.length === 0,
      data: errors.length === 0 ? value : undefined,
      errors,
      warnings
    };
  },

  currency: (value: string): ValidationResult<string> => {
    // Remove currency symbols and spaces for validation
    const cleanValue = value.replace(/[$,\s]/g, '');
    const currencyRegex = /^\d+(\.\d{1,2})?$/;

    if (currencyRegex.test(cleanValue)) {
      return { isValid: true, data: value, errors: [], warnings: [] };
    }

    return {
      isValid: false,
      errors: [{
        field: 'currency',
        code: 'INVALID_CURRENCY',
        message: 'Please enter a valid currency amount',
        severity: 'error' as const
      }],
      warnings: []
    };
  }
};

// ============================================================================
// BUSINESS RULE VALIDATORS
// ============================================================================

export const businessRules = {
  contractDates: (startDate: string, endDate: string): ValidationResult => {
    const errors: ValidationError[] = [];

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      errors.push({
        field: 'dates',
        code: 'INVALID_DATE_FORMAT',
        message: 'Both start and end dates must be valid',
        severity: 'error'
      });
    } else if (start >= end) {
      errors.push({
        field: 'dates',
        code: 'INVALID_DATE_RANGE',
        message: 'Start date must be before end date',
        severity: 'error'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    };
  },

  partyValidation: (parties: any[]): ValidationResult => {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!parties || parties.length < 2) {
      errors.push({
        field: 'parties',
        code: 'INSUFFICIENT_PARTIES',
        message: 'Contract must have at least 2 parties',
        severity: 'error'
      });
    }

    // Check for duplicate party names
    const partyNames = parties.map(p => p.name?.toLowerCase()).filter(Boolean);
    const duplicates = partyNames.filter((name, index) => partyNames.indexOf(name) !== index);

    if (duplicates.length > 0) {
      warnings.push({
        field: 'parties',
        code: 'DUPLICATE_PARTY_NAMES',
        message: 'Some party names appear to be duplicated',
        suggestion: 'Review party names for accuracy'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
};

// ============================================================================
// COMPOSITE VALIDATORS
// ============================================================================

export const validateField = (field: ParsedField): ValidationResult<ParsedField> => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Skip validation for empty values (all fields are optional unless specifically required)
  if (!field.value?.trim()) {
    return { isValid: true, data: field, errors: [], warnings: [] };
  }

  // Type-specific validation
  if (field.value?.trim()) {
    let typeValidation: ValidationResult<string>;

    switch (field.type) {
      case FieldType.EMAIL:
        typeValidation = fieldValidators.email(field.value);
        break;
      case FieldType.PHONE:
        typeValidation = fieldValidators.phone(field.value);
        break;
      case FieldType.DATE:
        typeValidation = fieldValidators.date(field.value);
        break;
      case FieldType.CURRENCY:
        typeValidation = fieldValidators.currency(field.value);
        break;
      case FieldType.TEXT:
      case FieldType.NAME:
      case FieldType.ADDRESS:
      default:
        typeValidation = fieldValidators.text(field.value);
        break;
    }

    if (!typeValidation.isValid) {
      // Map generic field errors to the specific field name
      const fieldErrors = typeValidation.errors.map(error => ({
        ...error,
        field: field.name,
        message: error.message.replace(error.field, field.name)
      }));
      errors.push(...fieldErrors);
    }

    warnings.push(...typeValidation.warnings);
  }

  return {
    isValid: errors.length === 0,
    data: errors.length === 0 ? field : undefined,
    errors,
    warnings
  };
};

export const validateAIPrediction = (prediction: AIPredictedField): ValidationResult<AIPredictedField> => {
  const errors: ValidationError[] = [];

  // Validate confidence score
  if (prediction.confidence < 0 || prediction.confidence > 1) {
    errors.push({
      field: 'confidence',
      code: 'INVALID_CONFIDENCE',
      message: 'Confidence must be between 0 and 1',
      severity: 'error'
    });
  }

  // Validate prediction source using enum values
  const validSources = [
    PredictionSource.REGEX,
    PredictionSource.ML_MODEL,
    PredictionSource.MANUAL,
    PredictionSource.USER_INPUT
  ];
  if (!validSources.includes(prediction.source)) {
    errors.push({
      field: 'source',
      code: 'INVALID_SOURCE',
      message: 'Invalid prediction source',
      severity: 'error'
    });
  }

  return {
    isValid: errors.length === 0,
    data: errors.length === 0 ? prediction : undefined,
    errors,
    warnings: []
  };
};

export const validateUserCorrection = (correction: UserCorrection): ValidationResult<UserCorrection> => {
  const errors: ValidationError[] = [];

  // Validate correction reason using enum values
  const validReasons = [
    CorrectionReason.INCORRECT_VALUE,
    CorrectionReason.INCOMPLETE_VALUE,
    CorrectionReason.FORMATTING_ERROR,
    CorrectionReason.WRONG_FIELD,
    CorrectionReason.DUPLICATE_ENTRY,
    CorrectionReason.OTHER
  ];
  if (!validReasons.includes(correction.correctionReason)) {
    errors.push({
      field: 'correctionReason',
      code: 'INVALID_REASON',
      message: 'Invalid correction reason',
      severity: 'error'
    });
  }

  // Validate that corrected value is different from original prediction
  if (correction.correctedValue === correction.originalPrediction.predictedValue) {
    errors.push({
      field: 'correctedValue',
      code: 'NO_CHANGE',
      message: 'Corrected value must be different from original prediction',
      severity: 'error'
    });
  }

  return {
    isValid: errors.length === 0,
    data: errors.length === 0 ? correction : undefined,
    errors,
    warnings: []
  };
};

// ============================================================================
// SECURITY VALIDATORS (Backend Only)
// ============================================================================

export const securityValidators = {
  sanitizeInput: (input: string): string => {
    // Remove potentially dangerous characters
    return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  },

  detectPII: (text: string): ValidationWarning[] => {
    const warnings: ValidationWarning[] = [];

    // SSN pattern
    if (/\b\d{3}-?\d{2}-?\d{4}\b/.test(text)) {
      warnings.push({
        field: 'text',
        code: 'POTENTIAL_SSN',
        message: 'Text may contain Social Security Number',
        suggestion: 'Consider redacting sensitive information'
      });
    }

    // Credit card pattern
    if (/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/.test(text)) {
      warnings.push({
        field: 'text',
        code: 'POTENTIAL_CREDIT_CARD',
        message: 'Text may contain credit card number',
        suggestion: 'Consider redacting sensitive information'
      });
    }

    return warnings;
  }
};

// ============================================================================
// EXPORT ALL VALIDATORS
// ============================================================================

export default {
  fieldValidators,
  businessRules,
  validateField,
  validateAIPrediction,
  validateUserCorrection,
  securityValidators
};

/**
Claude, define schema and runtime validators here.

Goals:
- Validate Master Profile structures
- Validate parsed field values (e.g., correct email format)
- Cross-field rules (e.g., startDate must precede endDate)
- Use Zod or a portable validation lib

Dependencies & Integration:
- Used by backend/routers/profile.py for profile validation before persistence
- Imported by frontend/src/pages/Profile.tsx for real-time form validation
- Referenced by backend/services/master_profile.py for data integrity checks
- Used by frontend/src/components/FieldEditor.tsx for field-level validation
- Imported by backend/routers/parse.py for parsed field validation
- Referenced by shared/types.ts for type-safe validation schemas
- Used by backend/services/ai_assistance.py for PII detection and redaction

Validation Architecture:
- Schema definitions using Zod for runtime type checking
- Cross-platform validation (works in both Node.js and browser)
- Composable validators for complex business rules
- Error reporting with field-specific messages and internationalization support
- Performance optimization for large-scale validation

Output:
- Typed validator functions (e.g., validateProfile(profile): Result<Valid, Errors>)
- These validators must be usable in both backend (input validation) and frontend (form checking)
*/

// TODO [0]: Shared schema validators for file upload, profile field rules
// TODO [0.1]: Add comprehensive validation rule composition and chaining
// TODO [0.2]: Implement custom validation error types with detailed context
// TODO [1]: Used in frontend form hooks and backend endpoints
// TODO [1.1]: Add jurisdiction-specific validation rules for legal entities
// TODO [1.2]: Add schema validation for complex document structures
// TODO [1.3]: Add business rule validation for legal document consistency
// TODO [1.4]: Add async validation support for external data verification
