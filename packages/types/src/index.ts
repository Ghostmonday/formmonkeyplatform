// Core data types for FromMonkey
export interface FormField {
  id: string;
  name: string;
  type: string;
  value?: any;
  required?: boolean;
  validation?: ValidationRule[];
}

export interface ValidationRule {
  type: string;
  message: string;
  params?: Record<string, any>;
}

export interface ProcessingResult {
  success: boolean;
  data?: any;
  errors?: string[];
  warnings?: string[];
}

// API types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// AI Processing types
export interface ExtractedField {
  fieldName: string;
  value: string;
  confidence: number;
  bbox?: BoundingBox;
}

export interface AIPredictedField {
  fieldName: string;
  predictedValue: string;
  confidence: number;
  alternatives?: string[];
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CorrectionReason {
  field: string;
  reason: string;
  originalValue: string;
  correctedValue: string;
}

// Enums
export enum FieldType {
  TEXT = 'text',
  NUMBER = 'number',
  EMAIL = 'email',
  DATE = 'date',
  CHECKBOX = 'checkbox',
  SELECT = 'select'
}

export enum ProcessingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}
