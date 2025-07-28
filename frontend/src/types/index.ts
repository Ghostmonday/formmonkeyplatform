// TODO[AI_SHARED_PRE4]: TYPE SYSTEM CONSOLIDATION - This file provides compatibility 
// between monorepo shared types and frontend-only workspace operation.

// Use local shared types for frontend-only workspace compatibility
export * from './shared';

// Export additional frontend-specific types
export interface Profile {
  id: string;
  fullName: string;
  email: string;
  company?: string;
  role?: string;
  preferences?: {
    defaultExportFormat?: string;
    autoFillFromProfile?: boolean;
  };
}

export interface ExportJob {
  jobId: string;
  status: string;
  downloadUrl?: string;
}

export interface SigningJob {
  jobId: string;
  status: string;
  signingUrl?: string;
}
