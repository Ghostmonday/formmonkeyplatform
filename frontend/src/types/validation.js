/**
 * [AI_SCHEMA_P4] - Schema validation for FormMonkey frontend
 *
 * This file contains Zod schemas for runtime validation of our data models.
 */
import { z } from 'zod';
import { CorrectionReason, PredictionSource, FieldCategory, FieldType } from './index';
/**
 * Location schema for pinpointing field positions in documents
 */
export const LocationSchema = z.object({
    page: z.number().int().positive(),
    x: z.number().nonnegative(),
    y: z.number().nonnegative(),
    width: z.number().positive(),
    height: z.number().positive()
});
/**
 * Schema for AI-predicted fields
 */
export const AIPredictedFieldSchema = z.object({
    fieldId: z.string(),
    label: z.string().min(1),
    predictedValue: z.string(),
    confidence: z.number().min(0).max(1),
    source: z.nativeEnum(PredictionSource),
    boundingBox: z.object({
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number()
    }).optional(),
    fieldType: z.nativeEnum(FieldType)
});
/**
 * Schema for user corrections
 */
export const UserCorrectionSchema = z.object({
    originalPrediction: AIPredictedFieldSchema,
    correctedValue: z.string(),
    correctionReason: z.nativeEnum(CorrectionReason),
    userFeedback: z.string().optional(),
    timestamp: z.string()
});
/**
 * Schema for parsed fields
 */
export const ParsedFieldSchema = z.object({
    id: z.string().uuid(),
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
/**
 * Schema for processing metrics
 */
export const ProcessingMetricsSchema = z.object({
    confidence: z.number().min(0).max(1),
    processingTimeMs: z.number().nonnegative(),
    aiModelVersion: z.string()
});
/**
 * Schema for document metadata
 */
export const DocumentMetadataSchema = z.object({
    filename: z.string(),
    uploadedAt: z.string().datetime(),
    pageCount: z.number().int().positive(),
    fileSize: z.number().positive(),
    fileType: z.string(),
    jobId: z.string(),
    predictions: z.array(AIPredictedFieldSchema).optional(),
    corrections: z.array(UserCorrectionSchema).optional(),
    processingMetrics: ProcessingMetricsSchema.optional()
});
/**
 * Schema for job status
 */
export const JobStatusSchema = z.object({
    jobId: z.string(),
    status: z.enum(['queued', 'processing', 'completed', 'failed']),
    progress: z.number().min(0).max(100).optional(),
    message: z.string().optional(),
    result: z.object({
        extractedText: z.string().optional(),
        fields: z.array(ParsedFieldSchema).optional(),
        metadata: DocumentMetadataSchema.optional()
    }).optional()
});
