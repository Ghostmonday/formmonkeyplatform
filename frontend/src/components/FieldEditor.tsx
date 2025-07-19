/**
Claude, build the FieldEditor component.

Responsibilities:
- Display individual field name + editable value
- Show AI suggestion (if available)
- Allow accept/override behavior
- Display confidence indicators (if provided)

Dependencies & Integration:
- Used by pages/Preview.tsx for document field editing
- Used by components/PreviewSummary.tsx for inline field editing
- Import shared/types.ts for ParsedField and FieldType interfaces
- Use shared/validators.ts for real-time field validation
- Import shared/utils.ts for field formatting and display helpers
- Call services/api.ts.updateFieldValue() for backend synchronization

Field Management:
- Support for different field types (text, date, number, dropdown, checkbox)
- AI suggestion display with confidence indicators
- Accept/reject workflow for AI recommendations
- Real-time validation with error display
- Undo/redo functionality for user changes

User Experience:
- Intuitive editing interface for each field type
- Clear visual distinction between AI suggestions and user input
- Tooltip explanations for field purposes and formats
- Keyboard navigation and accessibility support

Component must be reusable inside PreviewPage and PreviewSummary.
*/
