"""
SINGLE SOURCE OF TRUTH: Shared Pydantic models for FormMonkey data structures.

This module defines the core data models used across backend and frontend,
ensuring type safety and validation consistency throughout the application.
All models include JSON serialization support and comprehensive validation rules.

ARCHITECTURE NOTE: These models are the ONLY authoritative definitions for data structures.
Local type definitions in frontend or backend code should be considered deprecated
and gradually replaced with imports from this module.

CROSS-PLATFORM CONTRACT: Every type defined here has a corresponding TypeScript interface
in types.ts with identical field names (camelCase vs snake_case) and validation rules.
Any changes must be synchronized between both implementations.

These models maintain compatibility with parser_engine and ai_assistance return formats.
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any, Set
from datetime import datetime
from enum import Enum
import os
from uuid import UUID
from .constants import PredictionSource, CorrectionReason

# Implementation of UploadMetadata with validation helpers
class UploadStatus(str, Enum):
    """Enumeration of possible upload statuses."""
    QUEUED = 'queued'
    UPLOADING = 'uploading'
    COMPLETE = 'complete'
    FAILED = 'failed'

class UploadMetadata(BaseModel):
    """Metadata for files being uploaded to the system."""
    filename: str = Field(..., min_length=1, max_length=255)
    file_size: int = Field(..., gt=0, description="Size of the file in bytes")
    file_type: str = Field(..., min_length=1, max_length=64)
    upload_status: UploadStatus = Field(default=UploadStatus.QUEUED)
    job_id: str = Field(..., description="Unique identifier for the upload job")
    
    class Config:
        use_enum_values = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            UUID: lambda v: str(v)
        }

# Validation helper functions
def validate_file_extension(filename: str, allowed_extensions: Set[str]) -> bool:
    """
    Validate that a file has an allowed extension.
    
    Args:
        filename: The name of the file to check
        allowed_extensions: Set of allowed extensions (without the dot)
        
    Returns:
        bool: True if the file extension is allowed, False otherwise
    """
    _, extension = os.path.splitext(filename)
    extension = extension.lower().lstrip('.')
    return extension in allowed_extensions

def validate_file_size(size: int, max_size: int) -> bool:
    """
    Validate that a file size is within the allowed limit.
    
    Args:
        size: The size of the file in bytes
        max_size: The maximum allowed size in bytes
        
    Returns:
        bool: True if the file size is within limits, False otherwise
    """
    return 0 < size <= max_size

class LegalDocFieldType(str, Enum):
    """Enumeration of field types commonly found in legal documents."""
    PARTY_NAME = "party_name"
    CONTRACT_DATE = "contract_date"
    PAYMENT_AMOUNT = "payment_amount"
    EMAIL_ADDRESS = "email_address"
    PHONE_NUMBER = "phone_number"
    ADDRESS = "address"
    SIGNATURE_DATE = "signature_date"
    FULL_NAME = "full_name"
    COMPANY_NAME = "company_name"
    CHECKBOX = "checkbox"
    TEXT = "text"
    CURRENCY = "currency"
    
    @classmethod
    def get_validation_pattern(cls, field_type):
        """
        Return a regex validation pattern for the given field type.
        
        Args:
            field_type: The LegalDocFieldType to get a pattern for
            
        Returns:
            str: A regex pattern for validation or None if no specific pattern
        """
        patterns = {
            cls.EMAIL_ADDRESS: r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
            cls.PHONE_NUMBER: r'^\+?[0-9]{10,15}$',
            cls.PAYMENT_AMOUNT: r'^\$?([0-9]{1,3},([0-9]{3},)*[0-9]{3}|[0-9]+)(\.[0-9]{2})?$',
            cls.CONTRACT_DATE: r'^(0[1-9]|1[0-2])/(0[1-9]|[12][0-9]|3[01])/\d{4}$',
            cls.SIGNATURE_DATE: r'^(0[1-9]|1[0-2])/(0[1-9]|[12][0-9]|3[01])/\d{4}$',
        }
        return patterns.get(field_type)

class BoundingBox(BaseModel):
    """Represents a bounding box for a field in a document."""
    x: float = Field(..., description="X coordinate (normalized 0-1 or in pixels)")
    y: float = Field(..., description="Y coordinate (normalized 0-1 or in pixels)")
    width: float = Field(..., gt=0, description="Width of the bounding box")
    height: float = Field(..., gt=0, description="Height of the bounding box")

class TextLocation(BaseModel):
    """Represents a location of text in a document."""
    start_index: int = Field(..., description="Start index of the text in the document")
    end_index: int = Field(..., description="End index of the text in the document")
    surrounding_text: str = Field(..., description="Text surrounding the field for context")
    page_number: Optional[int] = Field(None, description="Page number where the text is located")

class TextFieldPrediction(BaseModel):
    """Represents a field prediction with text location context."""
    field_name: str = Field(..., description="Name of the field")
    value: str = Field(..., description="The predicted value")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score between 0 and 1")
    source: PredictionSource = Field(..., description="Source of the prediction")
    location_in_text: Optional[TextLocation] = Field(None, description="Location in the document text")
    
    class Config:
        use_enum_values = True

class FieldPrediction(BaseModel):
    """Represents an AI prediction for a document field."""
    field_id: str = Field(..., description="Unique identifier for the field")
    label: str = Field(..., min_length=1, max_length=255)
    predicted_value: str = Field(..., description="The AI-predicted value")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score between 0 and 1")
    field_type: LegalDocFieldType = Field(..., description="Type of field being predicted")
    bounding_box: Optional[BoundingBox] = Field(None, description="Position in document")

    class Config:
        use_enum_values = True

class AlternativePrediction(BaseModel):
    """Represents an alternative prediction with lower confidence."""
    value: str = Field(..., description="The alternative predicted value")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score between 0 and 1")

class AIPredictedField(BaseModel):
    """Represents an AI-predicted field from a document with additional metadata."""
    field_id: str = Field(..., description="Unique identifier for the field")
    label: str = Field(..., min_length=1, max_length=255)
    predicted_value: str = Field(..., description="The AI-predicted value")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score between 0 and 1")
    field_type: LegalDocFieldType = Field(..., description="Type of field being predicted")
    source: PredictionSource = Field(..., description="Source of the prediction (regex, ML model, etc)")
    bounding_box: Optional[BoundingBox] = Field(None, description="Position in document")
    contextual_text: Optional[str] = Field(None, description="Surrounding text for context")
    alternative_predictions: Optional[List[AlternativePrediction]] = Field(None, description="Other possible values with lower confidence")

    class Config:
        use_enum_values = True

class UserCorrection(BaseModel):
    """Represents a correction made by a user to an AI prediction."""
    original_prediction: AIPredictedField = Field(..., description="The original AI prediction")
    corrected_value: str = Field(..., description="User-provided correct value")
    correction_reason: CorrectionReason = Field(..., description="Reason for the correction")
    user_feedback: Optional[str] = Field(None, description="Optional user feedback about the correction")
    timestamp: datetime = Field(..., description="When the correction was made")

    class Config:
        use_enum_values = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class ProfilePatch(BaseModel):
    """Represents an update to a user profile based on learning."""
    user_id: str = Field(..., description="ID of the user whose profile is being updated")
    field_updates: Dict[str, Any] = Field(..., description="Map of field names to new values")
    confidence: float = Field(..., ge=0.0, le=1.0)
    source: str = Field(..., min_length=1)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    @validator('timestamp', pre=True)
    def parse_timestamp(cls, v):
        if isinstance(v, str):
            try:
                return datetime.fromisoformat(v)
            except Exception:
                raise ValueError('timestamp must be a valid ISO8601 string')
        return v
    
    class Config:
        use_enum_values = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            UUID: lambda v: str(v)
        }

class ProcessingStatus(str, Enum):
    """Enumeration of document processing statuses."""
    QUEUED = 'queued'
    PROCESSING = 'processing'
    COMPLETED = 'completed'
    FAILED = 'failed'

class DocumentMetadata(BaseModel):
    """
    Metadata for processed documents.
    
    IMPORTANT: This is the canonical definition for document metadata.
    All frontend and backend code should import this model rather than
    defining local variants. This ensures consistency across the platform.
    
    TypeScript equivalent: DocumentMetadata interface in types.ts
    """
    job_id: str = Field(..., description="Unique identifier for the document processing job")
    filename: str = Field(..., min_length=1, max_length=255)
    page_count: int = Field(..., gt=0, description="Number of pages in the document")
    extracted_text: Optional[str] = Field(None, description="Full text extracted from the document")
    processing_status: ProcessingStatus = Field(...)
    predictions: Optional[List[AIPredictedField]] = Field(None, description="AI-generated field predictions")
    corrections: Optional[List[UserCorrection]] = Field(None, description="User corrections to predictions")
    created_at: datetime = Field(..., description="Timestamp when the document was created")

    @validator('created_at', pre=True)
    def parse_created_at(cls, v):
        if isinstance(v, str):
            try:
                return datetime.fromisoformat(v)
            except Exception:
                raise ValueError('created_at must be a valid ISO8601 string')
        return v
    
    class Config:
        use_enum_values = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            UUID: lambda v: str(v)
        }

class ParseStatusType(str, Enum):
    """Enumeration of parsing operation statuses."""
    PENDING = 'pending'
    RUNNING = 'running'
    COMPLETED = 'completed'
    FAILED = 'failed'

class ParseStatus(BaseModel):
    """Status of a parsing operation."""
    job_id: str = Field(..., description="Unique identifier for the parsing job")
    status: ParseStatusType = Field(...)
    progress: float = Field(..., ge=0, le=100, description="Progress percentage (0-100)")
    result: Optional[Any] = Field(None, description="Result of the parsing operation")
    error: Optional[str] = Field(None, description="Error message if the parsing failed")
    
    class Config:
        use_enum_values = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

# API endpoints for the FormMonkey application
class APIEndpoints:
    """API endpoints constants for the FormMonkey application."""
    UPLOAD = '/api/upload'
    DOCUMENTS = '/api/documents'
    PARSE = '/api/parse'
    USERS = '/api/users'
    PROFILES = '/api/profiles'
    AUTH = '/api/auth'
    EXPORT = '/api/export'

class FileStatus(str, Enum):
    PENDING = 'pending'
    PROCESSING = 'processing'
    COMPLETE = 'complete'
    FAILED = 'failed'

class FileMetadata(BaseModel):
    """Metadata for uploaded files."""
    filename: str = Field(..., min_length=1, max_length=255)
    upload_time: datetime = Field(..., description="Upload timestamp (UTC)")
    file_type: str = Field(..., min_length=1, max_length=64)
    size_bytes: int = Field(..., ge=0)
    status: FileStatus = Field(...)

    @validator('upload_time', pre=True)
    def parse_upload_time(cls, v):
        if isinstance(v, str):
            try:
                return datetime.fromisoformat(v)
            except Exception:
                raise ValueError('upload_time must be a valid ISO8601 string')
        return v

    class Config:
        use_enum_values = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class FieldType(str, Enum):
    """Enumeration of supported form field types."""
    TEXT = "text"
    EMAIL = "email"
    PHONE = "phone"
    DATE = "date"
    ADDRESS = "address"
    SIGNATURE = "signature"
    CHECKBOX = "checkbox"
    SELECT = "select"

class ParsedField(BaseModel):
    """Represents a field extracted from a legal document."""
    id: str = Field(..., description="Unique field identifier")
    name: str = Field(..., min_length=1, max_length=255)
    field_type: FieldType
    value: Optional[str] = None
    confidence: float = Field(..., ge=0.0, le=1.0)
    bounding_box: Optional[Dict[str, float]] = None
    validation_errors: List[str] = []
    metadata: Dict[str, Any] = {}

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class UserProfile(BaseModel):
    """User master profile for autofill functionality."""
    user_id: str = Field(..., description="Unique user identifier")
    full_name: Optional[str] = Field(None, max_length=255)
    email: Optional[str] = Field(None, regex=r'^[^@]+@[^@]+\.[^@]+$')
    phone: Optional[str] = Field(None, regex=r'^\+?1?[0-9]{10,15}$')
    address: Optional[str] = Field(None, max_length=500)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    @validator('email')
    def validate_email(cls, v):
        if v and '@' not in v:
            raise ValueError('Invalid email format')
        return v
