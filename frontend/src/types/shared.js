/**
 * Shared Types for FormMonkey Frontend
 *
 * This is a copy of shared types for frontend-only workspaces.
 * In the full monorepo, these are imported from ../../../shared/types
 */
// Field-related type definitions for AI predictions and user corrections
export var FieldType;
(function (FieldType) {
    FieldType["TEXT"] = "text";
    FieldType["DATE"] = "date";
    FieldType["CURRENCY"] = "currency";
    FieldType["NUMBER"] = "number";
    FieldType["EMAIL"] = "email";
    FieldType["PHONE"] = "phone";
    FieldType["ADDRESS"] = "address";
    FieldType["NAME"] = "name";
    FieldType["SIGNATURE"] = "signature";
    FieldType["CHECKBOX"] = "checkbox";
    FieldType["PARTY"] = "party";
    FieldType["PAYMENT"] = "payment";
})(FieldType || (FieldType = {}));
/**
 * Enum representing reasons for user corrections
 */
export var CorrectionReason;
(function (CorrectionReason) {
    CorrectionReason["INCORRECT_VALUE"] = "incorrect_value";
    CorrectionReason["INCOMPLETE_VALUE"] = "incomplete_value";
    CorrectionReason["FORMATTING_ERROR"] = "formatting_error";
    CorrectionReason["WRONG_FIELD"] = "wrong_field";
    CorrectionReason["DUPLICATE_ENTRY"] = "duplicate_entry";
    CorrectionReason["OTHER"] = "other";
})(CorrectionReason || (CorrectionReason = {}));
/**
 * Enum representing sources of AI predictions
 */
export var PredictionSource;
(function (PredictionSource) {
    PredictionSource["REGEX"] = "regex";
    PredictionSource["ML_MODEL"] = "ml_model";
    PredictionSource["MANUAL"] = "manual";
    PredictionSource["USER_INPUT"] = "user_input";
})(PredictionSource || (PredictionSource = {}));
/**
 * Field categories for organizing form fields
 */
export var FieldCategory;
(function (FieldCategory) {
    FieldCategory["PERSONAL"] = "Personal Information";
    FieldCategory["LEGAL"] = "Legal Terms";
    FieldCategory["FINANCIAL"] = "Financial Details";
    FieldCategory["DATES"] = "Important Dates";
    FieldCategory["PARTIES"] = "Involved Parties";
    FieldCategory["OTHER"] = "Other";
})(FieldCategory || (FieldCategory = {}));
