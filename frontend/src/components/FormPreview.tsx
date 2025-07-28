import React from 'react';
import { ParsedField } from '../types';

interface FormPreviewProps {
  extractedText?: string;
  metadata?: {
    filename?: string;
    fileSize?: number;
    pageCount?: number;
    [key: string]: any;
  };
  fields?: ParsedField[];
  isLoading: boolean;
}

/**
 * FormPreview component displays the original document preview
 * with highlighted fields and extracted text
 */
const FormPreview: React.FC<FormPreviewProps> = ({
  extractedText,
  metadata,
  fields,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading document preview...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Document Metadata */}
      {metadata && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Document Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {metadata.filename && (
              <div>
                <span className="text-gray-500">Filename:</span>
                <span className="ml-2 text-gray-900">{metadata.filename}</span>
              </div>
            )}
            {metadata.fileSize && (
              <div>
                <span className="text-gray-500">Size:</span>
                <span className="ml-2 text-gray-900">
                  {(metadata.fileSize / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            )}
            {metadata.pageCount && (
              <div>
                <span className="text-gray-500">Pages:</span>
                <span className="ml-2 text-gray-900">{metadata.pageCount}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Extracted Text Preview */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-900">Extracted Text</h3>
          <p className="text-sm text-gray-500 mt-1">
            {fields ? `${fields.length} fields detected` : 'Processing document...'}
          </p>
        </div>
        
        <div className="p-4">
          {extractedText ? (
            <div className="max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
                {extractedText}
              </pre>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-2">No text extracted yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Field Summary */}
      {fields && fields.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">Detected Fields Summary</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fields.slice(0, 6).map((field) => (
                <div key={field.id} className="border border-gray-100 rounded-lg p-3">
                  <div className="text-sm font-medium text-gray-900">{field.name}</div>
                  <div className="text-sm text-gray-600 mt-1 truncate">{field.value}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Confidence: {(field.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
            {fields.length > 6 && (
              <div className="text-center mt-4">
                <span className="text-sm text-gray-500">
                  +{fields.length - 6} more fields detected
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FormPreview;
