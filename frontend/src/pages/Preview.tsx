// TODO[AI_FRONTEND_PRE4]: TYPE SYSTEM CONSOLIDATION - Replace local '../types' imports with local types for frontend-only workspace compatibility.

import React, { useEffect, useState, useCallback } from 'react';
import FormPreview from '../components/FormPreview';
import PreviewSummary from '../components/PreviewSummary';
import { getJobStatus } from '../services/api';
import { JobStatus, ParsedField } from "../../../../shared/types";

/**
 * Preview Page Component
 * 
 * This page displays the parsed document results including:
 * - Document preview with extracted text
 * - Document metadata (file info, size, pages)
 * - Fields detected in the document with confidence scores
 * - UI for editing and managing detected fields
 */
const Preview: React.FC = () => {
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'fields'>('preview');
  const [fields, setFields] = useState<ParsedField[] | undefined>(undefined);
  
  // Get job_id from URL on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('job_id');
    
    if (!id) {
      setError('No job ID provided. Please upload a document first.');
      setLoading(false);
      return;
    }
    
    setJobId(id);
  }, []);

  // Poll job status when job_id is available
  useEffect(() => {
    if (!jobId) return;
    
    const fetchJobStatus = async () => {
      try {
        setLoading(true);
        const status = await getJobStatus(jobId);
        setJobStatus(status);
        setFields(status.result?.fields);
        
        // If job is still processing, poll again after delay
        if (status.status === 'processing' || status.status === 'queued') {
          setTimeout(fetchJobStatus, 2000);
        } else {
          setLoading(false);
        }
      } catch (err) {
        setError('Failed to fetch document status. Please try again.');
        setLoading(false);
      }
    };

    fetchJobStatus();
  }, [jobId]);

  // Handle field updates with debounce
  const handleFieldUpdate = useCallback((updatedField: ParsedField) => {
    if (!fields) return;
    
    setFields(fields.map(field => 
      field.id === updatedField.id ? updatedField : field
    ));
  }, [fields]);

  // Handle reset all fields
  const handleResetAll = useCallback(() => {
    if (!fields) return;
    
    setFields(fields.map(field => ({
      ...field,
      value: field.originalValue,
      isModified: false,
      validationMessage: undefined,
      isSaving: false
    })));
  }, [fields]);

  // Navigate to export page
  const handleContinueToExport = () => {
    if (jobId) {
      window.location.href = `/export?job_id=${jobId}`;
    }
  };

  // Navigate back to upload page
  const handleBack = () => {
    window.location.href = '/upload';
  };

  // Handle save draft
  const handleSaveDraft = () => {
    // In a real app, this would call an API to save the current state
    alert('Draft saved successfully');
  };

  // Count modified fields
  const modifiedFieldsCount = fields?.filter(f => f.isModified).length || 0;

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center">
          <svg className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-medium">Error</h3>
            <p>{error}</p>
          </div>
        </div>
        <div className="mt-4 text-center">
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleBack}
          >
            Back to Upload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Document Preview</h1>
          <p className="text-gray-600">
            Review and edit extracted information
            {jobStatus?.result?.metadata?.filename && ` from ${jobStatus.result.metadata.filename}`}
          </p>
        </div>
        
        {modifiedFieldsCount > 0 && (
          <div className="mt-3 md:mt-0 text-sm text-blue-600">
            {modifiedFieldsCount} field{modifiedFieldsCount > 1 ? 's' : ''} modified
          </div>
        )}
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px">
          <button
            className={`py-2 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'preview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('preview')}
          >
            Document Preview
          </button>
          <button
            className={`py-2 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'fields'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('fields')}
          >
            Fields {fields && `(${fields.length})`}
          </button>
        </nav>
      </div>
      
      {/* Content based on active tab */}
      {activeTab === 'preview' ? (
        <FormPreview 
          extractedText={jobStatus?.result?.extractedText}
          metadata={jobStatus?.result?.metadata}
          fields={fields}
          isLoading={loading}
        />
      ) : (
        <PreviewSummary 
          fields={fields || []}
          onFieldUpdate={handleFieldUpdate}
          onResetAll={handleResetAll}
          isLoading={loading}
          jobId={jobId || undefined}
        />
      )}
      
      {/* Action buttons */}
      <div className="mt-8 flex flex-col sm:flex-row-reverse justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            onClick={handleContinueToExport}
            disabled={loading || !jobStatus?.result}
          >
            Continue to Export
          </button>
          <button
            className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 disabled:opacity-50"
            onClick={handleSaveDraft}
            disabled={loading}
          >
            Save Draft
          </button>
        </div>
        <button
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
          onClick={handleBack}
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default Preview;
