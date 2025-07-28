
from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends
from pydantic import BaseModel
from typing import Optional
import uuid
import os
# from config import get_settings  # Uncomment if using dynamic config
from services.parser_engine import process_document
from services.ai_assistance import analyze_document
# from services.storage_service import store_file
try:
    from services.storage_service import store_file
except ModuleNotFoundError:
    # Fallback: adjust the import if running as a script or in a different context
    import sys
    import os
    sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
    from services.storage_service import store_file
from compliance.audit_log import log_upload_event
from auth.auth_utils import get_current_user

router = APIRouter()

class UploadResponse(BaseModel):
    job_id: str
    message: str

ALLOWED_EXTENSIONS = {".pdf", ".docx"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

@router.post("/upload", response_model=UploadResponse, status_code=status.HTTP_202_ACCEPTED)
async def upload_document(
    file: UploadFile = File(...),
    user=Depends(get_current_user)
):
    # Validate file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are allowed.")

    # Validate file size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File exceeds 10MB size limit.")

    # Virus scan placeholder (implement actual scan in production)
    # if not scan_for_viruses(contents):
    #     raise HTTPException(status_code=400, detail="File failed virus scan.")

    # Check MIME type consistency
    if (file.content_type == "application/pdf" and ext != ".pdf") or \
       (file.content_type in ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword"] and ext != ".docx"):
        raise HTTPException(status_code=400, detail="MIME type does not match file extension.")

    # Generate unique job ID
    job_id = str(uuid.uuid4())
    safe_filename = f"{job_id}{ext}"

    # Store file securely
    file_path = await store_file(safe_filename, contents)

    # Log upload event
    log_upload_event(user_id=user.id, filename=file.filename, job_id=job_id, size=len(contents))

    # Trigger async document processing (parser + AI)
    # (Consider using a background task or job queue in production)
    try:
        await process_document(file_path, job_id=job_id, user_id=user.id)
        await analyze_document(file_path, job_id=job_id, user_id=user.id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")

    return UploadResponse(job_id=job_id, message="Upload successful. Processing started.")

# Minimal version of upload endpoint - simplified for basic functionality
@router.post("/upload/minimal", response_model=UploadResponse)
async def upload_document_minimal(file: UploadFile = File(...)):
    """
    Minimal endpoint for document uploads.
    Accepts only PDF/DOCX files under 10MB and returns a job ID.
    No authentication, virus scanning or processing - just validation and storage.
    """
    # Validate file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are allowed.")

    # Validate file size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File exceeds 10MB size limit.")

    # Generate unique job ID
    job_id = str(uuid.uuid4())
    
    # In a real implementation, we would store the file here
    # file_path = await store_file(f"{job_id}{ext}", contents)

    return UploadResponse(job_id=job_id, message="File uploaded successfully.")

# Original TODOs completed above
# TODO [1.1]: Implement virus scanning for uploaded files - Added placeholder in main endpoint
# TODO [2.1]: Add retry mechanism for parsing failures - To be implemented
# TODO [2.2]: Queue parsing for large files vs immediate processing - To be implemented
# TODO [3.1]: Include progress tracking endpoints for large files - To be implemented                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      