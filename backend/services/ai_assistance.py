# AI assistance service for FormMonkey
# Provides field prediction and document analysis capabilities

import re
import os
import uuid
from datetime import datetime
from typing import Dict, List, Any, Optional, Union, Callable
from enum import Enum

# Import shared type definitions
from shared.types import (
    FieldType, PredictionSource, AIPredictedField, 
    FieldPrediction as SharedFieldPrediction,
    FieldPosition
)

# ML model configuration
ML_MODEL_ENABLED = os.environ.get("ML_MODEL_ENABLED", "false").lower() == "true"
ML_MODEL_TYPE = os.environ.get("ML_MODEL_TYPE", "local")  # local, openai, anthropic
ML_MODEL_CONFIDENCE_THRESHOLD = float(os.environ.get("ML_MODEL_CONFIDENCE_THRESHOLD", "0.6"))

# Model registry - maps model names to implementation functions
model_registry: Dict[str, Callable] = {}

class LegacyFieldPrediction:
    """Legacy field prediction class - for backward compatibility"""
    def __init__(self, name: str, field_type: FieldType, value: str, confidence: float, 
                 page: int = 1, position: Dict[str, float] = None):
        self.id = str(uuid.uuid4())
        self.name = name
        self.field_type = field_type
        self.value = value
        self.confidence = confidence
        self.page = page
        self.position = position or {"x": 0, "y": 0, "width": 0, "height": 0}
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary format for API response"""
        return {
            "id": self.id,
            "name": self.name,
            "type": self.field_type,
            "value": self.value,
            "confidence": self.confidence,
            "page": self.page,
            "position": self.position
        }
    
    def to_enhanced_model(self) -> AIPredictedField:
        """Convert to enhanced AIPredictedField model"""
        return AIPredictedField(
            id=self.id,
            name=self.name,
            type=self.field_type,
            predictedValue=self.value,
            confidenceScore=self.confidence,
            source=PredictionSource.RULE_BASED,
            page=self.page,
            location=FieldPosition(**self.position)
        )

async def analyze_document(file_path: str, job_id: str, user_id: str) -> Dict[str, Any]:
    """Analyze document and enrich with AI insights - placeholder implementation"""
    return {
        "job_id": job_id,
        "status": "completed",
        "insights": {
            "document_type": "Legal Contract",
            "complexity_score": 0.75,
            "suggestions": ["Check signature blocks", "Verify effective date"]
        }
    }

async def predict_fields(extracted_text: str, user_profile: Optional[Dict[str, Any]] = None, 
                     document_type: str = None) -> Dict[str, Any]:
    """
    Use pattern matching and/or ML models to identify legal document fields.
    
    Args:
        extracted_text: The text content extracted from the document
        user_profile: Optional user profile with historical data for field suggestions
        document_type: Optional document type for specialized field extraction
        
    Returns:
        Dictionary with identified fields and their predictions
    """
    # Legacy format predictions (for backward compatibility)
    legacy_predictions = []
    
    # Enhanced format predictions (new API format)
    enhanced_predictions = []
    
    # Determine whether to use ML model or fallback to regex
    use_ml = ML_MODEL_ENABLED and ML_MODEL_TYPE in model_registry
    
    if use_ml:
        # Use ML model for prediction
        try:
            ml_results = await predict_fields_with_ml(
                extracted_text, 
                document_type=document_type
            )
            
            # Convert ML results to both formats
            for result in ml_results:
                # For legacy format
                legacy_predictions.append(LegacyFieldPrediction(
                    name=result["name"],
                    field_type=result["type"],
                    value=result["value"],
                    confidence=result["confidence"],
                    page=result.get("page", 1),
                    position=result.get("position", {"x": 0, "y": 0, "width": 0, "height": 0})
                ))
                
                # For enhanced format
                enhanced_predictions.append(AIPredictedField(
                    id=result.get("id", str(uuid.uuid4())),
                    name=result["name"],
                    type=result["type"],
                    predictedValue=result["value"],
                    confidenceScore=result["confidence"],
                    source=PredictionSource.AI,
                    page=result.get("page", 1),
                    location=FieldPosition(**(result.get("position", {"x": 0, "y": 0, "width": 0, "height": 0})))
                ))
        except Exception as e:
            # Log the error but continue with regex fallback
            print(f"ML model prediction failed: {str(e)}. Falling back to regex patterns.")
            use_ml = False
    
    # If ML model not available or failed, use regex patterns
    if not use_ml:
        # Identify party names (simple pattern matching)
        party_patterns = [
            r"(?:BETWEEN|AMONG)[\s:]+([\w\s,\.]+)(?:AND|&)([\w\s,\.]+)",
            r"(?:This\s+[A-Za-z]+)\s+is\s+made.*?by\s+and\s+between\s+([\w\s,\.]+)(?:,|and)([\w\s,\.]+)",
            r"(?:Party A|First Party|Lessor|Landlord|Seller|Vendor)[\s:]+([\w\s,\.]+)",
            r"(?:Party B|Second Party|Lessee|Tenant|Buyer|Purchaser)[\s:]+([\w\s,\.]+)"
        ]
        
        for pattern in party_patterns:
            matches = re.finditer(pattern, extracted_text, re.IGNORECASE)
            for match in matches:
                groups = match.groups()
                for i, group in enumerate(groups):
                    party_name = group.strip()
                    if party_name and len(party_name) > 2:  # Basic validation
                        party_label = f"Party {chr(65+i)}"  # Party A, Party B, etc.
                        
                        # Create a unique ID for this prediction
                        field_id = str(uuid.uuid4())
                        
                        # For legacy format
                        legacy_predictions.append(LegacyFieldPrediction(
                            name=party_label,
                            field_type=FieldType.PARTY,
                            value=party_name,
                            confidence=0.85,
                            page=1
                        ))
                        
                        # For enhanced format
                        enhanced_predictions.append(AIPredictedField(
                            id=field_id,
                            name=party_label,
                            type=FieldType.PARTY,
                            predictedValue=party_name,
                            confidenceScore=0.85,
                            source=PredictionSource.RULE_BASED,
                            page=1,
                            location=FieldPosition(x=0, y=0, width=0, height=0)
                        ))
        
        # Identify dates
        date_patterns = [
            r"(?:dated|effective date|as of)[\s:]+([\w\s,\.]+\d{1,2}(?:st|nd|rd|th)?[\s,]*(?:day of)?[\s,]*\w+[\s,]*\d{4})",
            r"(?:dated|effective date|as of)[\s:]+((?:January|February|March|April|May|June|July|August|September|October|November|December)[\s,]+\d{1,2}(?:st|nd|rd|th)?[\s,]*\d{4})",
            r"(?:date|dated|effective|executed on)[\s:]+((?:\d{1,2}\/\d{1,2}\/\d{2,4}))",
            r"(?:date|dated|effective|executed on)[\s:]+((?:\d{1,2}\-\d{1,2}\-\d{2,4}))",
        ]
    
    for pattern in date_patterns:
        matches = re.finditer(pattern, extracted_text, re.IGNORECASE)
        for match in matches:
            date_str = match.group(1).strip()
            field_id = str(uuid.uuid4())
            
            # For legacy format
            legacy_predictions.append(LegacyFieldPrediction(
                name="Effective Date",
                field_type=FieldType.DATE,
                value=date_str,
                confidence=0.80,
                page=1
            ))
            
            # For enhanced format
            enhanced_predictions.append(AIPredictedField(
                id=field_id,
                name="Effective Date",
                type=FieldType.DATE,
                predictedValue=date_str,
                confidenceScore=0.80,
                source=PredictionSource.RULE_BASED,
                page=1,
                location=FieldPosition(x=0, y=0, width=0, height=0)
            ))
    
    # Identify monetary amounts
    amount_patterns = [
        r"(?:amount|sum|fee|price|total|payment|consideration)[\s:]+((?:USD|US\$|\$|€|£)?[\s]*(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{2})?(?:\s*(?:dollars|USD|euros|pounds))?)",
        r"(?:amount|sum|fee|price|total|payment|consideration)[\s:]+(?:USD|US\$|\$|€|£)?[\s]*(\d+(?:\.\d{2})?)"
    ]
    
    for pattern in amount_patterns:
        matches = re.finditer(pattern, extracted_text, re.IGNORECASE)
        for match in matches:
            amount_str = match.group(1).strip()
            field_id = str(uuid.uuid4())
            
            # For legacy format
            legacy_predictions.append(LegacyFieldPrediction(
                name="Payment Amount",
                field_type=FieldType.AMOUNT,
                value=amount_str,
                confidence=0.75,
                page=1
            ))
            
            # For enhanced format
            enhanced_predictions.append(AIPredictedField(
                id=field_id,
                name="Payment Amount",
                type=FieldType.AMOUNT,
                predictedValue=amount_str,
                confidenceScore=0.75,
                source=PredictionSource.RULE_BASED,
                page=1,
                location=FieldPosition(x=0, y=0, width=0, height=0)
            ))
    
    # Apply user profile suggestions if available
    if user_profile:
        await enrich_predictions_with_profile(legacy_predictions, enhanced_predictions, user_profile)
    
    # Get document type
    doc_type = document_type or detect_document_type(extracted_text)
    
    # Create timestamp
    timestamp = datetime.now().isoformat()
    
    # Return both legacy and enhanced formats
    return {
        "fields": [p.to_dict() for p in legacy_predictions],
        "ai_fields": [p.dict() for p in enhanced_predictions],
        "count": len(legacy_predictions),
        "document_type": doc_type,
        "timestamp": timestamp
    }

# Import ML integration
from ai.ml_integration import predict_with_ml_model

async def predict_fields_with_ml(text: str, model_type: str = None, document_type: str = None) -> List[Dict[str, Any]]:
    """
    Predict fields using ML models
    
    Args:
        text: Document text content
        model_type: Optional model type override
        document_type: Optional document type
        
    Returns:
        List of field predictions in standardized format
    """
    try:
        # Call ML model integration
        return await predict_with_ml_model(text, model_type, document_type)
    except Exception as e:
        # Log the error but return empty results
        print(f"ML prediction error: {str(e)}")
        return []

async def enrich_predictions_with_profile(
    legacy_predictions: List[LegacyFieldPrediction], 
    enhanced_predictions: List[AIPredictedField],
    user_profile: Dict[str, Any]
) -> None:
    """
    Enhance field predictions with user profile data.
    
    Args:
        legacy_predictions: List of legacy field predictions
        enhanced_predictions: List of enhanced field predictions
        user_profile: User profile data
    """
    # Map common field names to profile fields
    profile_mapping = {
        "Party A": "user_name",
        "Buyer": "user_name",
        "Client": "user_name",
        "Email": "email",
        "Phone": "phone",
        "Address": "address"
    }
    
    # Create sets of existing field names for both formats
    legacy_names = {p.name for p in legacy_predictions}
    enhanced_names = {p.name for p in enhanced_predictions}
    
    # Enrich existing legacy predictions
    for prediction in legacy_predictions:
        if prediction.name in profile_mapping and profile_mapping[prediction.name] in user_profile:
            # If confidence is low, prefer the profile data
            if prediction.confidence < 0.7:
                prediction.value = user_profile[profile_mapping[prediction.name]]
                prediction.confidence = 0.9  # Higher confidence from profile data
    
    # Enrich existing enhanced predictions
    for prediction in enhanced_predictions:
        if prediction.name in profile_mapping and profile_mapping[prediction.name] in user_profile:
            # If confidence is low, prefer the profile data
            if prediction.confidenceScore < 0.7:
                prediction.predictedValue = user_profile[profile_mapping[prediction.name]]
                prediction.confidenceScore = 0.9  # Higher confidence from profile data
                prediction.source = PredictionSource.PROFILE  # Mark as coming from profile
    
    # Add common fields from profile if not already detected
    for field_name, profile_key in profile_mapping.items():
        if profile_key in user_profile:
            profile_value = user_profile[profile_key]
            field_type = get_field_type_for_name(field_name)
            field_id = str(uuid.uuid4())
            
            # Add to legacy predictions if not exists
            if field_name not in legacy_names:
                legacy_predictions.append(LegacyFieldPrediction(
                    name=field_name,
                    field_type=field_type,
                    value=profile_value,
                    confidence=0.9,  # High confidence from profile data
                    page=1
                ))
            
            # Add to enhanced predictions if not exists
            if field_name not in enhanced_names:
                enhanced_predictions.append(AIPredictedField(
                    id=field_id,
                    name=field_name,
                    type=field_type,
                    predictedValue=profile_value,
                    confidenceScore=0.9,
                    source=PredictionSource.PROFILE,
                    page=1,
                    location=FieldPosition(x=0, y=0, width=0, height=0)
                ))

def get_field_type_for_name(field_name: str) -> str:
    """Map field names to field types as strings"""
    name_lower = field_name.lower()
    if "date" in name_lower:
        return FieldType.DATE
    elif "amount" in name_lower or "payment" in name_lower or "price" in name_lower:
        return FieldType.AMOUNT
    elif "email" in name_lower:
        return FieldType.EMAIL
    elif "phone" in name_lower:
        return FieldType.PHONE
    elif "address" in name_lower:
        return FieldType.ADDRESS
    elif "party" in name_lower or "buyer" in name_lower or "seller" in name_lower:
        return FieldType.PARTY
    elif "signature" in name_lower:
        return FieldType.SIGNATURE
    else:
        return FieldType.TEXT

def detect_document_type(text: str) -> str:
    """Simple document type detection based on keywords"""
    text_lower = text.lower()
    
    if "lease" in text_lower or "landlord" in text_lower or "tenant" in text_lower or "premises" in text_lower:
        return "Lease Agreement"
    elif "employment" in text_lower or "employer" in text_lower or "employee" in text_lower:
        return "Employment Contract"
    elif "purchase" in text_lower and "sale" in text_lower:
        return "Purchase Agreement"
    elif "non-disclosure" in text_lower or "confidentiality" in text_lower:
        return "Non-Disclosure Agreement"
    elif "services" in text_lower and "agreement" in text_lower:
        return "Service Agreement"
    else:
        return "Legal Document"

def register_ml_model(model_name: str, model_func: callable) -> None:
    """
    Register a new ML model implementation
    
    Args:
        model_name: Name of the model
        model_func: Async function that implements the model
    """
    model_registry[model_name] = model_func

"""
Claude, build the comprehensive AI assistance engine for FormMonkey's legal document intelligence.

This module handles:
- Field prediction and auto-completion from document context
- Semantic contextualization of legal forms and their field relationships
- Legal clause analysis and standardized suggestions (e.g., dispute resolution, indemnity)
- Document type classification and field mapping intelligence
- Cross-field validation and consistency checking using legal domain knowledge
- Jurisdiction-aware defaults (e.g., California rental law compliance)

Dependencies & Integration:
- Import config.py for AI model configurations, API keys, and provider settings
- Use shared/prompts.ts prompt templates for consistent AI interactions
- Import shared/types.ts for ParsedField, FieldType, and confidence scoring interfaces
- Call shared/validators.ts for PII detection and redaction before AI processing
- Consumed by routers/parse.py for semantic field enhancement
- Used by routers/profile.py for intelligent profile completion suggestions
- Integrates with services/parser_engine.py for document context understanding
- Calls compliance/upl_safeguards.py for PII redaction pipeline

AI Integration Architecture:
- Modular prompt construction separated from model execution
- Support for both local models (privacy-first) and remote APIs (OpenAI, Anthropic)
- PII redaction pipeline before any external model calls
- Configurable model routing based on task complexity and privacy requirements
- Caching layer for repeated legal pattern recognition

Design Principles:
- Privacy-respecting: All sensitive data redacted before AI processing
- Modular: Each AI function should be independently testable and swappable
- Scalable: Support multiple concurrent model providers and fallback chains
- Suggestion-only: No direct data mutation - all outputs are recommendations
- Legal-aware: Understand document hierarchies, field dependencies, and compliance requirements
- Auditable: Log all AI interactions for compliance and debugging

Output Structure:
- Confidence scores for all suggestions
- Reasoning explanations for complex legal inferences
- Alternative suggestions with contextual rationale
- Compliance flags and jurisdiction-specific warnings
"""

# TODO [0]: Predict default field values from context
# TODO [0.1]: Implement model selection logic with fallback chains
# TODO [0.2]: Add comprehensive error handling for AI service failures
# TODO [1]: Suggest legal clauses (e.g., termination, arbitration)
# TODO [1.1]: Build legal field type recognition (party names, dates, amounts)
# TODO [1.2]: Implement confidence scoring for AI suggestions
# TODO [2]: Redact PII from prompt input
# TODO [2.1]: Add privacy-preserving profile matching algorithms
# TODO [2.2]: Implement context-aware field mapping strategies
# TODO [3]: Prepare prompt for local/remote LLM
# TODO [3.1]: Add model performance monitoring and switching logic
# TODO [3.2]: Build legal clause recognition and classification
