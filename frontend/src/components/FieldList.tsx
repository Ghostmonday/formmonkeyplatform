import React from 'react';
import { ParsedField } from '../types';
import FieldEditor from './FieldEditor';

interface FieldListProps {
  fields: ParsedField[];
  onFieldUpdate: (field: ParsedField) => void;
}

/**
 * FieldList component for rendering individual fields
 */
const FieldList: React.FC<FieldListProps> = ({
  fields,
  onFieldUpdate
}) => {
  // Format confidence indicator
  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.9) return 'bg-green-500';
    if (confidence > 0.7) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Handle reset of field to original value
  const handleReset = (field: ParsedField) => {
    onFieldUpdate({
      ...field, 
      value: field.originalValue, 
      isModified: false
    });
  };

  return (
    <div className="divide-y divide-gray-200">
      {fields.map(field => (
        <div key={field.id} className="p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="w-full md:w-1/3">
              <p className="font-medium text-gray-700">{field.name}</p>
              <div className="flex items-center mt-1">
                <div 
                  className="h-1 w-20 bg-gray-200 rounded-full overflow-hidden"
                  title={`${Math.round(field.confidence * 100)}% confidence`}
                >
                  <div 
                    className={`h-full ${getConfidenceColor(field.confidence)}`}
                    style={{ width: `${field.confidence * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs ml-2 text-gray-500">
                  {Math.round(field.confidence * 100)}%
                </span>
              </div>
            </div>
            
            <div className="w-full md:w-2/3 flex items-center gap-2">
              <FieldEditor 
                field={field}
                onChange={onFieldUpdate}
              />
              
              {field.isModified && (
                <button
                  className="text-gray-500 hover:text-gray-700 mt-1"
                  onClick={() => handleReset(field)}
                  title="Reset to original"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          {field.originalValue !== field.value && (
            <div className="mt-2 text-xs text-gray-500 italic">
              Original: {field.originalValue}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FieldList;
