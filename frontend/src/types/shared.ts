/**
 * Shared Types for FormMonkey Frontend
 * 
 * This is a copy of shared types for frontend-only workspaces.
 * In the full monorepo, these are imported from ../../../shared/types
 */

// Field-related type definitions for AI predictions and user corrections
export enum FieldType {
    TEXT = 'text',
    DATE = 'date',
    CURRENCY = 'currency',
    NUMBER = 'number',
    EMAIL = 'email',
    PHONE = 'phone',
    ADDRESS = 'address',
    NAME = 'name',
    SIGNATURE = 'signature',
    CHECKBOX = 'checkbox',
    PARTY = 'party',
    PAYMENT = 'payment'
}

/**
 * Enum representing reasons for user corrections
 */
export enum CorrectionReason {
    INCORRECT_VALUE = 'incorrect_value',
    INCOMPLETE_VALUE = 'incomplete_value',
    FORMATTING_ERROR = 'formatting_error',
    WRONG_FIELD = 'wrong_field',
    DUPLICATE_ENTRY = 'duplicate_entry',
    OTHER = 'other'
}

/**
 * Enum representing sources of AI predictions  
 */
export enum PredictionSource {
    REGEX = 'regex',
    ML_MODEL = 'ml_model',
    MANUAL = 'manual',
    USER_INPUT = 'user_input'
}

/**
 * AIPredictedField represents an AI-predicted field from a document with additional metadata
 */
export interface AIPredictedField {
    fieldId: string;
    label: string;
    predictedValue: string;
    confidence: number;
    fieldType: FieldType;
    source: PredictionSource;
    boundingBox?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    contextualText?: string;
    alternativePredictions?: Array<{
        value: string;
        confidence: number;
    }>;
}

/**
 * UserCorrection represents a correction made by a user to an AI prediction.
 */
export interface UserCorrection {
    originalPrediction: AIPredictedField;
    correctedValue: string;
    correctionReason: CorrectionReason;
    userFeedback?: string;
    timestamp: string;
}

/**
 * Field categories for organizing form fields
 */
export enum FieldCategory {
    PERSONAL = 'Personal Information',
    LEGAL = 'Legal Terms',
    FINANCIAL = 'Financial Details',
    DATES = 'Important Dates',
    PARTIES = 'Involved Parties',
    OTHER = 'Other'
}

/**
 * ParsedField represents a field extracted from a document
 */
export interface ParsedField {
    id: string;
    name: string;
    value: string;
    originalValue: string;
    confidence: number;
    category: FieldCategory;
    type: FieldType;
    isModified: boolean;
    suggestions?: string[];
    validationMessage?: string;
    isSaving?: boolean;
    lastSaved?: string;
}

/**
 * Document metadata interface
 */
export interface DocumentMetadata {
    filename: string;
    uploadedAt: string;
    pageCount: number;
    fileSize: number;
    fileType: string;
    jobId: string;
    extractedText?: string;
    processingStatus?: string;
    createdAt?: string;
    predictions?: AIPredictedField[];
    corrections?: UserCorrection[];
    processingMetrics?: {
        confidence: number;
        processingTimeMs: number;
        aiModelVersion: string;
    };
}

/**
 * Job status for tracking document processing
 */
export interface JobStatus {
    jobId: string;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    progress?: number;
    message?: string;
    result?: {
        extractedText?: string;
        fields?: ParsedField[];
        metadata?: DocumentMetadata;
    };
}

/**
 * User profile interface
 */
export interface Profile {
    id: string;
    fullName: string;
    email: string;
    company?: string;
    role?: string;
    preferences?: {
        defaultExportFormat?: string;
        autoFillFromProfile?: boolean;
    };
}

/**
 * Export job interface
 */
export interface ExportJob {
    jobId: string;
    status: string;
    downloadUrl?: string;
}

/**
 * Signing job interface
 */
export interface SigningJob {
    jobId: string;
    status: string;
    signingUrl?: string;
}
