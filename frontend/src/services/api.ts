// TODO[AI_FRONTEND_PRE4]: API INTEGRATION VALIDATION - Verify all API functions match actual backend endpoints. Remove mock implementations and replace with real backend calls. Add proper error handling and retry logic. Ensure response types match shared/types definitions.

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

import { FieldCategory, FieldType, JobStatus, ParsedField } from "../../../../shared/types";

// Mock data for development
const MOCK_DELAY = 800;
const AUTO_SAVE_DELAY = 1500; // Auto-save after 1.5 seconds of inactivity

// Validation functions for different field types
export const validateField = (field: ParsedField): string | null => {
  const value = field.value?.trim();

  if (!value) {
    return null; // Empty values are allowed
  }

  switch (field.type) {
    case FieldType.DATE:
      // Basic date validation (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(value)) {
        return 'Please use YYYY-MM-DD format';
      }

      // Validate the actual date
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      break;

    case FieldType.NUMBER:
      // Allow numeric values with optional decimal point and commas
      if (!/^[\d,]+(\.\d+)?$/.test(value.replace(/\s/g, ''))) {
        return 'Please enter a valid number';
      }
      break;

    case FieldType.TEXT:
      // No specific validation for general text
      break;

    case FieldType.EMAIL:
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address';
      }
      break;
  }

  return null;
};

// API call for getting job status - uses real endpoint if available, falls back to mock
export async function getJobStatus(jobId: string): Promise<JobStatus> {
  try {
    // Try to fetch from real endpoint first
    const response = await fetch(`/api/parse/${jobId}/status`);

    if (response.ok) {
      return await response.json();
    }

    // Fall back to mock if API is not available
    console.warn('Real API endpoint unavailable, using mock data');
    return mockGetJobStatus(jobId);
  } catch (error) {
    console.warn('Error fetching from API, using mock data', error);
    return mockGetJobStatus(jobId);
  }
}

// Mock version for development
function mockGetJobStatus(jobId: string): Promise<JobStatus> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        jobId,
        status: Math.random() > 0.1 ? 'completed' : 'processing',
        progress: 100,
        result: {
          extractedText: "This Agreement made on January 15, 2025 between ABC Corporation ('Employer') and John Doe ('Employee')...",
          metadata: {
            jobId,
            filename: "Employment_Contract.pdf",
            pageCount: 12,
            processingStatus: 'completed' as const,
            uploadedAt: new Date().toISOString(),
            fileSize: 1024 * 1024 * 2, // 2MB
            fileType: 'application/pdf'
          },
          fields: generateMockFields()
        }
      });
    }, MOCK_DELAY);
  });
}

// Save field updates to backend
export async function saveFieldUpdates(jobId: string, updatedFields: ParsedField[]): Promise<boolean> {
  try {
    // Try to save to real endpoint
    const response = await fetch(`/api/parse/${jobId}/fields`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fields: updatedFields })
    });

    if (response.ok) {
      return true;
    }

    // Fall back to mock if API is not available
    console.warn('Real API endpoint unavailable, using mock save');
    return mockSaveFields();
  } catch (error) {
    console.warn('Error saving to API, using mock save', error);
    return mockSaveFields();
  }
}

// Mock save function
function mockSaveFields(): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 95% success rate for mock saves
      resolve(Math.random() > 0.05);
    }, MOCK_DELAY);
  });
}

function generateMockFields(): ParsedField[] {
  return [
    {
      id: '1',
      name: 'Employee Name',
      value: 'John Doe',
      originalValue: 'John Doe',
      confidence: 0.98,
      category: FieldCategory.PARTIES,
      type: FieldType.TEXT,
      isModified: false
    },
    {
      id: '2',
      name: 'Employer',
      value: 'ABC Corporation',
      originalValue: 'ABC Corporation',
      confidence: 0.95,
      category: FieldCategory.PARTIES,
      type: FieldType.TEXT,
      isModified: false
    },
    {
      id: '3',
      name: 'Effective Date',
      value: '2025-01-15',
      originalValue: 'January 15, 2025',
      confidence: 0.92,
      category: FieldCategory.DATES,
      type: FieldType.DATE,
      isModified: false
    },
    {
      id: '4',
      name: 'Annual Salary',
      value: '85000',
      originalValue: '$85,000.00',
      confidence: 0.88,
      category: FieldCategory.FINANCIAL,
      type: FieldType.NUMBER,
      isModified: false,
      suggestions: ['85000', '80000']
    },
    {
      id: '5',
      name: 'Position',
      value: 'Senior Developer',
      originalValue: 'Senior Software Developer',
      confidence: 0.85,
      category: FieldCategory.PERSONAL,
      type: FieldType.TEXT,
      isModified: false
    },
    {
      id: '6',
      name: 'Probation Period',
      value: '90 days',
      originalValue: '90 days',
      confidence: 0.9,
      category: FieldCategory.LEGAL,
      type: FieldType.TEXT,
      isModified: false
    },
    {
      id: '7',
      name: 'Notice Period',
      value: '30 days',
      originalValue: 'thirty (30) days',
      confidence: 0.86,
      category: FieldCategory.LEGAL,
      type: FieldType.TEXT,
      isModified: false
    },
    {
      id: '8',
      name: 'Vacation Days',
      value: '20',
      originalValue: 'twenty (20) business days',
      confidence: 0.89,
      category: FieldCategory.PERSONAL,
      type: FieldType.NUMBER,
      isModified: false
    },
    {
      id: '9',
      name: 'Contact Email',
      value: 'john.doe@example',
      originalValue: 'john.doe@example',
      confidence: 0.72,
      category: FieldCategory.PERSONAL,
      type: FieldType.EMAIL,
      isModified: false,
      suggestions: ['john.doe@example.com', 'j.doe@example.com']
    },
    {
      id: '10',
      name: 'Termination Clause',
      value: 'Either party may terminate this Agreement with 30 days written notice',
      originalValue: 'Either party may terminate this Agreement with thirty (30) days prior written notice',
      confidence: 0.78,
      category: FieldCategory.LEGAL,
      type: FieldType.TEXT,
      isModified: false
    },
    {
      id: '11',
      name: 'Payment Schedule',
      value: 'Bi-weekly',
      originalValue: 'Bi-weekly payments',
      confidence: 0.82,
      category: FieldCategory.FINANCIAL,
      type: FieldType.TEXT,
      isModified: false
    },
    {
      id: '12',
      name: 'Bonus Amount',
      value: '5000',
      originalValue: 'Five thousand dollars ($5,000)',
      confidence: 0.76,
      category: FieldCategory.FINANCIAL,
      type: FieldType.NUMBER,
      isModified: false
    }
  ];
}
