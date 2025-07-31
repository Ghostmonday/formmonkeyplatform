import { z } from 'zod';
import { FieldType, ProcessingStatus } from '@frommonkey/types';

// Zod schemas for validation
export const FormFieldSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
  value: z.any().optional(),
  required: z.boolean().optional(),
  validation: z.array(z.object({
    type: z.string(),
    message: z.string(),
    params: z.record(z.any()).optional()
  })).optional()
});

export const ValidationRuleSchema = z.object({
  type: z.string(),
  message: z.string(),
  params: z.record(z.any()).optional()
});

export const ProcessingResultSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  errors: z.array(z.string()).optional(),
  warnings: z.array(z.string()).optional()
});

export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional()
});

export const ExtractedFieldSchema = z.object({
  fieldName: z.string(),
  value: z.string(),
  confidence: z.number().min(0).max(1),
  bbox: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number()
  }).optional()
});

export const BoundingBoxSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number()
});

// Enum schemas
export const FieldTypeSchema = z.nativeEnum(FieldType);
export const ProcessingStatusSchema = z.nativeEnum(ProcessingStatus);

// Validation functions
export function validateEmail(email: string): boolean {
  const emailSchema = z.string().email();
  try {
    emailSchema.parse(email);
    return true;
  } catch {
    return false;
  }
}

export function validateRequired(value: any, fieldName: string): string | null {
  if (value === null || value === undefined || value === '') {
    return `${fieldName} is required`;
  }
  return null;
}

export function validateMinLength(value: string, minLength: number, fieldName: string): string | null {
  if (value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters long`;
  }
  return null;
}

export function validateMaxLength(value: string, maxLength: number, fieldName: string): string | null {
  if (value.length > maxLength) {
    return `${fieldName} must be at most ${maxLength} characters long`;
  }
  return null;
}

export * from '@frommonkey/types';
