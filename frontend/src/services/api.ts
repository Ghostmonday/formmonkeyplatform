/**
You're Claude. This utility handles frontend API communication.

Requirements:
- Wrap fetch/axios calls to backend (upload, parse, profile, export)
- Centralize error handling and token headers
- Define reusable methods (e.g., uploadFile, getParsedFields, updateProfile)

Dependencies & Integration:
- Used by all pages/*.tsx for backend communication
- Used by components/FileUploadWidget.tsx for file uploads
- Import shared/types.ts for request/response type definitions
- Import shared/constants.ts for API endpoint URLs and configuration
- Use context/UserContext.tsx for authentication token management
- Import shared/validators.ts for request validation before sending

API Methods:
- uploadFile(file: File): Promise<JobStatus>
- getParsedFields(jobId: string): Promise<ParsedField[]>
- getProfile(): Promise<Profile>
- updateProfile(profile: Partial<Profile>): Promise<Profile>
- exportDocument(jobId: string, format: string): Promise<ExportJob>
- initiateESigning(jobId: string, providers: string[]): Promise<SigningJob>

Error Handling:
- Centralized error processing with user-friendly messages
- Network error detection and retry mechanisms
- Authentication error handling with automatic login redirect
- Request/response logging for debugging

Return Promises with typed responses. Handle all request edge cases cleanly.
*/

// TODO [0]: Wrap backend API calls (upload, parse, export, profile)
// TODO [1]: Handle token injection, error catching
// TODO [2]: Use shared types for responses
