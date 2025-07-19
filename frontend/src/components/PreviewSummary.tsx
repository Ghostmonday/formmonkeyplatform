/**
This component provides a summary of all detected fields.

Tasks:
- Show categorized field list (e.g., Parties, Dates, Payments)
- Inline edit using FieldEditor
- Include "Accept All" / "Reset" buttons
- Display total count of edited fields

Dependencies & Integration:
- Import components/FieldEditor.tsx for individual field editing
- Used by pages/Preview.tsx as the main field overview interface
- Import shared/types.ts for ParsedField categorization and field grouping
- Use shared/utils.ts for field sorting and categorization logic
- Call services/api.ts.bulkUpdateFields() for batch operations
- Import shared/constants.ts for field category definitions

Field Organization:
- Group fields by semantic categories (Personal Info, Legal Terms, Financial)
- Collapsible sections for better organization
- Search and filter capabilities for large documents
- Drag-and-drop reordering for user preference

Bulk Operations:
- Accept all AI suggestions with confirmation
- Reset to original values with undo capability
- Bulk validation with error reporting
- Progress tracking for large-scale operations

Use layout that's scalable to large documents.
*/
