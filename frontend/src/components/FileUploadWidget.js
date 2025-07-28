import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
import { useRef, useState } from "react";
const SUPPORTED_FILE_TYPES = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const SUPPORTED_EXTENSIONS = [".pdf", ".docx"];
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
function getFileExtension(filename) {
    return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase();
}
function validateFile(file) {
    if (!SUPPORTED_FILE_TYPES.includes(file.type) && !SUPPORTED_EXTENSIONS.includes("." + getFileExtension(file.name))) {
        return "Unsupported file type. Only PDF and DOCX are allowed.";
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
        return `File is too large. Max size is ${MAX_FILE_SIZE_MB}MB.`;
    }
    return null;
}
// Mock API call
async function mockUploadFile(file, onProgress) {
    return new Promise((resolve, reject) => {
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            if (onProgress)
                onProgress(progress);
            if (progress >= 100) {
                clearInterval(interval);
                if (Math.random() < 0.9) {
                    resolve({ jobId: "mock-job-" + Date.now() });
                }
                else {
                    reject(new Error("Mock upload failed. Please try again."));
                }
            }
        }, 300);
    });
}
export const FileUploadWidget = ({ onUploadSuccess, onError }) => {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [success, setSuccess] = useState(false);
    const inputRef = useRef(null);
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        }
        else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };
    const handleFile = (file) => {
        setError(null);
        setSuccess(false);
        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            if (onError)
                onError(validationError);
            setSelectedFile(null);
            return;
        }
        setSelectedFile(file);
    };
    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };
    const handleButtonClick = () => {
        inputRef.current?.click();
    };
    const handleUpload = async () => {
        if (!selectedFile)
            return;
        setUploading(true);
        setError(null);
        setSuccess(false);
        setUploadProgress(0);
        try {
            const res = await mockUploadFile(selectedFile, (progress) => {
                setUploadProgress(progress);
            });
            setSuccess(true);
            if (onUploadSuccess)
                onUploadSuccess(res.jobId);
        }
        catch (err) {
            setError(err.message || "Upload failed.");
            if (onError)
                onError(err.message || "Upload failed.");
        }
        finally {
            setUploading(false);
        }
    };
    return (_jsxs("div", { className: "w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md", children: [_jsxs("div", { className: `border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center transition-colors duration-200 ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"}`, onDragEnter: handleDrag, onDragOver: handleDrag, onDragLeave: handleDrag, onDrop: handleDrop, tabIndex: 0, "aria-label": "File upload drop zone", children: [_jsx("input", { type: "file", accept: ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document", className: "hidden", ref: inputRef, onChange: handleChange, disabled: uploading }), _jsx("span", { className: "text-3xl mb-2", role: "img", "aria-label": "Upload", children: "\uD83D\uDCC4" }), _jsx("p", { className: "mb-2 text-gray-700 font-semibold", children: "Drag & drop a PDF or DOCX file here" }), _jsx("p", { className: "mb-4 text-gray-500 text-sm", children: "or" }), _jsx("button", { type: "button", className: "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring", onClick: handleButtonClick, disabled: uploading, children: "Choose File" }), _jsxs("p", { className: "mt-4 text-xs text-gray-400", children: ["Max file size: ", MAX_FILE_SIZE_MB, "MB"] })] }), selectedFile && (_jsxs("div", { className: "mt-4 flex items-center justify-between bg-gray-100 p-3 rounded", children: [_jsx("span", { className: "truncate max-w-xs", children: selectedFile.name }), _jsxs("span", { className: "ml-2 text-xs text-gray-500", children: [(selectedFile.size / 1024 / 1024).toFixed(2), " MB"] })] })), error && _jsx("div", { className: "mt-3 text-red-600 text-sm", children: error }), success && _jsx("div", { className: "mt-3 text-green-600 text-sm", children: "Upload successful!" }), uploading && (_jsxs("div", { className: "w-full mt-3", children: [_jsx("div", { className: "w-full bg-gray-200 rounded-full h-2.5", children: _jsx("div", { className: "bg-blue-600 h-2.5 rounded-full transition-all", style: { width: `${uploadProgress}%` } }) }), _jsxs("div", { className: "text-xs text-gray-500 text-right mt-1", children: [uploadProgress, "%"] })] })), _jsx("button", { type: "button", className: "mt-6 w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50", onClick: handleUpload, disabled: !selectedFile || uploading, children: uploading ? "Uploading..." : "Upload" })] }));
};
