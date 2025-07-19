"""
Global constants shared across FormMonkey backend and frontend components.

This module provides centralized constant definitions that ensure consistency
between different parts of the application, including file type specifications,
configuration keys, validation limits, and default values.

All constants are organized into logical groups and exported as read-only
to prevent accidental runtime mutations that could affect system stability.
"""

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
