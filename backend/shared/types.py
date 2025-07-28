# shared/types.py - Shared type definitions for FormMonkey
# This file centralizes all type definitions to avoid duplication across the codebase
# Updated: Force Pylance cache refresh

from enum import Enum
from typing import Dict, List, Optional, Any
from datetime import datetime
from pydantic import BaseModel, Field, field_validator

# --- Enums ---

class ProcessingStatus(str, Enum):
    """Document processing status enum"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class FieldType(str, Enum):
    """Types of fields that can be extracted from documents"""
    TEXT = "text"
    DATE = "date"
    NAME = "name"
    ADDRESS = "address"
    AMOUNT = "amount"
    EMAIL = "email"
    PHONE = "phone"
    SIGNATURE = "signature"
    CHECKBOX = "checkbox"
    PARTY = "party"

class PredictionSource(str, Enum):
    """Source of a field prediction"""
    AI = "ai"
    RULE_BASED = "rule_based"
    USER = "user"
    PROFILE = "profile"

class CorrectionReason(str, Enum):
    """Reason for correcting a field"""
    LOW_CONFIDENCE = "low_confidence"
    WRONG_FIELD = "wrong_field"
    FORMATTING_ISSUE = "formatting_issue"
    INCORRECT_VALUE = "incorrect_value"
    OTHER = "other"

# --- Base Models ---

class FieldPosition(BaseModel):
    """Position of a field in the document"""
    x: float = 0
    y: float = 0
    width: float = 0
    height: float = 0

# --- API Models ---

class AIPredictedField(BaseModel):
    """AI-predicted field with enhanced metadata"""
    id: str
    name: str
    type: str
    predictedValue: str
    confidenceScore: float
    source: PredictionSource = PredictionSource.AI
    page: int = 1
    location: Optional[FieldPosition] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
                "name": "Party A",
                "type": "party",
                "predictedValue": "ACME Corporation",
                "confidenceScore": 0.85,
                "source": "ai",
                "page": 1,
                "location": {"x": 100, "y": 200, "width": 300, "height": 20}
            }
        }

class UserCorrection(BaseModel):
    """User correction for a predicted field"""
    originalPrediction: Dict[str, Any]
    correctedValue: str
    correctionReason: CorrectionReason
    timestamp: str
    
    @field_validator('timestamp')
    @classmethod
    def validate_timestamp(cls, v: str) -> str:
        """Ensure timestamp is in ISO format"""
        try:
            datetime.fromisoformat(v)
        except ValueError:
            try:
                # Try to parse as ISO format with Z
                if v.endswith('Z'):
                    datetime.fromisoformat(v.replace('Z', '+00:00'))
                else:
                    raise ValueError("Invalid timestamp format")
            except:
                raise ValueError("Invalid timestamp format")
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "originalPrediction": {
                    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
                    "name": "Party A",
                    "type": "party",
                    "predictedValue": "ACME Corp",
                    "confidenceScore": 0.65
                },
                "correctedValue": "ACME Corporation, Inc.",
                "correctionReason": "formatting_issue",
                "timestamp": "2025-07-25T14:30:00.000Z"
            }
        }

# Legacy models (for backward compatibility)
class FieldPrediction(BaseModel):
    """Legacy field prediction model - kept for backward compatibility"""
    id: str
    name: str
    type: str
    value: str
    confidence: float
    page: int = 1
    position: FieldPosition

class DocumentMetadata(BaseModel):
    """Enhanced document metadata including predictions and corrections"""
    document_id: str
    document_type: str
    processed_at: str
    predictions: List[AIPredictedField] = []
    corrections: List[UserCorrection] = []
    
    @field_validator('processed_at')
    @classmethod
    def validate_processed_at(cls, v: str) -> str:
        """Ensure timestamp is in ISO format"""
        try:
            datetime.fromisoformat(v)
        except ValueError:
            try:
                # Try to parse as ISO format with Z
                if v.endswith('Z'):
                    datetime.fromisoformat(v.replace('Z', '+00:00'))
                else:
                    raise ValueError("Invalid timestamp format")
            except:
                raise ValueError("Invalid timestamp format")
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "document_id": "doc-f47ac10b-58cc-4372-a567-0e02b2c3d479",
                "document_type": "Legal Contract",
                "processed_at": "2025-07-25T14:30:00.000Z",
                "predictions": [
                    {
                        "id": "field-1",
                        "name": "Party A",
                        "type": "party",
                        "predictedValue": "ACME Corporation",
                        "confidenceScore": 0.85,
                        "source": "ai",
                        "page": 1
                    }
                ],
                "corrections": []
            }
        }

class ParseStatusResponse(BaseModel):
    """Response model for parse status endpoint"""
    job_id: str
    status: ProcessingStatus
    progress: int
    content: Optional[str] = None
    error: Optional[str] = None

class FieldsResponse(BaseModel):
    """Response model for field predictions API"""
    job_id: str
    fields: List[FieldPrediction]  # Legacy field format
    ai_fields: List[AIPredictedField] = []  # New AI prediction format
    count: int
    document_type: str
    timestamp: str
    metadata: Optional[DocumentMetadata] = None

class FieldCorrection(BaseModel):
    """Legacy field correction model - kept for backward compatibility"""
    field_id: str
    name: Optional[str] = None
    value: Optional[str] = None
    type: Optional[str] = None
    is_correct: Optional[bool] = None

class EnhancedFieldCorrection(BaseModel):
    """Enhanced field correction with reason and timestamp"""
    field_id: str
    original_value: str
    corrected_value: str
    reason: CorrectionReason = CorrectionReason.OTHER
    timestamp: Optional[str] = None
    
    @field_validator('timestamp', mode='before')
    @classmethod
    def set_timestamp(cls, v: Optional[str]) -> str:
        return v or datetime.now().isoformat()

class CorrectionsRequest(BaseModel):
    """Request model for submitting corrections"""
    corrections: List[FieldCorrection]
    enhanced_corrections: List[EnhancedFieldCorrection] = []
    learn_preferences: bool = False

class CorrectionsResponse(BaseModel):
    """Response model for corrections endpoint"""
    job_id: str
    updated_count: int
    enhanced_count: int = 0
    profile_updated: bool
    message: str
    corrections: List[UserCorrection] = []

# --- Job Store Models ---

class JobData(BaseModel):
    """Data model for job store"""
    job_id: str
    status: ProcessingStatus = ProcessingStatus.PENDING
    progress: int = 0
    user_id: str
    file_path: str
    content: str = ""
    document_type: str = "Legal Document"
    error: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    metadata: Optional[Dict[str, Any]] = None
    predictions: List[Dict[str, Any]] = []
    corrections: List[Dict[str, Any]] = []

    def update_timestamp(self):
        """Update the updated_at timestamp"""
        self.updated_at = datetime.now().isoformat()

    class Config:
        json_schema_extra = {
            "example": {
                "job_id": "job-f47ac10b-58cc-4372-a567-0e02b2c3d479",
                "status": "completed",
                "progress": 100,
                "user_id": "user-1234",
                "file_path": "/path/to/document.pdf",
                "content": "Document text content...",
                "document_type": "Legal Contract",
                "created_at": "2025-07-25T14:30:00.000Z",
                "updated_at": "2025-07-25T14:35:00.000Z"
            }
        }
