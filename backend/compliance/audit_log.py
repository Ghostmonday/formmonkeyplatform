# compliance/audit_log.py - Compliance audit logging
# Provides functions for logging compliance-related events

import logging
from typing import Dict, Any
from datetime import datetime
import json
import os

# Set up logger
logger = logging.getLogger("compliance.audit")
logger.setLevel(logging.INFO)

# Create log directory if it doesn't exist
log_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "logs")
os.makedirs(log_dir, exist_ok=True)

# Set up file handler
file_handler = logging.FileHandler(os.path.join(log_dir, "compliance_audit.log"))
file_handler.setLevel(logging.INFO)

# Create formatter and add it to the handler
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
file_handler.setFormatter(formatter)

# Add handler to logger
logger.addHandler(file_handler)

def log_upload_event(user_id: str, filename: str, job_id: str, size: int) -> None:
    """
    Log a document upload event for compliance tracking.
    
    Args:
        user_id: ID of the user who uploaded the document
        filename: Original filename of the uploaded document
        job_id: Unique job ID assigned to the upload
        size: Size of the uploaded file in bytes
    """
    event: Dict[str, Any] = {
        "event_type": "document_upload",
        "user_id": user_id,
        "filename": filename,
        "job_id": job_id,
        "file_size": size,
        "timestamp": datetime.now().isoformat()
    }
    
    # Log the event
    logger.info(f"UPLOAD: {json.dumps(event)}")

def log_download_event(user_id: str, filename: str, job_id: str) -> None:
    """
    Log a document download event for compliance tracking.
    
    Args:
        user_id: ID of the user who downloaded the document
        filename: Filename of the downloaded document
        job_id: Unique job ID of the document
    """
    event: Dict[str, Any] = {
        "event_type": "document_download",
        "user_id": user_id,
        "filename": filename,
        "job_id": job_id,
        "timestamp": datetime.now().isoformat()
    }
    
    # Log the event
    logger.info(f"DOWNLOAD: {json.dumps(event)}")

def log_profile_change(user_id: str, change_type: str, details: Dict[str, Any]) -> None:
    """
    Log a profile change event for compliance tracking.
    
    Args:
        user_id: ID of the user whose profile was changed
        change_type: Type of change (e.g., 'update', 'delete', 'create')
        details: Details of the change
    """
    event: Dict[str, Any] = {
        "event_type": "profile_change",
        "user_id": user_id,
        "change_type": change_type,
        "details": details,
        "timestamp": datetime.now().isoformat()
    }
    
    # Log the event
    logger.info(f"PROFILE: {json.dumps(event)}")
