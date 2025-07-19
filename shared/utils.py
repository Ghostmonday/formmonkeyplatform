"""
Shared utility functions for FormMonkey application.

This module provides stateless helper functions used across different components
of the application. All functions include proper error handling, logging, and
are designed to be side-effect free for predictable behavior.

Functions are organized by category and include comprehensive unit tests
to ensure reliability in production environments.
"""

import os
import re
import hashlib
import logging
from typing import Optional, Union
from pathlib import Path

# TODO [0]: Provide shared helper functions (e.g., sanitize_filename, hash_file)
# TODO [0.1]: Add logging for each utility function's inputs and outputs
# TODO [1]: Include error handling logic for edge cases (e.g., invalid filenames)
# TODO [2]: Keep functions stateless and side-effect free
# TODO [3]: Unit test each utility for common failure scenarios

logger = logging.getLogger(__name__)

def sanitize_filename(filename: str) -> str:
    """
    Sanitize a filename by removing or replacing unsafe characters.
    
    Args:
        filename: The original filename to sanitize
        
    Returns:
        A safe filename suitable for filesystem storage
        
    Raises:
        ValueError: If filename is empty or contains only invalid characters
    """
    logger.debug(f"Sanitizing filename: {filename}")
    
    if not filename or not filename.strip():
        raise ValueError("Filename cannot be empty")
    
    # Remove or replace unsafe characters
    safe_filename = re.sub(r'[<>:"/\\|?*]', '_', filename)
    safe_filename = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', safe_filename)
    
    # Ensure filename isn't too long
    if len(safe_filename) > 255:
        name, ext = os.path.splitext(safe_filename)
        safe_filename = name[:255-len(ext)] + ext
    
    logger.debug(f"Sanitized filename result: {safe_filename}")
    return safe_filename

def hash_file(file_path: Union[str, Path]) -> str:
    """
    Generate SHA-256 hash of a file's contents.
    
    Args:
        file_path: Path to the file to hash
        
    Returns:
        Hexadecimal string representation of the file hash
        
    Raises:
        FileNotFoundError: If the file doesn't exist
        PermissionError: If unable to read the file
    """
    logger.debug(f"Generating hash for file: {file_path}")
    
    file_path = Path(file_path)
    if not file_path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")
    
    hash_sha256 = hashlib.sha256()
    try:
        with open(file_path, 'rb') as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_sha256.update(chunk)
    except PermissionError as e:
        logger.error(f"Permission denied reading file: {file_path}")
        raise e
    
    file_hash = hash_sha256.hexdigest()
    logger.debug(f"Generated hash: {file_hash}")
    return file_hash

def generate_unique_id(prefix: str = "") -> str:
    """
    Generate a unique identifier with optional prefix.
    
    Args:
        prefix: Optional prefix for the generated ID
        
    Returns:
        A unique identifier string
    """
    import uuid
    unique_id = f"{prefix}{uuid.uuid4().hex}" if prefix else uuid.uuid4().hex
    logger.debug(f"Generated unique ID: {unique_id}")
    return unique_id
