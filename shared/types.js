/**
 * Shared TypeScript types for FormMonkey document processing platform.
 *
 * This module defines type interfaces used across frontend and backend components,
 * ensuring type safety and consistency throughout the application.
 */
import { z } from 'zod';
// Validation helpers
export const validateFileExtension = (filename, allowedExtensions) => {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    return allowedExtensions.includes(extension);
};
export const validateFileSize = (size, maxSize) => {
    return size > 0 && size <= maxSize;
};
// Runtime validator for UploadMetadata
export const UploadMetadataSchema = z.object({
    filename: z.string().min(1),
    fileSize: z.number().int().positive(),
    fileType: z.string().min(1),
    uploadStatus: z.enum(['queued', 'uploading', 'complete', 'failed']),
    jobId: z.string().uuid()
});
export const TextLocationSchema = z.object({
    startIndex: z.number().int(),
    endIndex: z.number().int(),
    surroundingText: z.string(),
    pageNumber: z.number().int().optional()
});
export const TextFieldPredictionSchema = z.object({
    fieldName: z.string().min(1),
    value: z.string(),
    confidence: z.number().min(0).max(1),
    source: z.enum(['regex', 'ml_model', 'manual', 'user_input']),
    locationInText: TextLocationSchema.optional()
});
// Field-related type definitions for AI predictions and user corrections
export var FieldType;
(function (FieldType) {
    FieldType["TEXT"] = "text";
    FieldType["DATE"] = "date";
    FieldType["CURRENCY"] = "currency";
    FieldType["NUMBER"] = "number";
    FieldType["EMAIL"] = "email";
    FieldType["PHONE"] = "phone";
    FieldType["ADDRESS"] = "address";
    FieldType["NAME"] = "name";
    FieldType["SIGNATURE"] = "signature";
    FieldType["CHECKBOX"] = "checkbox";
    FieldType["PARTY"] = "party";
    FieldType["PAYMENT"] = "payment";
})(FieldType || (FieldType = {}));
/**
 * Enum representing reasons for user corrections
 */
export var CorrectionReason;
(function (CorrectionReason) {
    CorrectionReason["INCORRECT_VALUE"] = "incorrect_value";
    CorrectionReason["INCOMPLETE_VALUE"] = "incomplete_value";
    CorrectionReason["FORMATTING_ERROR"] = "formatting_error";
    CorrectionReason["WRONG_FIELD"] = "wrong_field";
    CorrectionReason["DUPLICATE_ENTRY"] = "duplicate_entry";
    CorrectionReason["OTHER"] = "other";
})(CorrectionReason || (CorrectionReason = {}));
/**
 * Enum representing sources of AI predictions
 */
export var PredictionSource;
(function (PredictionSource) {
    PredictionSource["REGEX"] = "regex";
    PredictionSource["ML_MODEL"] = "ml_model";
    PredictionSource["MANUAL"] = "manual";
    PredictionSource["USER_INPUT"] = "user_input";
})(PredictionSource || (PredictionSource = {}));
export const FieldPredictionSchema = z.object({
    fieldId: z.string(),
    label: z.string().min(1),
    predictedValue: z.string(),
    confidence: z.number().min(0).max(1),
    fieldType: z.nativeEnum(FieldType),
    boundingBox: z.object({
        x: z.number(),
        y: z.number(),
        width: z.number().positive(),
        height: z.number().positive()
    }).optional()
});
export const AIPredictedFieldSchema = z.object({
    fieldId: z.string(),
    label: z.string().min(1),
    predictedValue: z.string(),
    confidence: z.number().min(0).max(1),
    fieldType: z.nativeEnum(FieldType),
    source: z.nativeEnum(PredictionSource),
    boundingBox: z.object({
        x: z.number(),
        y: z.number(),
        width: z.number().positive(),
        height: z.number().positive()
    }).optional(),
    contextualText: z.string().optional(),
    alternativePredictions: z.array(z.object({
        value: z.string(),
        confidence: z.number().min(0).max(1)
    })).optional()
});
export const UserCorrectionSchema = z.object({
    originalPrediction: AIPredictedFieldSchema,
    correctedValue: z.string(),
    correctionReason: z.nativeEnum(CorrectionReason),
    userFeedback: z.string().optional(),
    timestamp: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'timestamp must be a valid ISO8601 date string' })
});
export const ProfilePatchSchema = z.object({
    userId: z.string().uuid(),
    fieldUpdates: z.record(z.string(), z.any()),
    confidence: z.number().min(0).max(1),
    source: z.string().min(1),
    timestamp: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'timestamp must be a valid ISO8601 date string' })
});
export const DocumentMetadataSchema = z.object({
    jobId: z.string().uuid(),
    filename: z.string().min(1),
    pageCount: z.number().int().positive(),
    extractedText: z.string().optional(),
    processingStatus: z.enum(['queued', 'processing', 'completed', 'failed']),
    predictions: z.array(AIPredictedFieldSchema).optional(),
    corrections: z.array(UserCorrectionSchema).optional(),
    createdAt: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'createdAt must be a valid ISO8601 date string' })
});
export const ParseStatusSchema = z.object({
    jobId: z.string().uuid(),
    status: z.enum(['pending', 'running', 'completed', 'failed']),
    progress: z.number().min(0).max(100),
    result: z.any().optional(),
    error: z.string().optional()
});
/**
 * API endpoints for the FormMonkey application.
 * These constants are used across both frontend and backend for consistent API routing.
 */
export const API_ENDPOINTS = {
    UPLOAD: '/api/upload',
    DOCUMENTS: '/api/documents',
    PARSE: '/api/parse',
    USERS: '/api/users',
    PROFILES: '/api/profiles',
    AUTH: '/api/auth',
    EXPORT: '/api/export'
};
export const FileMetadataSchema = z.object({
    filename: z.string().min(1),
    upload_time: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'upload_time must be a valid ISO8601 date string' }),
    file_type: z.string().min(1),
    size_bytes: z.number().int().nonnegative(),
    status: z.enum(['pending', 'processing', 'complete', 'failed'])
});
/**
 * FieldCategory enum for categorizing document fields
 * Used to organize fields in the UI for better user experience
 */
export var FieldCategory;
(function (FieldCategory) {
    FieldCategory["PERSONAL"] = "Personal Information";
    FieldCategory["LEGAL"] = "Legal Terms";
    FieldCategory["FINANCIAL"] = "Financial Details";
    FieldCategory["DATES"] = "Important Dates";
    FieldCategory["PARTIES"] = "Involved Parties";
    FieldCategory["OTHER"] = "Other";
})(FieldCategory || (FieldCategory = {}));
/**
 * Runtime validation schema for ParsedField
 */
export const ParsedFieldSchema = z.object({
    id: z.string(),
    name: z.string().min(1),
    value: z.string(),
    originalValue: z.string(),
    confidence: z.number().min(0).max(1),
    category: z.nativeEnum(FieldCategory),
    type: z.nativeEnum(FieldType),
    isModified: z.boolean(),
    suggestions: z.array(z.string()).optional(),
    validationMessage: z.string().optional(),
    isSaving: z.boolean().optional(),
    lastSaved: z.string().optional()
});
// Development roadmap for future type system enhancements:
// TODO: Define canonical interfaces for Field, ProfileData, JobMeta
// TODO: Add comprehensive validation decorators for all interface fields
// TODO: Implement runtime type checking with detailed error messages
// TODO: Add field dependency mapping for complex form relationships
// TODO: Add granular progress states with percentage tracking
// TODO: Add multi-entity profile management with role-based access
// TODO: Add confidence scoring interfaces for AI predictions
