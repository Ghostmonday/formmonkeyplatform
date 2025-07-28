"""
Type System Strategy for FormMonkey

This file documents the architectural approach for managing types across the FormMonkey platform.
It provides guidance on how to maintain type consistency between frontend (TypeScript) 
and backend (Python) implementations.
"""

from enum import Enum

class TypeMigrationStatus(str, Enum):
    """Tracks the migration status of types in the system."""
    PENDING = "pending"               # Type needs to be migrated to shared types
    IN_PROGRESS = "in_progress"       # Migration in progress
    COMPLETED = "completed"           # Migration complete
    VERIFIED = "verified"             # Migration verified with tests

# Type migration registry
# This documents the status of type migrations from local implementations to shared types
TYPE_MIGRATION_REGISTRY = {
    # Core types
    "DocumentMetadata": TypeMigrationStatus.COMPLETED,
    "UserProfile": TypeMigrationStatus.COMPLETED,
    "FileMetadata": TypeMigrationStatus.COMPLETED,
    "UploadMetadata": TypeMigrationStatus.COMPLETED,
    
    # Enums
    "ProcessingStatus": TypeMigrationStatus.COMPLETED,
    "FileStatus": TypeMigrationStatus.COMPLETED,
    "UploadStatus": TypeMigrationStatus.COMPLETED,
    "FieldType": TypeMigrationStatus.COMPLETED,
    "PredictionSource": TypeMigrationStatus.COMPLETED,
    "CorrectionReason": TypeMigrationStatus.COMPLETED,
    
    # AI-related types (Phase 4)
    "AIPredictedField": TypeMigrationStatus.COMPLETED,
    "UserCorrection": TypeMigrationStatus.COMPLETED,
    "AlternativePrediction": TypeMigrationStatus.COMPLETED,
    
    # TODO: Add remaining types with their migration status
}

class DeprecationStrategy:
    """Strategy for deprecating duplicate types."""
    
    @staticmethod
    def mark_deprecated(module_name: str, type_name: str) -> str:
        """Generate a deprecation notice for a type."""
        return f"""
        # DEPRECATED: This type is deprecated and will be removed in a future version.
        # Import from shared.types instead: from shared.types import {type_name}
        """
    
    @staticmethod
    def generate_migration_guide(type_name: str) -> str:
        """Generate migration guide for a type."""
        return f"""
        Migration Guide for {type_name}:
        
        1. Replace imports:
           - Frontend: import {{ {type_name} }} from '@shared/types';
           - Backend: from shared.types import {type_name}
           
        2. Update field names:
           - Frontend uses camelCase
           - Backend uses snake_case
           
        3. Ensure validation rules match between:
           - Zod schema in types.ts
           - Pydantic model in types.py
        """
