/**
 * TypeScript Type System Strategy for FormMonkey
 * 
 * This file documents the approach for managing TypeScript types in the FormMonkey frontend,
 * with a focus on aligning with the shared type system.
 */

/**
 * DeprecationWarning is used to mark types that should no longer be used
 * and should be replaced with imports from the shared type system.
 */
export type DeprecationWarning<T> = T & {
  /** @deprecated This type is duplicated and should be imported from shared/types instead */
  _deprecationWarning?: never;
};

/**
 * Mark a type as deprecated with a migration path
 * This helps developers understand how to migrate from local types to shared types
 */
export function markAsDeprecated<T>(typeName: string): string {
  return `
/**
 * @deprecated This type is duplicated from shared types.
 * Please import { ${typeName} } from '@shared/types' instead.
 */`;
}

/**
 * Type Compatibility Guide
 * 
 * When working with types that exist in both TypeScript and Python,
 * follow these guidelines to ensure cross-platform compatibility:
 * 
 * 1. Use camelCase for all property names in TypeScript
 * 2. Ensure corresponding Python models use snake_case
 * 3. Add Zod schemas with identical validation rules as Pydantic
 * 4. Include JSDoc comments that match Python docstrings
 * 5. Use type aliases (export type X = Y) for better refactoring support
 * 6. Avoid using "any" - prefer unknown with type guards
 * 7. Use discriminated unions for polymorphic types
 */

/**
 * Type Migration Registry
 * 
 * This tracks the status of type migrations from local implementations to shared types
 */
export enum TypeMigrationStatus {
  Pending = 'pending',
  InProgress = 'in_progress',
  Completed = 'completed',
  Verified = 'verified'
}

export const TYPE_MIGRATION_REGISTRY = {
  // Core types
  DocumentMetadata: TypeMigrationStatus.Completed,
  UserProfile: TypeMigrationStatus.Completed,
  FileMetadata: TypeMigrationStatus.Completed,
  UploadMetadata: TypeMigrationStatus.Completed,
  
  // Enums
  ProcessingStatus: TypeMigrationStatus.Completed,
  FileStatus: TypeMigrationStatus.Completed,
  UploadStatus: TypeMigrationStatus.Completed,
  FieldType: TypeMigrationStatus.Completed,
  PredictionSource: TypeMigrationStatus.Completed,
  CorrectionReason: TypeMigrationStatus.Completed,
  
  // AI-related types (Phase 4)
  AIPredictedField: TypeMigrationStatus.Completed,
  UserCorrection: TypeMigrationStatus.Completed,
  AlternativePrediction: TypeMigrationStatus.Completed,
  
  // TODO: Add remaining types with their migration status
};
