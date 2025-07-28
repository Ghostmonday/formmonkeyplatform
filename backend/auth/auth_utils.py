# auth/auth_utils.py - Authentication utilities for FormMonkey
# Basic authentication and user management functions

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from pydantic import BaseModel

# Security scheme for JWT tokens
security = HTTPBearer()

class User(BaseModel):
    """User model for authentication"""
    id: str
    username: str
    email: Optional[str] = None

# Mock user for development - replace with real authentication in production
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """
    Get the current authenticated user from JWT token.
    
    Args:
        credentials: HTTP authorization credentials
        
    Returns:
        User object if authentication is successful
        
    Raises:
        HTTPException: If authentication fails
    """
    # For development, return a mock user
    # In production, this would validate the JWT token and return the real user
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Mock user for development
    return User(
        id="dev-user-123",
        username="developer",
        email="dev@formmonkey.com"
    )

async def get_optional_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[User]:
    """
    Get the current user if authenticated, None otherwise.
    
    Args:
        credentials: HTTP authorization credentials
        
    Returns:
        User object if authenticated, None otherwise
    """
    if not credentials or not credentials.credentials:
        return None
    
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None
