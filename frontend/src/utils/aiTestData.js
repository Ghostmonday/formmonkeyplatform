/**
 * [AI_SCHEMA_P4] - Mock data for AI predictions and corrections
 *
 * This file contains sample data for testing the new AI prediction and correction features.
 */
import { PredictionSource, CorrectionReason, FieldType } from '../types';
/**
 * Sample AI predictions for testing
 */
export const samplePredictions = [
    {
        fieldId: '3f4e5a7b-9c8d-4e5f-a6b7-c8d9e0f1a2b3',
        label: 'Full Name',
        predictedValue: 'John Smith',
        confidence: 0.96,
        fieldType: FieldType.NAME,
        source: PredictionSource.ML_MODEL,
        boundingBox: {
            x: 150,
            y: 200,
            width: 100,
            height: 20
        }
    },
    {
        fieldId: '4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d',
        label: 'Email Address',
        predictedValue: 'john.smith@example.com',
        confidence: 0.89,
        fieldType: FieldType.EMAIL,
        source: PredictionSource.ML_MODEL,
        boundingBox: {
            x: 150,
            y: 250,
            width: 200,
            height: 20
        }
    },
    {
        fieldId: '5b6c7d8e-9f0a-1b2c-3d4e-5f6a7b8c9d0e',
        label: 'Contract Amount',
        predictedValue: '$25,000',
        confidence: 0.78,
        fieldType: FieldType.CURRENCY,
        source: PredictionSource.REGEX,
        boundingBox: {
            x: 300,
            y: 400,
            width: 80,
            height: 20
        }
    },
    {
        fieldId: '6c7d8e9f-0a1b-2c3d-4e5f-6a7b8c9d0e1f',
        label: 'Contract Start Date',
        predictedValue: '2025-01-15',
        confidence: 0.65,
        fieldType: FieldType.DATE,
        source: PredictionSource.ML_MODEL,
        boundingBox: {
            x: 150,
            y: 350,
            width: 100,
            height: 20
        }
    },
    {
        fieldId: '7d8e9f0a-1b2c-3d4e-5f6a-7b8c9d0e1f2a',
        label: 'Signature',
        predictedValue: 'Present',
        confidence: 0.92,
        fieldType: FieldType.SIGNATURE,
        source: PredictionSource.ML_MODEL
    }
];
/**
 * Sample user corrections for testing
 */
export const sampleCorrections = [
    {
        originalPrediction: {
            fieldId: '5b6c7d8e-9f0a-1b2c-3d4e-5f6a7b8c9d0e',
            label: 'Contract Amount',
            predictedValue: '$25,000',
            confidence: 0.78,
            fieldType: FieldType.CURRENCY,
            source: PredictionSource.REGEX,
            boundingBox: {
                x: 300,
                y: 400,
                width: 80,
                height: 20
            }
        },
        correctedValue: '$27,500',
        correctionReason: CorrectionReason.WRONG_FIELD,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        userFeedback: 'Amount was in a different section'
    },
    {
        originalPrediction: {
            fieldId: '6c7d8e9f-0a1b-2c3d-4e5f-6a7b8c9d0e1f',
            label: 'Contract Start Date',
            predictedValue: '2025-01-15',
            confidence: 0.65,
            fieldType: FieldType.DATE,
            source: PredictionSource.ML_MODEL,
            boundingBox: {
                x: 150,
                y: 350,
                width: 100,
                height: 20
            }
        },
        correctedValue: '2025-02-01',
        correctionReason: CorrectionReason.INCORRECT_VALUE,
        timestamp: new Date(Date.now() - 7200000).toISOString()
    },
    {
        originalPrediction: {
            fieldId: '4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d',
            label: 'Email Address',
            predictedValue: 'john.smith@example.com',
            confidence: 0.89,
            fieldType: FieldType.EMAIL,
            source: PredictionSource.ML_MODEL,
            boundingBox: {
                x: 150,
                y: 250,
                width: 200,
                height: 20
            }
        },
        correctedValue: 'john.smith@company.com',
        correctionReason: CorrectionReason.FORMATTING_ERROR,
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        userFeedback: 'Company email should be used instead of personal email'
    }
];
/**
 * Add sample predictions and corrections to document metadata for testing
 * @param metadata The document metadata to enhance
 * @returns Enhanced document metadata with sample predictions and corrections
 */
export function enhanceMetadataWithAIData(metadata) {
    return {
        ...metadata,
        predictions: samplePredictions,
        corrections: sampleCorrections,
        processingMetrics: {
            confidence: 0.87,
            processingTimeMs: 2456,
            aiModelVersion: 'v2.1.0'
        }
    };
}
