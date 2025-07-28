# Document parsing API endpoints for FormMonkey legal document processing.
# All endpoints are standardized to match the shared/types.py definitions.

from fastapi import APIRouter, HTTPException, status, Depends, Body, BackgroundTasks
from typing import Optional, List, Dict, Any
from datetime import datetime
import asyncio
import uuid
import traceback

# Import ALL shared type definitions - no local redefinitions
from shared.types import (
    ProcessingStatus, PredictionSource, CorrectionReason,
    ParseStatusResponse, FieldPosition, AIPredictedField,
    UserCorrection, DocumentMetadata, FieldsResponse,
    FieldPrediction, FieldCorrection, EnhancedFieldCorrection,
    CorrectionsRequest, CorrectionsResponse, JobData
)

# Import services
from services.parser_engine import get_processing_status
from services.ai_assistance import predict_fields
from services.master_profile import update_user_field_preferences, get_user_profile
from auth.auth_utils import get_current_user, User

router = APIRouter()

@router.get("/parse/{job_id}/status", response_model=ParseStatusResponse)
async def get_parse_status(job_id: str):
    """
    Get the current status of a document parsing job.
    
    Args:
        job_id: Unique identifier of the parsing job
        
    Returns:
        ParseStatusResponse with job status, progress percentage, and extracted content if available
        
    Raises:
        HTTPException: If the job is not found
    """
    try:
        # Poll the parsing progress from job store
        job_status = await get_processing_status(job_id)
        
        if not job_status:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Parsing job with ID {job_id} not found"
            )
        
        # Convert status string to enum if needed
        status_value = job_status["status"]
        if isinstance(status_value, str):
            try:
                status_value = ProcessingStatus(status_value)
            except ValueError:
                # If invalid status value, default to PENDING
                status_value = ProcessingStatus.PENDING
        
        # Return status response
        return ParseStatusResponse(
            job_id=job_id,
            status=status_value,
            progress=job_status["progress"],
            content=job_status.get("content"),
            error=job_status.get("error")
        )
    except Exception as e:
        # Log the error
        error_detail = f"Error retrieving parsing status: {str(e)}\n{traceback.format_exc()}"
        print(error_detail)
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get parsing status: {str(e)}"
        )

@router.get("/parse/{job_id}/fields", response_model=FieldsResponse)
async def get_field_predictions(job_id: str, user: User = Depends(get_current_user)):
    """
    Get AI-predicted form fields from extracted document text.
    
    Args:
        job_id: Unique identifier of the parsing job
        user: Current authenticated user
        
    Returns:
        FieldsResponse with predicted fields, confidence scores, and suggested values
        
    Raises:
        HTTPException: If the job is not found or document processing is incomplete
    """
    try:
        # Get job status to ensure processing is complete
        job_status = await get_processing_status(job_id)
        
        if not job_status:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Parsing job with ID {job_id} not found"
            )
        
        # Check if processing is complete
        if job_status["status"] not in [ProcessingStatus.COMPLETED, "completed"]:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Document processing is not complete. Current status: {job_status['status']}"
        )
    
        # Get extracted text from the processing result
        extracted_text = job_status.get("content", "")
        if not extracted_text:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="No text content available from document processing"
            )
        
        # Get user profile for field suggestions
        user_profile = await get_user_profile(user.id)
        
        # Predict fields from extracted text
        document_type = job_status.get("document_type") or "Legal Document"
        field_predictions = await predict_fields(
            extracted_text, 
            user_profile,
            document_type=document_type
        )
        
        # Use AI fields directly from the prediction if available
        ai_fields = field_predictions.get("ai_fields", [])
        
        # If no AI fields available, transform legacy fields to new AI fields format
        if not ai_fields:
            for field in field_predictions.get("fields", []):
                ai_field = AIPredictedField(
                    id=field.get("id", str(uuid.uuid4())),
                    name=field.get("name", ""),
                    type=field.get("type", "text"),
                    predictedValue=field.get("value", ""),
                    confidenceScore=field.get("confidence", 0.0),
                    source=PredictionSource.RULE_BASED,
                    page=field.get("page", 1),
                    location=FieldPosition(
                        x=field.get("position", {}).get("x", 0),
                        y=field.get("position", {}).get("y", 0),
                        width=field.get("position", {}).get("width", 0),
                        height=field.get("position", {}).get("height", 0)
                    )
                )
                ai_fields.append(ai_field)
        
        # Create document metadata
        document_metadata = DocumentMetadata(
            document_id=job_id,
            document_type=field_predictions.get("document_type", "Legal Document"),
            processed_at=field_predictions.get("timestamp", datetime.now().isoformat()),
            predictions=ai_fields,
            corrections=[]
        )
        
        # Return prediction results with job ID and enhanced schema
        return FieldsResponse(
            job_id=job_id,
            fields=field_predictions.get("fields", []),
            ai_fields=ai_fields,
            count=field_predictions.get("count", 0),
            document_type=field_predictions.get("document_type", "Legal Document"),
            timestamp=field_predictions.get("timestamp", datetime.now().isoformat()),
            metadata=document_metadata
        )
    except Exception as e:
        # Log the error
        error_detail = f"Error predicting fields: {str(e)}\n{traceback.format_exc()}"
        print(error_detail)
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to predict fields: {str(e)}"
        )

@router.post("/parse/{job_id}/corrections", response_model=CorrectionsResponse)
async def submit_field_corrections(
    job_id: str, 
    corrections: CorrectionsRequest = Body(...), 
    user: User = Depends(get_current_user)
):
    """
    Submit user corrections to predicted fields and update master profile.
    
    Args:
        job_id: Unique identifier of the parsing job
        corrections: User corrections and learning preferences
        user: Current authenticated user
        
    Returns:
        CorrectionsResponse with update summary
        
    Raises:
        HTTPException: If the job is not found
    """
    try:
        # Verify job exists
        job_status = await get_processing_status(job_id)
    
        if not job_status:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Parsing job with ID {job_id} not found"
            )
        
        # Process traditional corrections
        updated_count = len(corrections.corrections)
        enhanced_count = len(corrections.enhanced_corrections)
        profile_updated = False
        
        # Convert enhanced corrections to UserCorrection objects
        user_corrections = []
        for ec in corrections.enhanced_corrections:
            user_correction = UserCorrection(
                originalPrediction={
                    "id": ec.field_id,
                    "predictedValue": ec.original_value
                },
                correctedValue=ec.corrected_value,
                correctionReason=ec.reason,
                timestamp=ec.timestamp or datetime.now().isoformat()
            )
            user_corrections.append(user_correction)
        
        # Learn from all corrections if requested
        if corrections.learn_preferences and (updated_count > 0 or enhanced_count > 0):
            # Process traditional corrections
            if updated_count > 0:
                # Convert FieldCorrection objects to dicts
                corrections_as_dicts = [correction.model_dump() for correction in corrections.corrections]
                profile_updated = await update_user_field_preferences(
                    user_id=user.id,
                    field_corrections=corrections_as_dicts,
                    document_type=job_status.get("document_type", "Legal Document")
                )
            
            # Process enhanced corrections
            if enhanced_count > 0:
                # Convert enhanced corrections to the format expected by update_user_field_preferences
                legacy_format_corrections = []
                for ec in corrections.enhanced_corrections:
                    legacy_format_corrections.append(
                        FieldCorrection(
                            field_id=ec.field_id,
                            value=ec.corrected_value,
                            is_correct=True
                        ).model_dump()  # Convert to dict
                    )
                
                enhanced_updated = await update_user_field_preferences(
                    user_id=user.id,
                    field_corrections=legacy_format_corrections,
                    document_type=job_status.get("document_type", "Legal Document")
                )
                profile_updated = profile_updated or enhanced_updated
        
        total_count = updated_count + enhanced_count
        
        return CorrectionsResponse(
            job_id=job_id,
            updated_count=total_count,
            enhanced_count=enhanced_count,
            profile_updated=profile_updated,
            message=f"Successfully processed {total_count} field corrections",
            corrections=user_corrections
        )
    except Exception as e:
        # Log the error
        error_detail = f"Error processing corrections: {str(e)}\n{traceback.format_exc()}"
        print(error_detail)
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process corrections: {str(e)}"
        )
