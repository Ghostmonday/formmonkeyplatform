# services/storage_service.py - File storage service
# Provides functions for storing uploaded files and managing file storage

import os
from typing import Optional

# Base directory for file storage
STORAGE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")

# Ensure storage directory exists
os.makedirs(STORAGE_DIR, exist_ok=True)

async def store_file(filename: str, contents: bytes) -> str:
    """
    Store an uploaded file in the designated storage location.
    
    Args:
        filename: The name of the file to store
        contents: The binary contents of the file
        
    Returns:
        The absolute path to the stored file
    """
    # Create full file path
    file_path = os.path.join(STORAGE_DIR, filename)
    
    # Write file contents - no async IO for simplicity
    with open(file_path, 'wb') as f:
        f.write(contents)
    
    return file_path

async def get_file(file_id: str) -> Optional[str]:
    """
    Get the path to a previously stored file.
    
    Args:
        file_id: The ID of the file to retrieve
        
    Returns:
        The absolute path to the file, or None if not found
    """
    # Look for files with the given ID prefix
    for filename in os.listdir(STORAGE_DIR):
        if filename.startswith(file_id):
            return os.path.join(STORAGE_DIR, filename)
    
    return None

async def delete_file(file_path: str) -> bool:
    """
    Delete a stored file.
    
    Args:
        file_path: The path to the file to delete
        
    Returns:
        True if the file was deleted, False otherwise
    """
    try:
        os.remove(file_path)
        return True
    except (FileNotFoundError, PermissionError):
        return False
