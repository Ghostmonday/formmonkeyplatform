/**
Claude, this is the shared File Upload Widget.

Purpose:
- Drag-and-drop zone + file selector button
- Validate file type/size
- Expose onUploadSuccess(jobId) and onError callbacks
- Style with Tailwind, show loading and errors gracefully

Dependencies & Integration:
- Used by pages/Upload.tsx as the primary upload interface
- Import shared/constants.ts for SUPPORTED_FILE_TYPES and MAX_FILE_SIZE_MB
- Use shared/validators.ts for client-side file validation
- Import shared/types.ts for file upload interfaces and JobStatus
- Call services/api.ts.uploadFile() for backend communication
- Import shared/utils.ts for file name sanitization

Component Features:
- Drag-and-drop with visual feedback and hover states
- File selection dialog with type filtering
- Real-time validation with immediate feedback
- Progress tracking during upload
- Error handling with user-friendly messages

Reusability:
- Configurable file type restrictions
- Customizable styling and layout
- Flexible callback system for different use cases
- Support for single or multiple file selection

This component is reused across UploadPage and other flows.
*/

// TODO [0]: Drag-and-drop + manual upload
// TODO [0.1]: Add comprehensive file validation with immediate feedback
// TODO [0.2]: Implement upload queue management with retry capabilities
// TODO [1]: Validate file before sending to backend
// TODO [1.1]: Add file type detection and MIME validation
// TODO [1.2]: Add detailed upload analytics and speed estimation
// TODO [2]: Show progress bar and error states
// TODO [2.1]: Add accessibility features for keyboard and screen reader users
// TODO [2.2]: Add offline upload queuing with automatic retry
