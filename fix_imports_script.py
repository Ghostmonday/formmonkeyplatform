#!/usr/bin/env python3
"""
Update core type files for FormMonkey
This script updates the main type files with the fixed versions
"""

import os
from pathlib import Path

# Fixed shared/types.py content
FIXED_TYPES_PY = '''"""
Shared type definitions for FormMonkey
Central source of truth for all data structures
"""

from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional, Any, Union
from pydantic import BaseModel, Field, validator


# ============= ENUMS =============

class FieldType(Enum):
    """Unified field types for all document types"""
    # Personal Information
    PARTY_NAME = "party_name"
    PARTY_ADDRESS = "party_address"
    PARTY_EMAIL = "party_email"
    PARTY_PHONE = "party_phone"
    SIGNATORY_NAME = "signatory_name"
    SIGNATORY_TITLE = "signatory_title"
    
    # Financial Information
    PAYMENT_AMOUNT = "payment_amount"
    PAYMENT_TERMS = "payment_terms"
    INTEREST_RATE = "interest_rate"
    LATE_FEE = "late_fee"
    DEPOSIT_AMOUNT = "deposit_amount"
    
    # Legal Terms
    GOVERNING_LAW = "governing_law"
    JURISDICTION = "jurisdiction"
    VENUE = "venue"
    DISPUTE_RESOLUTION = "dispute_resolution"
    ARBITRATION_CLAUSE = "arbitration_clause"
    INDEMNIFICATION_CLAUSE = "indemnification_clause"
    LIMITATION_LIABILITY = "limitation_liability"
    CONFIDENTIALITY_CLAUSE = "confidentiality_clause"
    NON_COMPETE_CLAUSE = "non_compete_clause"
    
    # Dates
    AGREEMENT_DATE = "agreement_date"
    EFFECTIVE_DATE = "effective_date"
    TERMINATION_DATE = "termination_date"
    RENEWAL_DATE = "renewal_date"
    NOTICE_PERIOD = "notice_period"
    
    # Document Metadata
    DOCUMENT_TITLE = "document_title"
    DOCUMENT_NUMBER = "document_number"
    VERSION_NUMBER = "version_number"
    
    # Signatures
    SIGNATURE = "signature"
    SIGNATURE_DATE = "signature_date"
    WITNESS_SIGNATURE = "witness_signature"
    NOTARY_SEAL = "notary_seal"
    
    # Contract Specific
    SCOPE_OF_WORK = "scope_of_work"
    DELIVERABLES = "deliverables"
    WARRANTIES = "warranties"
    FORCE_MAJEURE = "force_majeure"
    ASSIGNMENT_RIGHTS = "assignment_rights"
    
    # Real Estate Specific
    PROPERTY_ADDRESS = "property_address"
    PROPERTY_DESCRIPTION = "property_description"
    PURCHASE_PRICE = "purchase_price"
    SQUARE_FOOTAGE = "square_footage"
    LOT_SIZE = "lot_size"


class FieldCategory(Enum):
    """Categories for grouping field types"""
    PERSONAL = "personal"
    FINANCIAL = "financial"
    LEGAL = "legal"
    DATES = "dates"
    SIGNATURES = "signatures"
    PROPERTY = "property"
    GENERAL = "general"


class DocumentType(Enum):
    """Types of legal documents"""
    CONTRACT = "contract"
    LEASE = "lease"
    PURCHASE_AGREEMENT = "purchase_agreement"
    NDA = "nda"
    EMPLOYMENT_AGREEMENT = "employment_agreement"
    SERVICE_AGREEMENT = "service_agreement"
    LOAN_AGREEMENT = "loan_agreement"
    PARTNERSHIP_AGREEMENT = "partnership_agreement"
    LICENSE_AGREEMENT = "license_agreement"
    OTHER = "other"


class ProcessingStatus(Enum):
    """Status of document processing job"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ConfidenceLevel(Enum):
    """Confidence level tiers for predictions"""
    HIGH = "high"  # > 0.8
    MEDIUM = "medium"  # 0.4 - 0.8
    LOW = "low"  # < 0.4


class CorrectionReason(Enum):
    """Reasons for user corrections"""
    INCORRECT_VALUE = "incorrect_value"
    MISSING_VALUE = "missing_value"
    WRONG_FORMAT = "wrong_format"
    PARTIAL_VALUE = "partial_value"
    WRONG_FIELD_TYPE = "wrong_field_type"
    CUSTOM = "custom"


class PredictionSource(Enum):
    """Source of field predictions"""
    AI_MODEL = "ai_model"
    REGEX_PATTERN = "regex_pattern"
    USER_PROFILE = "user_profile"
    DEFAULT_VALUE = "default_value"
    MANUAL_ENTRY = "manual_entry"


class ValidationErrorType(Enum):
    """Types of validation errors"""
    REQUIRED_FIELD = "required_field"
    INVALID_FORMAT = "invalid_format"
    INVALID_LENGTH = "invalid_length"
    INVALID_VALUE = "invalid_value"
    BUSINESS_RULE = "business_rule"


# ============= BASE MODELS =============

class DocumentMetadata(BaseModel):
    """Metadata about uploaded documents"""
    document_id: str
    document_type: DocumentType
    filename: str
    upload_timestamp: datetime
    page_count: int
    file_size_bytes: int
    mime_type: str
    user_id: str
    job_id: str


class ParsedField(BaseModel):
    """A single parsed field from a document"""
    field_type: FieldType
    value: str
    confidence: float = Field(ge=0.0, le=1.0)
    page_number: Optional[int] = None
    location: Optional[Dict[str, Any]] = None
    validation_errors: List[str] = Field(default_factory=list)
    metadata: Optional[Dict[str, Any]] = None


class AIPredictedField(BaseModel):
    """AI-predicted field with confidence and metadata"""
    field_type: FieldType
    predicted_value: str
    confidence: float = Field(ge=0.0, le=1.0)
    source_location: Optional[Dict[str, Any]] = None
    extraction_context: Optional[str] = None
    alternative_values: Optional[List[str]] = None
    model_version: str
    extracted_at: datetime
    prediction_source: PredictionSource = PredictionSource.AI_MODEL
    
    @property
    def confidence_level(self) -> ConfidenceLevel:
        """Get confidence tier based on score"""
        if self.confidence > 0.8:
            return ConfidenceLevel.HIGH
        elif self.confidence >= 0.4:
            return ConfidenceLevel.MEDIUM
        else:
            return ConfidenceLevel.LOW


class UserCorrection(BaseModel):
    """User correction for a predicted field"""
    field_type: FieldType
    original_value: Optional[str]
    corrected_value: str
    correction_reason: CorrectionReason
    custom_reason: Optional[str] = None
    confidence_before: float
    timestamp: datetime
    document_id: str
    user_id: str
    applied: bool = False


class ValidationError(BaseModel):
    """Validation error details"""
    field_type: FieldType
    error_type: ValidationErrorType
    message: str
    severity: str = "error"  # "error", "warning", "info"
    suggestion: Optional[str] = None


class JobData(BaseModel):
    """Job data for document processing"""
    job_id: str
    user_id: str
    document_id: str
    status: ProcessingStatus
    created_at: datetime
    updated_at: datetime
    parsed_fields: List[ParsedField] = Field(default_factory=list)
    validation_errors: List[ValidationError] = Field(default_factory=list)
    metadata: Optional[Dict[str, Any]] = None


class JobStatus(BaseModel):
    """Status response for job queries"""
    job_id: str
    status: ProcessingStatus
    progress: int = Field(ge=0, le=100)
    message: Optional[str] = None
    result: Optional[Dict[str, Any]] = None
    errors: List[str] = Field(default_factory=list)


class UploadResponse(BaseModel):
    """Response after document upload"""
    job_id: str
    document_id: str
    status: str
    message: str


class CorrectionPattern(BaseModel):
    """Learned pattern from user corrections"""
    field_type: FieldType
    pattern_type: str  # "format", "mapping", "regex"
    from_pattern: str
    to_pattern: str
    confidence: float
    occurrence_count: int
    last_seen: datetime
    user_id: str


class UserFieldPreference(BaseModel):
    """User-specific field preferences"""
    user_id: str
    field_type: FieldType
    preferred_format: Optional[str] = None
    common_values: List[str] = Field(default_factory=list)
    confidence_threshold: float = 0.6
    auto_accept: bool = False
    correction_patterns: List[CorrectionPattern] = Field(default_factory=list)
    accuracy_score: float = 0.0
    total_corrections: int = 0


class BatchCorrectionRequest(BaseModel):
    """Request for batch correction processing"""
    corrections: List[UserCorrection]
    batch_id: str
    priority: int = 0  # Higher = more urgent
    created_at: datetime
    document_type: DocumentType


class MLProviderConfig(BaseModel):
    """Configuration for ML providers"""
    provider_name: str
    api_key: Optional[str] = None
    endpoint_url: Optional[str] = None
    model_name: str
    max_retries: int = 3
    timeout_seconds: int = 30
    rate_limit_per_minute: Optional[int] = None
    enabled: bool = True


# ============= FIELD CATEGORY MAPPING =============

FIELD_CATEGORIES: Dict[FieldType, FieldCategory] = {
    # Personal fields
    FieldType.PARTY_NAME: FieldCategory.PERSONAL,
    FieldType.PARTY_ADDRESS: FieldCategory.PERSONAL,
    FieldType.PARTY_EMAIL: FieldCategory.PERSONAL,
    FieldType.PARTY_PHONE: FieldCategory.PERSONAL,
    FieldType.SIGNATORY_NAME: FieldCategory.PERSONAL,
    FieldType.SIGNATORY_TITLE: FieldCategory.PERSONAL,
    
    # Financial fields
    FieldType.PAYMENT_AMOUNT: FieldCategory.FINANCIAL,
    FieldType.PAYMENT_TERMS: FieldCategory.FINANCIAL,
    FieldType.INTEREST_RATE: FieldCategory.FINANCIAL,
    FieldType.LATE_FEE: FieldCategory.FINANCIAL,
    FieldType.DEPOSIT_AMOUNT: FieldCategory.FINANCIAL,
    FieldType.PURCHASE_PRICE: FieldCategory.FINANCIAL,
    
    # Legal fields
    FieldType.GOVERNING_LAW: FieldCategory.LEGAL,
    FieldType.JURISDICTION: FieldCategory.LEGAL,
    FieldType.VENUE: FieldCategory.LEGAL,
    FieldType.DISPUTE_RESOLUTION: FieldCategory.LEGAL,
    FieldType.ARBITRATION_CLAUSE: FieldCategory.LEGAL,
    FieldType.INDEMNIFICATION_CLAUSE: FieldCategory.LEGAL,
    FieldType.LIMITATION_LIABILITY: FieldCategory.LEGAL,
    FieldType.CONFIDENTIALITY_CLAUSE: FieldCategory.LEGAL,
    FieldType.NON_COMPETE_CLAUSE: FieldCategory.LEGAL,
    FieldType.FORCE_MAJEURE: FieldCategory.LEGAL,
    FieldType.WARRANTIES: FieldCategory.LEGAL,
    FieldType.ASSIGNMENT_RIGHTS: FieldCategory.LEGAL,
    
    # Date fields
    FieldType.AGREEMENT_DATE: FieldCategory.DATES,
    FieldType.EFFECTIVE_DATE: FieldCategory.DATES,
    FieldType.TERMINATION_DATE: FieldCategory.DATES,
    FieldType.RENEWAL_DATE: FieldCategory.DATES,
    FieldType.NOTICE_PERIOD: FieldCategory.DATES,
    FieldType.SIGNATURE_DATE: FieldCategory.DATES,
    
    # Signature fields
    FieldType.SIGNATURE: FieldCategory.SIGNATURES,
    FieldType.WITNESS_SIGNATURE: FieldCategory.SIGNATURES,
    FieldType.NOTARY_SEAL: FieldCategory.SIGNATURES,
    
    # Property fields
    FieldType.PROPERTY_ADDRESS: FieldCategory.PROPERTY,
    FieldType.PROPERTY_DESCRIPTION: FieldCategory.PROPERTY,
    FieldType.SQUARE_FOOTAGE: FieldCategory.PROPERTY,
    FieldType.LOT_SIZE: FieldCategory.PROPERTY,
    
    # General fields
    FieldType.DOCUMENT_TITLE: FieldCategory.GENERAL,
    FieldType.DOCUMENT_NUMBER: FieldCategory.GENERAL,
    FieldType.VERSION_NUMBER: FieldCategory.GENERAL,
    FieldType.SCOPE_OF_WORK: FieldCategory.GENERAL,
    FieldType.DELIVERABLES: FieldCategory.GENERAL,
}


# ============= HELPER FUNCTIONS =============

def get_field_category(field_type: FieldType) -> FieldCategory:
    """Get category for a field type"""
    return FIELD_CATEGORIES.get(field_type, FieldCategory.GENERAL)


def get_fields_by_category(category: FieldCategory) -> List[FieldType]:
    """Get all field types in a category"""
    return [ft for ft, cat in FIELD_CATEGORIES.items() if cat == category]


def get_field_validation_pattern(field_type: FieldType) -> Optional[str]:
    """Get validation regex pattern for a field type"""
    patterns = {
        FieldType.PARTY_EMAIL: r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
        FieldType.PARTY_PHONE: r'^\+?1?\d{10,14}$',
        FieldType.AGREEMENT_DATE: r'^\d{4}-\d{2}-\d{2}$',
        FieldType.EFFECTIVE_DATE: r'^\d{4}-\d{2}-\d{2}$',
        FieldType.TERMINATION_DATE: r'^\d{4}-\d{2}-\d{2}$',
        FieldType.PAYMENT_AMOUNT: r'^\$?\d+(\.\d{2})?$',
        FieldType.INTEREST_RATE: r'^\d+(\.\d+)?%?$',
    }
    return patterns.get(field_type)
'''

def update_type_files(project_root: str = "."):
    """Update the core type files with fixed versions"""
    project_path = Path(project_root)
    
    # Update shared/types.py
    types_py_path = project_path / "shared" / "types.py"
    if types_py_path.exists():
        print(f"Updating {types_py_path}...")
        types_py_path.write_text(FIXED_TYPES_PY)
        print("✅ Updated shared/types.py")
    else:
        print(f"❌ Could not find {types_py_path}")
    
    # Also check if there's a backend/shared/types.py
    backend_types_path = project_path / "backend" / "shared" / "types.py"
    if backend_types_path.exists():
        print(f"Updating {backend_types_path}...")
        backend_types_path.write_text(FIXED_TYPES_PY)
        print("✅ Updated backend/shared/types.py")
    
    print("\n📝 Next steps:")
    print("1. Update shared/types.ts with the TypeScript version from the artifact")
    print("2. Update shared/validators.ts with the fixed version from the artifact")
    print("3. Run: python -m py_compile shared/types.py")
    print("4. Run: npx tsc --noEmit shared/types.ts")

if __name__ == "__main__":
    update_type_files()