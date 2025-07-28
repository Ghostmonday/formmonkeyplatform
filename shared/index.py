"""
Type Export Helper for FormMonkey

This file provides a convenient way to import all shared types.
Backend code should import types from this file rather than
defining local variants.
"""

# Re-export all types from the main types.py file
from .types import *

# Re-export all constants
from .constants import *

# Type Compatibility Functions
import re
from typing import Dict, Any, List, Union, TypeVar, Optional, cast

T = TypeVar('T', bound=Dict[str, Any])

def to_camel_case(obj: Dict[str, Any]) -> Dict[str, Any]:
    """
    Convert snake_case property names to camelCase.
    Used when sending data to the frontend.
    
    Args:
        obj: A dictionary with snake_case keys
        
    Returns:
        A dictionary with camelCase keys
    """
    result: Dict[str, Any] = {}
    
    for key, value in obj.items():
        # Convert snake_case to camelCase
        components = key.split('_')
        camel_key = components[0] + ''.join(x.title() for x in components[1:])
        
        # Handle nested objects recursively
        if isinstance(value, dict):
            result[camel_key] = to_camel_case(value)
        elif isinstance(value, list):
            # Handle arrays
            result[camel_key] = [
                to_camel_case(item) if isinstance(item, dict) else item 
                for item in value
            ]
        else:
            result[camel_key] = value
    
    return result

def to_snake_case(obj: Dict[str, Any]) -> Dict[str, Any]:
    """
    Convert camelCase property names to snake_case.
    Used when receiving data from the frontend.
    
    Args:
        obj: A dictionary with camelCase keys
        
    Returns:
        A dictionary with snake_case keys
    """
    result: Dict[str, Any] = {}
    
    for key, value in obj.items():
        # Convert camelCase to snake_case
        snake_key = re.sub(r'(?<!^)(?=[A-Z])', '_', key).lower()
        
        # Handle nested objects recursively
        if isinstance(value, dict):
            result[snake_key] = to_snake_case(value)
        elif isinstance(value, list):
            # Handle arrays
            result[snake_key] = [
                to_snake_case(item) if isinstance(item, dict) else item 
                for item in value
            ]
        else:
            result[snake_key] = value
    
    return result

def validate_shared_type(obj: Dict[str, Any], model_class: Any) -> bool:
    """
    Validate that an object conforms to a shared type.
    Uses Pydantic model validation.
    
    Args:
        obj: The object to validate
        model_class: The Pydantic model class to validate against
        
    Returns:
        True if the object is valid, False otherwise
    """
    try:
        model_class(**obj)
        return True
    except Exception:
        return False
