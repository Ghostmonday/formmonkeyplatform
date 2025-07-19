"""
Shared Pydantic models for FormMonkey data structures.

This module defines the core data models used across backend and frontend,
ensuring type safety and validation consistency throughout the application.
All models include JSON serialization support and comprehensive validation rules.

These models serve as the single source of truth for data structure definitions,
maintaining compatibility with parser_engine and ai_assistance return formats.
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

# TODO [0]: Define Pydantic models for shared field types (e.g., ParsedField, UserProfile)
# TODO [0.1]: Add JSON serialization support for each model
# TODO [1]: Include optional validation rules (e.g., regex, length)
# TODO [2]: Use type annotations that match frontend expectations
# TODO [3]: Ensure compatibility with parser_engine and ai_assistance return formats

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
