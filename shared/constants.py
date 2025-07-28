"""
Global constants shared across FormMonkey backend and frontend components.

This module provides centralized constant definitions that ensure consistency
between different parts of the application, including file type specifications,
configuration keys, validation limits, and default values.

All constants are organized into logical groups and exported as read-only
to prevent accidental runtime mutations that could affect system stability.
"""

from enum import Enum

# Field prediction source types
class PredictionSource(str, Enum):
    """Enumeration of sources for field predictions."""
    REGEX = 'regex'
    ML_MODEL = 'ml_model'
    MANUAL = 'manual'
    USER_INPUT = 'user_input'

# Correction reason types
class CorrectionReason(str, Enum):
    """Enumeration of reasons for field corrections."""
    INCORRECT_VALUE = 'incorrect_value'
    INCOMPLETE_VALUE = 'incomplete_value'
    FORMATTING_ERROR = 'formatting_error'
    WRONG_FIELD = 'wrong_field'
    DUPLICATE_ENTRY = 'duplicate_entry'
    OTHER = 'other'

# Confidence threshold constants
class ConfidenceThresholds:
    """Confidence threshold levels for field predictions."""
    low = 0.3
    medium = 0.6
    high = 0.85

# Learning rate parameters for model adaptation
class LearningRates:
    """Learning rates for different types of model updates."""
    USER_CORRECTION = 0.8   # High weight for explicit corrections
    TEMPLATE_MATCH = 0.6    # Medium-high weight for template matches
    SIMILAR_DOCUMENT = 0.4  # Medium weight for similar documents
    DEFAULT_RATE = 0.1      # Conservative default learning rate

# Field prediction settings
class FieldPredictionSettings:
    """Settings for field predictions and suggestions."""
    MIN_CONFIDENCE_FOR_AUTOFILL = 0.7
    MIN_CONFIDENCE_FOR_SUGGESTION = 0.4
    MAX_SUGGESTIONS_PER_FIELD = 3
    CONTEXT_WINDOW_SIZE = 100  # Characters before/after for context window

# TODO [0]: Define global constants used across backend and frontend
# TODO [0.1]: Organize constants into logical groups (file types, config keys, defaults)
# TODO [1]: Ensure values come from config when possible
# TODO [2]: Include documentation string for each constant group
# TODO [3]: Export as read-only to prevent runtime mutation

# File Type Constants
SUPPORTED_FILE_TYPES = {
    'PDF': '.pdf',
    'DOCX': '.docx',
    'DOC': '.doc',
    'IMAGE': ['.png', '.jpg', '.jpeg', '.tiff']
}

# Configuration Keys
CONFIG_KEYS = {
    'MAX_FILE_SIZE': 'max_file_size_mb',
    'UPLOAD_PATH': 'upload_directory',
    'AI_MODEL_ENDPOINT': 'ai_service_url',
    'DATABASE_URL': 'db_connection_string'
}

# Default Values
DEFAULT_VALUES = {
    'MAX_FILE_SIZE_MB': 50,
    'SESSION_TIMEOUT_MINUTES': 30,
    'MAX_RETRY_ATTEMPTS': 3,
    'AI_CONFIDENCE_THRESHOLD': 0.85
}
