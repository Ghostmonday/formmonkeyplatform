import { PredictionSource } from "./types";
/**
 * Shared type definitions for FormMonkey
 * Central source of truth for all data structures
 * Must match Python types in shared/types.py
 */

// ============= ENUMS =============

export enum FieldType {
  // Personal Information
  PARTY_NAME = "party_name",
  PARTY_ADDRESS = "party_address",
  PARTY_EMAIL = "party_email",
  PARTY_PHONE = "party_phone",
  SIGNATORY_NAME = "signatory_name",
  SIGNATORY_TITLE = "signatory_title",
  
  // Financial Information
  PAYMENT_AMOUNT = "payment_amount",
  PAYMENT_TERMS = "payment_terms",
  INTEREST_RATE = "interest_rate",
  LATE_FEE = "late_fee",
  DEPOSIT_AMOUNT = "deposit_amount",
  
  // Legal Terms
  GOVERNING_LAW = "governing_law",
  JURISDICTION = "jurisdiction",
  VENUE = "venue",
  DISPUTE_RESOLUTION = "dispute_resolution",
  ARBITRATION_CLAUSE = "arbitration_clause",
  INDEMNIFICATION_CLAUSE = "indemnification_clause",
  LIMITATION_LIABILITY = "limitation_liability",
  CONFIDENTIALITY_CLAUSE = "confidentiality_clause",
  NON_COMPETE_CLAUSE = "non_compete_clause",
  
  // Dates
  AGREEMENT_DATE = "agreement_date",
  EFFECTIVE_DATE = "effective_date",
  TERMINATION_DATE = "termination_date",
  RENEWAL_DATE = "renewal_date",
  NOTICE_PERIOD = "notice_period",
  
  // Document Metadata
  DOCUMENT_TITLE = "document_title",
  DOCUMENT_NUMBER = "document_number",
  VERSION_NUMBER = "version_number",
  
  // Signatures
  SIGNATURE = "signature",
  SIGNATURE_DATE = "signature_date",
  WITNESS_SIGNATURE = "witness_signature",
  NOTARY_SEAL = "notary_seal",
  
  // Contract Specific
  SCOPE_OF_WORK = "scope_of_work",
  DELIVERABLES = "deliverables",
  WARRANTIES = "warranties",
  FORCE_MAJEURE = "force_majeure",
  ASSIGNMENT_RIGHTS = "assignment_rights",
  
  // Real Estate Specific
  PROPERTY_ADDRESS = "property_address",
  PROPERTY_DESCRIPTION = "property_description",
  PURCHASE_PRICE = "purchase_price",
  SQUARE_FOOTAGE = "square_footage",
  LOT_SIZE = "lot_size",
}

export enum FieldCategory {
  PERSONAL = "personal",
  FINANCIAL = "financial",
  LEGAL = "legal",
  DATES = "dates",
  SIGNATURES = "signatures",
  PROPERTY = "property",
  GENERAL = "general",
}

export enum DocumentType {
  CONTRACT = "contract",
  LEASE = "lease",
  PURCHASE_AGREEMENT = "purchase_agreement",
  NDA = "nda",
  EMPLOYMENT_AGREEMENT = "employment_agreement",
  SERVICE_AGREEMENT = "service_agreement",
  LOAN_AGREEMENT = "loan_agreement",
  PARTNERSHIP_AGREEMENT = "partnership_agreement",
  LICENSE_AGREEMENT = "license_agreement",
  OTHER = "other",
}

export enum ProcessingStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

export enum ConfidenceLevel {
  HIGH = "high", // > 0.8
  MEDIUM = "medium", // 0.4 - 0.8
  LOW = "low", // < 0.4
}

export enum CorrectionReason {
  INCORRECT_VALUE = "incorrect_value",
  MISSING_VALUE = "missing_value",
  WRONG_FORMAT = "wrong_format",
  PARTIAL_VALUE = "partial_value",
  WRONG_FIELD_TYPE = "wrong_field_type",
  CUSTOM = "custom",
}

export enum PredictionSource {
  AI_MODEL = "ai_model",
  REGEX_PATTERN = "regex_pattern",
  USER_PROFILE = "user_profile",
  DEFAULT_VALUE = "default_value",
  MANUAL_ENTRY = "manual_entry",
}

export enum ValidationErrorType {
  REQUIRED_FIELD = "required_field",
  INVALID_FORMAT = "invalid_format",
  INVALID_LENGTH = "invalid_length",
  INVALID_VALUE = "invalid_value",
  BUSINESS_RULE = "business_rule",
}

// ============= INTERFACES =============

export interface DocumentMetadata {
  document_id: string;
  document_type: DocumentType;
  filename: string;
  upload_timestamp: Date;
  page_count: number;
  file_size_bytes: number;
  mime_type: string;
  user_id: string;
  job_id: string;
}

export interface ParsedField {
  field_type: FieldType;
  value: string;
  confidence: number; // 0.0 - 1.0
  page_number?: number;
  location?: Record<string, any>;
  validation_errors: string[];
  metadata?: Record<string, any>;
}

export interface AIPredictedField {
  field_type: FieldType;
  predicted_value: string;
  confidence: number; // 0.0 - 1.0
  source_location?: Record<string, any>;
  extraction_context?: string;
  alternative_values?: string[];
  model_version: string;
  extracted_at: Date;
  prediction_source: PredictionSource;
}

export interface UserCorrection {
  field_type: FieldType;
  original_value?: string;
  corrected_value: string;
  correction_reason: CorrectionReason;
  custom_reason?: string;
  confidence_before: number;
  timestamp: Date;
  document_id: string;
  user_id: string;
  applied: boolean;
}

export interface ValidationError {
  field_type: FieldType;
  error_type: ValidationErrorType;
  message: string;
  severity: "error" | "warning" | "info";
  suggestion?: string;
}

export interface JobData {
  job_id: string;
  user_id: string;
  document_id: string;
  status: ProcessingStatus;
  created_at: Date;
  updated_at: Date;
  parsed_fields: ParsedField[];
  validation_errors: ValidationError[];
  metadata?: Record<string, any>;
}

export interface JobStatus {
  job_id: string;
  status: ProcessingStatus;
  progress: number; // 0 - 100
  message?: string;
  result?: Record<string, any>;
  errors: string[];
}

export interface UploadResponse {
  job_id: string;
  document_id: string;
  status: string;
  message: string;
}

export interface CorrectionPattern {
  field_type: FieldType;
  pattern_type: "format" | "mapping" | "regex";
  from_pattern: string;
  to_pattern: string;
  confidence: number;
  occurrence_count: number;
  last_seen: Date;
  user_id: string;
}

export interface UserFieldPreference {
  user_id: string;
  field_type: FieldType;
  preferred_format?: string;
  common_values: string[];
  confidence_threshold: number;
  auto_accept: boolean;
  correction_patterns: CorrectionPattern[];
  accuracy_score: number;
  total_corrections: number;
}

export interface BatchCorrectionRequest {
  corrections: UserCorrection[];
  batch_id: string;
  priority: number; // Higher = more urgent
  created_at: Date;
  document_type: DocumentType;
}

export interface MLProviderConfig {
  provider_name: string;
  api_key?: string;
  endpoint_url?: string;
  model_name: string;
  max_retries: number;
  timeout_seconds: number;
  rate_limit_per_minute?: number;
  enabled: boolean;
}

// ============= FIELD CATEGORY MAPPING =============

export const FIELD_CATEGORIES: Record<FieldType, FieldCategory> = {
  // Personal fields
  [FieldType.PARTY_NAME]: FieldCategory.PERSONAL,
  [FieldType.PARTY_ADDRESS]: FieldCategory.PERSONAL,
  [FieldType.PARTY_EMAIL]: FieldCategory.PERSONAL,
  [FieldType.PARTY_PHONE]: FieldCategory.PERSONAL,
  [FieldType.SIGNATORY_NAME]: FieldCategory.PERSONAL,
  [FieldType.SIGNATORY_TITLE]: FieldCategory.PERSONAL,
  
  // Financial fields
  [FieldType.PAYMENT_AMOUNT]: FieldCategory.FINANCIAL,
  [FieldType.PAYMENT_TERMS]: FieldCategory.FINANCIAL,
  [FieldType.INTEREST_RATE]: FieldCategory.FINANCIAL,
  [FieldType.LATE_FEE]: FieldCategory.FINANCIAL,
  [FieldType.DEPOSIT_AMOUNT]: FieldCategory.FINANCIAL,
  [FieldType.PURCHASE_PRICE]: FieldCategory.FINANCIAL,
  
  // Legal fields
  [FieldType.GOVERNING_LAW]: FieldCategory.LEGAL,
  [FieldType.JURISDICTION]: FieldCategory.LEGAL,
  [FieldType.VENUE]: FieldCategory.LEGAL,
  [FieldType.DISPUTE_RESOLUTION]: FieldCategory.LEGAL,
  [FieldType.ARBITRATION_CLAUSE]: FieldCategory.LEGAL,
  [FieldType.INDEMNIFICATION_CLAUSE]: FieldCategory.LEGAL,
  [FieldType.LIMITATION_LIABILITY]: FieldCategory.LEGAL,
  [FieldType.CONFIDENTIALITY_CLAUSE]: FieldCategory.LEGAL,
  [FieldType.NON_COMPETE_CLAUSE]: FieldCategory.LEGAL,
  [FieldType.FORCE_MAJEURE]: FieldCategory.LEGAL,
  [FieldType.WARRANTIES]: FieldCategory.LEGAL,
  [FieldType.ASSIGNMENT_RIGHTS]: FieldCategory.LEGAL,
  
  // Date fields
  [FieldType.AGREEMENT_DATE]: FieldCategory.DATES,
  [FieldType.EFFECTIVE_DATE]: FieldCategory.DATES,
  [FieldType.TERMINATION_DATE]: FieldCategory.DATES,
  [FieldType.RENEWAL_DATE]: FieldCategory.DATES,
  [FieldType.NOTICE_PERIOD]: FieldCategory.DATES,
  [FieldType.SIGNATURE_DATE]: FieldCategory.DATES,
  
  // Signature fields
  [FieldType.SIGNATURE]: FieldCategory.SIGNATURES,
  [FieldType.WITNESS_SIGNATURE]: FieldCategory.SIGNATURES,
  [FieldType.NOTARY_SEAL]: FieldCategory.SIGNATURES,
  
  // Property fields
  [FieldType.PROPERTY_ADDRESS]: FieldCategory.PROPERTY,
  [FieldType.PROPERTY_DESCRIPTION]: FieldCategory.PROPERTY,
  [FieldType.SQUARE_FOOTAGE]: FieldCategory.PROPERTY,
  [FieldType.LOT_SIZE]: FieldCategory.PROPERTY,
  
  // General fields
  [FieldType.DOCUMENT_TITLE]: FieldCategory.GENERAL,
  [FieldType.DOCUMENT_NUMBER]: FieldCategory.GENERAL,
  [FieldType.VERSION_NUMBER]: FieldCategory.GENERAL,
  [FieldType.SCOPE_OF_WORK]: FieldCategory.GENERAL,
  [FieldType.DELIVERABLES]: FieldCategory.GENERAL,
};

// ============= HELPER FUNCTIONS =============

export function getFieldCategory(fieldType: FieldType): FieldCategory {
  return FIELD_CATEGORIES[fieldType] || FieldCategory.GENERAL;
}

export function getFieldsByCategory(category: FieldCategory): FieldType[] {
  return Object.entries(FIELD_CATEGORIES)
    .filter(([_, cat]) => cat === category)
    .map(([fieldType]) => fieldType as FieldType);
}

export function getConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence > 0.8) return ConfidenceLevel.HIGH;
  if (confidence >= 0.4) return ConfidenceLevel.MEDIUM;
  return ConfidenceLevel.LOW;
}

export function getFieldValidationPattern(fieldType: FieldType): string | null {
  const patterns: Partial<Record<FieldType, string>> = {
    [FieldType.PARTY_EMAIL]: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    [FieldType.PARTY_PHONE]: '^\\+?1?\\d{10,14}$',
    [FieldType.AGREEMENT_DATE]: '^\\d{4}-\\d{2}-\\d{2}$',
    [FieldType.EFFECTIVE_DATE]: '^\\d{4}-\\d{2}-\\d{2}$',
    [FieldType.TERMINATION_DATE]: '^\\d{4}-\\d{2}-\\d{2}$',
    [FieldType.PAYMENT_AMOUNT]: '^\\$?\\d+(\\.\\d{2})?$',
    [FieldType.INTEREST_RATE]: '^\\d+(\\.\\d+)?%?$',
  };
  return patterns[fieldType] || null;
}