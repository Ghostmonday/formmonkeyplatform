/**
You're Claude, frontend architect for FormMonkey.

Design the Preview Page to:
- Display parsed fields from the document (job ID passed via query)
- Let users review and edit AI-suggested values
- Highlight detected fields with explanations (tooltips/labels)
- Include "Save Draft", "Continue to Export", and "Back" buttons
- Pull in Master Profile data and autofill suggestions

Dependencies & Integration:
- Import components/FieldEditor.tsx for individual field editing
- Use components/PreviewSummary.tsx for field overview and bulk operations
- Call services/api.ts.getParsedFields() to fetch document analysis results
- Import services/api.ts.updateProfile() for saving user corrections
- Use shared/types.ts for ParsedField, FieldType, and Profile interfaces
- Import shared/validators.ts for real-time field validation
- Navigate to pages/Export.tsx when user continues workflow

Field Management:
- Real-time field editing with validation feedback
- AI confidence indicators and alternative suggestions
- Bulk accept/reject operations for AI suggestions
- Profile integration for smart autofill
- Draft saving with automatic persistence

Data Flow:
- Fetch parsed data on component mount using job ID
- Merge with user profile for intelligent defaults
- Real-time validation and error display
- State synchronization with backend on changes

This is the user's main editing surface. Prioritize clarity and accuracy.
*/
