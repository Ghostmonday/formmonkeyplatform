/**
Claude, build the Profile Page to manage the Master Profile.

Features:
- Editable form to manage user defaults (name, address, email, etc.)
- Fetch/update profile via backend API
- Show save status and field validation
- Display usage tips (e.g., how profile fields map to documents)

Dependencies & Integration:
- Use services/api.ts.getProfile() and services/api.ts.updateProfile() for backend communication
- Import shared/types.ts for Profile interface and field definitions
- Use shared/validators.ts.validateProfile() for form validation
- Import context/UserContext.tsx for current user state
- Use hooks/useForm.ts for form state management and validation
- Import shared/constants.ts for DEFAULT_PROFILE_VALUES

Profile Management:
- Form with comprehensive field coverage (personal, business, legal)
- Real-time validation with field-specific error messages
- Save state indicators and conflict resolution
- Profile templates for different user types
- Data export/import capabilities

Privacy & Security:
- Field-level privacy controls
- Data sharing preferences
- Secure form submission with validation
- Clear indication of required vs optional fields

UI should reflect seriousness of user PII — clean, minimal, secure.
*/
