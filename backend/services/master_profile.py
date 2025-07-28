# services/master_profile.py - User profile management and learning system
# This module manages user preferences, field corrections, and intelligent suggestions

from typing import Dict, List, Any, Optional
from datetime import datetime

# Type aliases for better type safety
FieldPreferences = Dict[str, Any]
DocumentPreferences = Dict[str, FieldPreferences]
UserProfile = Dict[str, Any]

# Simple in-memory user profile store for demonstration
# In a production environment, this would be a database
user_profiles: Dict[str, UserProfile] = {}
profile_history: Dict[str, List[Dict[str, Any]]] = {}

async def get_user_profile(user_id: str) -> Dict[str, Any]:
    """
    Get a user's profile data.
    
    Args:
        user_id: The ID of the user
        
    Returns:
        User profile dictionary with preferences and defaults
    """
    # Return existing profile or create a new one
    if user_id not in user_profiles:
        user_profiles[user_id] = {
            "id": user_id,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "field_preferences": {},
            "document_preferences": {},
            "default_values": {}
        }
    
    return user_profiles[user_id]

async def update_user_profile(user_id: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Update a user's profile with new data.
    
    Args:
        user_id: The ID of the user
        profile_data: New profile data to merge
        
    Returns:
        Updated user profile
    """
    profile = await get_user_profile(user_id)
    
    # Update profile with new data
    profile.update(profile_data)
    profile["updated_at"] = datetime.now().isoformat()
    
    # Save updated profile
    user_profiles[user_id] = profile
    
    # Record history
    if user_id not in profile_history:
        profile_history[user_id] = []
    profile_history[user_id].append({
        "timestamp": profile["updated_at"],
        "changes": profile_data
    })
    
    return profile

async def update_user_field_preferences(
    user_id: str, 
    field_corrections: List[Dict[str, Any]], 
    document_type: str
) -> bool:
    """
    Update user profile with learned field preferences from corrections.
    
    Args:
        user_id: The ID of the user
        field_corrections: List of field corrections submitted by the user
        document_type: Type of document being corrected
        
    Returns:
        Boolean indicating success
    """
    if not field_corrections:
        return False
    
    profile = await get_user_profile(user_id)
    
    # Initialize field preferences for document type if needed
    if "field_preferences" not in profile:
        profile["field_preferences"] = {}
    if document_type not in profile["field_preferences"]:
        profile["field_preferences"][document_type] = {}
    
    # Process each correction
    for correction in field_corrections:
        field_name = correction.get("name")
        field_value = correction.get("value") 
        field_type = correction.get("type")
        is_correct = correction.get("is_correct", False)
        
        # Skip if no field name or value
        if not field_name or not field_value:
            continue
        
        # Learn from correction
        if field_name not in profile["field_preferences"][document_type]:
            profile["field_preferences"][document_type][field_name] = {
                "preferred_values": {},
                "type": field_type or "text",
                "last_updated": datetime.now().isoformat()
            }
        
        # Get and safely cast field preferences
        field_prefs = profile["field_preferences"][document_type][field_name]  # type: ignore
        assert isinstance(field_prefs, dict), "Field preferences must be a dictionary"
        
        # Update preferred values for the field
        if field_value not in field_prefs["preferred_values"]:
            field_prefs["preferred_values"][field_value] = 0
        
        # Increment count for this value if correct, otherwise decrement
        if is_correct:
            field_prefs["preferred_values"][field_value] += 1
        else:
            field_prefs["preferred_values"][field_value] -= 1
        
        field_prefs["last_updated"] = datetime.now().isoformat()
    
    # Update profile
    profile["updated_at"] = datetime.now().isoformat()
    user_profiles[user_id] = profile
    
    return True

async def get_field_suggestions(
    user_id: str, 
    field_name: str, 
    document_type: Optional[str] = None
) -> Dict[str, Any]:
    """
    Get field suggestions based on user profile preferences.
    
    Args:
        user_id: The ID of the user
        field_name: The name of the field
        document_type: Optional document type for context-specific suggestions
        
    Returns:
        Dictionary with suggested values and types
    """
    profile = await get_user_profile(user_id)
    
    suggestions: Dict[str, Any] = {
        "values": [],
        "type": "text",
        "confidence": 0.0
    }
    
    # Check if we have preferences for this field
    if "field_preferences" in profile:
        # First check document-specific preferences
        if document_type and document_type in profile["field_preferences"]:
            doc_prefs = profile["field_preferences"][document_type]
            if field_name in doc_prefs:
                field_prefs = doc_prefs[field_name]  # type: ignore
                suggestions["type"] = field_prefs.get("type", "text")
                
                # Get top values by preference count
                value_pairs = sorted(
                    field_prefs["preferred_values"].items(), 
                    key=lambda x: x[1], 
                    reverse=True
                )
                
                # Top 3 positive values
                suggestions["values"] = [pair[0] for pair in value_pairs if pair[1] > 0][:3]
                suggestions["confidence"] = 0.8 if suggestions["values"] else 0.0
        
        # If no document-specific preferences, check all preferences
        if not suggestions["values"]:
            for _, prefs in profile["field_preferences"].items():
                if field_name in prefs:
                    field_prefs = prefs[field_name]  # type: ignore
                    suggestions["type"] = field_prefs.get("type", "text")
                    
                    # Get top values by preference count
                    value_pairs = sorted(
                        field_prefs["preferred_values"].items(), 
                        key=lambda x: x[1], 
                        reverse=True
                    )
                    
                    # Top 3 positive values
                    suggestions["values"] = [pair[0] for pair in value_pairs if pair[1] > 0][:3]
                    suggestions["confidence"] = 0.6 if suggestions["values"] else 0.0
                    break
    
    return suggestions

# TODO [0]: Store/retrieve user info securely
# TODO [0.1]: Implement comprehensive profile validation and sanitization
# TODO [0.2]: Add audit logging for all profile modifications
# TODO [1]: Enable patch updates for field groups
# TODO [1.1]: Add field change tracking with history retention
# TODO [1.2]: Implement data encryption for sensitive profile fields
# TODO [2]: Integrate with config + ai_assistance for autofill
# TODO [2.1]: Add intelligent field mapping between profile and document types
# TODO [2.2]: Implement conflict resolution for overlapping field values
# TODO [3]: Return fields formatted for frontend PreviewPage
# TODO [3.1]: Add profile switching and management workflows
# TODO [3.2]: Add machine learning for profile enhancement suggestions
