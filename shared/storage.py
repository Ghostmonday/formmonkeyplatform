"""
Secure file storage operations for FormMonkey application.

This module handles all file system operations with security as the primary concern.
Includes protection against directory traversal attacks, secure path handling,
and comprehensive audit logging for all file access operations.

All operations include retry logic for transient I/O errors and proper error handling
to ensure system stability and data integrity.
"""

import os
import shutil
import logging
from pathlib import Path
from typing import Union, Optional, BinaryIO
from contextlib import contextmanager
import time

# TODO [0]: Read/write files from disk using secure paths
# TODO [0.1]: Use config to determine base storage directory
# TODO [1]: Prevent directory traversal and injection attacks
# TODO [2]: Add retry logic for transient I/O errors
# TODO [3]: Include audit logging for all file access

logger = logging.getLogger(__name__)

class StorageError(Exception):
    """Base exception for storage operations."""
    pass

class SecurityError(StorageError):
    """Exception raised for security-related storage issues."""
    pass

def _validate_secure_path(base_path: Path, target_path: Union[str, Path]) -> Path:
    """
    Validate that target path is within base path to prevent directory traversal.
    
    Args:
        base_path: The allowed base directory
        target_path: The target path to validate
        
    Returns:
        Resolved secure path within base directory
        
    Raises:
        SecurityError: If path attempts directory traversal
    """
    base_path = base_path.resolve()
    target_path = Path(target_path)
    
    # Handle relative paths
    if not target_path.is_absolute():
        full_path = (base_path / target_path).resolve()
    else:
        full_path = target_path.resolve()
    
    # Ensure the resolved path is within base directory
    if not str(full_path).startswith(str(base_path)):
        raise SecurityError(f"Path traversal attempt detected: {target_path}")
    
    return full_path

def secure_write_file(base_dir: Union[str, Path], 
                     filename: str, 
                     content: Union[str, bytes],
                     max_retries: int = 3) -> Path:
    """
    Securely write content to a file within the base directory.
    
    Args:
        base_dir: Base directory for storage
        filename: Target filename
        content: Content to write
        max_retries: Maximum retry attempts for I/O errors
        
    Returns:
        Path to the written file
        
    Raises:
        StorageError: If write operation fails after retries
        SecurityError: If path validation fails
    """
    base_path = Path(base_dir)
    secure_path = _validate_secure_path(base_path, filename)
    
    logger.info(f"Writing file: {secure_path}")
    
    # Create parent directories if they don't exist
    secure_path.parent.mkdir(parents=True, exist_ok=True)
    
    for attempt in range(max_retries):
        try:
            mode = 'w' if isinstance(content, str) else 'wb'
            with open(secure_path, mode) as f:
                f.write(content)
            
            logger.info(f"Successfully wrote file: {secure_path}")
            return secure_path
            
        except (OSError, IOError) as e:
            logger.warning(f"Write attempt {attempt + 1} failed for {secure_path}: {e}")
            if attempt == max_retries - 1:
                logger.error(f"Failed to write file after {max_retries} attempts: {secure_path}")
                raise StorageError(f"Failed to write file: {e}")
            time.sleep(0.1 * (2 ** attempt))  # Exponential backoff

def secure_read_file(base_dir: Union[str, Path], 
                    filename: str,
                    binary_mode: bool = False,
                    max_retries: int = 3) -> Union[str, bytes]:
    """
    Securely read content from a file within the base directory.
    
    Args:
        base_dir: Base directory for storage
        filename: Target filename
        binary_mode: Whether to read in binary mode
        max_retries: Maximum retry attempts for I/O errors
        
    Returns:
        File content as string or bytes
        
    Raises:
        StorageError: If read operation fails after retries
        SecurityError: If path validation fails
    """
    base_path = Path(base_dir)
    secure_path = _validate_secure_path(base_path, filename)
    
    logger.info(f"Reading file: {secure_path}")
    
    for attempt in range(max_retries):
        try:
            mode = 'rb' if binary_mode else 'r'
            with open(secure_path, mode) as f:
                content = f.read()
            
            logger.info(f"Successfully read file: {secure_path}")
            return content
            
        except (OSError, IOError) as e:
            logger.warning(f"Read attempt {attempt + 1} failed for {secure_path}: {e}")
            if attempt == max_retries - 1:
                logger.error(f"Failed to read file after {max_retries} attempts: {secure_path}")
                raise StorageError(f"Failed to read file: {e}")
            time.sleep(0.1 * (2 ** attempt))  # Exponential backoff
