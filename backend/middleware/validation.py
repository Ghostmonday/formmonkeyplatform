"""
FormMonkey Backend Validation Middleware

Provides server-side validation using shared validators for security and data integrity.
Implements the backend side of the hybrid validation strategy.
"""

from typing import Any, Dict, List, Optional, Callable
from fastapi import HTTPException, Request, Response
from fastapi.routing import APIRoute
import json
import logging

# Import the shared validation functions (would need Python port or JS execution)
# For now, we'll implement equivalent Python validators

logger = logging.getLogger(__name__)

# ============================================================================
# VALIDATION RESULT TYPES
# ============================================================================

class ValidationError:
    def __init__(self, field: str, code: str, message: str, severity: str = 'error', context: Optional[Dict] = None):
        self.field = field
        self.code = code
        self.message = message
        self.severity = severity
        self.context = context or {}

    def to_dict(self) -> Dict[str, Any]:
        return {
            'field': self.field,
            'code': self.code,
            'message': self.message,
            'severity': self.severity,
            'context': self.context
        }

class ValidationResult:
    def __init__(self, is_valid: bool, data: Any = None, errors: List[ValidationError] = None, warnings: List[ValidationError] = None):
        self.is_valid = is_valid
        self.data = data
        self.errors = errors or []
        self.warnings = warnings or []

    def to_dict(self) -> Dict[str, Any]:
        return {
            'isValid': self.is_valid,
            'data': self.data,
            'errors': [error.to_dict() for error in self.errors],
            'warnings': [warning.to_dict() for warning in self.warnings]
        }

# ============================================================================
# CORE VALIDATORS (Python equivalent of shared/validators.ts)
# ============================================================================

class FieldValidators:
    @staticmethod
    def email(value: str) -> ValidationResult:
        import re
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        
        if re.match(email_pattern, value):
            return ValidationResult(True, value)
        
        return ValidationResult(
            False, 
            errors=[ValidationError('email', 'INVALID_EMAIL', 'Please enter a valid email address')]
        )

    @staticmethod
    def phone(value: str) -> ValidationResult:
        import re
        phone_pattern = r'^[\+]?[(]?[\+]?\d{1,4}[)]?[-\s\.]?\(?\d{1,3}\)?[-\s\.]?\d{1,4}[-\s\.]?\d{1,4}[-\s\.]?\d{1,9}$'
        
        if re.match(phone_pattern, value):
            return ValidationResult(True, value)
        
        return ValidationResult(
            False,
            errors=[ValidationError('phone', 'INVALID_PHONE', 'Please enter a valid phone number')]
        )

    @staticmethod
    def date(value: str) -> ValidationResult:
        from datetime import datetime
        
        try:
            # Try ISO format first
            datetime.fromisoformat(value.replace('Z', '+00:00'))
            return ValidationResult(True, value)
        except ValueError:
            try:
                # Try YYYY-MM-DD format
                datetime.strptime(value, '%Y-%m-%d')
                return ValidationResult(True, value)
            except ValueError:
                return ValidationResult(
                    False,
                    errors=[ValidationError('date', 'INVALID_DATE_FORMAT', 'Date must be in YYYY-MM-DD format')]
                )

    @staticmethod
    def text(value: str, min_length: Optional[int] = None, max_length: Optional[int] = None) -> ValidationResult:
        errors = []
        
        if min_length and len(value) < min_length:
            errors.append(ValidationError(
                'text', 
                'TEXT_TOO_SHORT', 
                f'Text must be at least {min_length} characters'
            ))
        
        if max_length and len(value) > max_length:
            errors.append(ValidationError(
                'text',
                'TEXT_TOO_LONG',
                f'Text must not exceed {max_length} characters'
            ))
        
        return ValidationResult(len(errors) == 0, value if len(errors) == 0 else None, errors)

    @staticmethod
    def currency(value: str) -> ValidationResult:
        import re
        # Remove currency symbols and spaces
        clean_value = re.sub(r'[$,\s]', '', value)
        currency_pattern = r'^\d+(\.\d{1,2})?$'
        
        if re.match(currency_pattern, clean_value):
            return ValidationResult(True, value)
        
        return ValidationResult(
            False,
            errors=[ValidationError('currency', 'INVALID_CURRENCY', 'Please enter a valid currency amount')]
        )

# ============================================================================
# FIELD VALIDATION
# ============================================================================

def validate_parsed_field(field_data: Dict[str, Any]) -> ValidationResult:
    """Validate a parsed field using the same logic as frontend"""
    errors = []
    warnings = []
    
    field_type = field_data.get('type', 'text')
    value = field_data.get('value', '').strip()
    field_name = field_data.get('name', 'field')
    
    # Skip validation for empty values
    if not value:
        return ValidationResult(True, field_data)
    
    # Type-specific validation
    if field_type == 'email':
        type_validation = FieldValidators.email(value)
    elif field_type == 'phone':
        type_validation = FieldValidators.phone(value)
    elif field_type == 'date':
        type_validation = FieldValidators.date(value)
    elif field_type == 'currency':
        type_validation = FieldValidators.currency(value)
    else:
        type_validation = FieldValidators.text(value)
    
    if not type_validation.is_valid:
        # Map generic field errors to specific field name
        for error in type_validation.errors:
            errors.append(ValidationError(
                field_name,
                error.code,
                error.message.replace(error.field, field_name),
                error.severity
            ))
    
    warnings.extend(type_validation.warnings)
    
    return ValidationResult(len(errors) == 0, field_data if len(errors) == 0 else None, errors, warnings)

# ============================================================================
# SECURITY VALIDATORS
# ============================================================================

class SecurityValidators:
    @staticmethod
    def sanitize_input(input_value: str) -> str:
        """Remove potentially dangerous content from input"""
        import re
        
        # Remove script tags
        input_value = re.sub(r'<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>', '', input_value, flags=re.IGNORECASE)
        
        # Remove javascript: urls
        input_value = re.sub(r'javascript:', '', input_value, flags=re.IGNORECASE)
        
        # Remove event handlers
        input_value = re.sub(r'on\w+\s*=\s*["\'][^"\']*["\']', '', input_value, flags=re.IGNORECASE)
        
        return input_value

    @staticmethod
    def detect_pii(text: str) -> List[ValidationError]:
        """Detect potential PII in text"""
        import re
        warnings = []
        
        # SSN pattern
        if re.search(r'\b\d{3}-?\d{2}-?\d{4}\b', text):
            warnings.append(ValidationError(
                'text',
                'POTENTIAL_SSN',
                'Text may contain Social Security Number',
                'warning'
            ))
        
        # Credit card pattern
        if re.search(r'\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b', text):
            warnings.append(ValidationError(
                'text',
                'POTENTIAL_CREDIT_CARD',
                'Text may contain credit card number',
                'warning'
            ))
        
        return warnings

    @staticmethod
    def validate_file_upload(file_data: Dict[str, Any]) -> ValidationResult:
        """Validate file upload data"""
        errors = []
        
        # Check file size
        max_size = 50 * 1024 * 1024  # 50MB
        if file_data.get('size', 0) > max_size:
            errors.append(ValidationError(
                'file_size',
                'FILE_TOO_LARGE',
                f'File size must not exceed {max_size // (1024*1024)}MB'
            ))
        
        # Check file type
        allowed_types = ['.pdf', '.doc', '.docx', '.txt']
        filename = file_data.get('filename', '')
        if not any(filename.lower().endswith(ext) for ext in allowed_types):
            errors.append(ValidationError(
                'file_type',
                'INVALID_FILE_TYPE',
                f'File type must be one of: {", ".join(allowed_types)}'
            ))
        
        return ValidationResult(len(errors) == 0, file_data if len(errors) == 0 else None, errors)

# ============================================================================
# VALIDATION MIDDLEWARE
# ============================================================================

class ValidationRoute(APIRoute):
    """Custom route class that provides automatic request validation"""
    
    def __init__(self, *args, validation_schema: Optional[Callable] = None, **kwargs):
        super().__init__(*args, **kwargs)
        self.validation_schema = validation_schema

    def get_route_handler(self) -> Callable:
        original_route_handler = super().get_route_handler()

        async def custom_route_handler(request: Request) -> Response:
            # Pre-process validation
            if self.validation_schema and request.method in ['POST', 'PUT', 'PATCH']:
                try:
                    request_data = await request.json()
                    
                    # Sanitize inputs
                    sanitized_data = self._sanitize_request_data(request_data)
                    
                    # Validate using schema
                    validation_result = self.validation_schema(sanitized_data)
                    
                    if not validation_result.is_valid:
                        raise HTTPException(
                            status_code=400,
                            detail={
                                'message': 'Validation failed',
                                'validation': validation_result.to_dict()
                            }
                        )
                    
                    # Replace request data with validated data
                    request._json = validation_result.data
                    
                except json.JSONDecodeError:
                    raise HTTPException(
                        status_code=400,
                        detail={'message': 'Invalid JSON in request body'}
                    )
            
            # Call original handler
            return await original_route_handler(request)

        return custom_route_handler

    def _sanitize_request_data(self, data: Any) -> Any:
        """Recursively sanitize request data"""
        if isinstance(data, dict):
            return {key: self._sanitize_request_data(value) for key, value in data.items()}
        elif isinstance(data, list):
            return [self._sanitize_request_data(item) for item in data]
        elif isinstance(data, str):
            return SecurityValidators.sanitize_input(data)
        else:
            return data

# ============================================================================
# VALIDATION DECORATORS
# ============================================================================

def validate_request(schema_fn: Callable):
    """Decorator for adding validation to route handlers"""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            # Extract request from args/kwargs
            request = None
            for arg in args:
                if isinstance(arg, Request):
                    request = arg
                    break
            
            if request and request.method in ['POST', 'PUT', 'PATCH']:
                try:
                    request_data = await request.json()
                    validation_result = schema_fn(request_data)
                    
                    if not validation_result.is_valid:
                        raise HTTPException(
                            status_code=400,
                            detail={
                                'message': 'Request validation failed',
                                'errors': [error.to_dict() for error in validation_result.errors]
                            }
                        )
                    
                    # Log validation warnings
                    if validation_result.warnings:
                        logger.warning(f"Validation warnings: {[w.to_dict() for w in validation_result.warnings]}")
                    
                except json.JSONDecodeError:
                    raise HTTPException(
                        status_code=400,
                        detail={'message': 'Invalid JSON in request body'}
                    )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator

# ============================================================================
# EXAMPLE USAGE
# ============================================================================

def validate_profile_request(data: Dict[str, Any]) -> ValidationResult:
    """Example validation function for profile requests"""
    errors = []
    warnings = []
    
    # Required fields
    required_fields = ['fullName', 'email']
    for field in required_fields:
        if not data.get(field):
            errors.append(ValidationError(
                field,
                'REQUIRED_FIELD',
                f'{field} is required'
            ))
    
    # Validate email
    if data.get('email'):
        email_validation = FieldValidators.email(data['email'])
        if not email_validation.is_valid:
            errors.extend(email_validation.errors)
    
    # Check for PII in text fields
    for field_name, value in data.items():
        if isinstance(value, str):
            pii_warnings = SecurityValidators.detect_pii(value)
            warnings.extend(pii_warnings)
    
    return ValidationResult(len(errors) == 0, data if len(errors) == 0 else None, errors, warnings)

# Usage in FastAPI routes:
# @app.post("/api/profile")
# @validate_request(validate_profile_request)
# async def create_profile(request: Request):
#     data = await request.json()
#     # data is already validated and sanitized
#     return {"success": True}
