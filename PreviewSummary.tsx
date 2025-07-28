import React, { useState, useEffect } from 'react';
import { ParsedField, FieldCategory } from "./shared/types";
import { saveFieldUpdates } from '../services/api';
import FieldEditor from './FieldEditor';

// TODO[AI_FRONTEND_PRE4]: CRITICAL REPAIRS - Decompose this 300+ line component into smaller focused components: SearchBar, ActionButtons, CategorySection, FieldList. Extract auto-save logic into custom hook. Fix type imports to use shared/types instead of local types.

interface PreviewSummaryProps {
  fields: ParsedField[];
  onFieldUpdate: (field: ParsedField) => void;
  onResetAll: () => void;
  isLoading: boolean;
  jobId?: string;
}

/**
 * This component provides a summary of all detected fields.
 * It allows for field editing, categorization, and bulk operations.
 */
export const PreviewSummary: React.FC<PreviewSummaryProps> = ({ 
  fields, 
  onFieldUpdate, 
  onResetAll,
  isLoading,
  jobId 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<FieldCategory[]>(
    Object.values(FieldCategory)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [pendingChanges, setPendingChanges] = useState<ParsedField[]>([]);
  
  // Setup keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl+S to save all changes
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSaveChanges();
      }
      
      // Alt+A to accept all suggestions
      if (e.altKey && e.key === 'a') {
        e.preventDefault();
        handleAcceptAll();
      }
      
      // Alt+R to reset all fields
      if (e.altKey && e.key === 'r') {
        e.preventDefault();
        onResetAll();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fields]);
  
  // Auto-save when there are pending changes
  useEffect(() => {
    if (pendingChanges.length > 0 && jobId) {
      const timer = setTimeout(handleSaveChanges, 3000);
      return () => clearTimeout(timer);
    }
  }, [pendingChanges, jobId]);
  
  // Group fields by category
  const fieldsByCategory = fields.reduce((acc: Record<string, ParsedField[]>, field) => {
    if (!acc[field.category]) {
      acc[field.category] = [];
    }
    acc[field.category].push(field);
    return acc;
  }, {} as Record<string, ParsedField[]>);
  
  // Filter fields by search term
  const filteredCategories = Object.entries(fieldsByCategory)
    .map(([category, categoryFields]) => ({
      category,
      fields: categoryFields.filter(field => 
        field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        field.value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }))
    .filter(group => group.fields.length > 0);
  
  // Count modified fields
  const modifiedCount = fields.filter(field => field.isModified).length;
  
  // Toggle category expansion
  const toggleCategory = (category: FieldCategory) => {
    if (expandedCategories.includes(category)) {
      setExpandedCategories(expandedCategories.filter(c => c !== category));
    } else {
      setExpandedCategories([...expandedCategories, category]);
    }
  };
  
  // Save changes to backend
  const handleSaveChanges = async () => {
    if (!jobId || pendingChanges.length === 0) return;
    
    setIsSaving(true);
    try {
      const success = await saveFieldUpdates(jobId, pendingChanges);
      
      if (success) {
        const now = new Date();
        setLastSaved(now);
        
        // Update saved fields with timestamp
        pendingChanges.forEach(field => {
          onFieldUpdate({
            ...field,
            isSaving: false,
            lastSaved: now.toISOString()
          });
        });
        
        setPendingChanges([]);
      } else {
        // Handle save failure
        pendingChanges.forEach(field => {
          onFieldUpdate({
            ...field,
            isSaving: false
          });
        });
        
        alert('Failed to save changes. Please try again.');
      }
    } catch (error) {
      console.error('Error saving fields:', error);
      alert('Error saving changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Accept all AI suggested values
  const handleAcceptAll = () => {
    if (window.confirm('Accept all AI suggested values? This will overwrite any manual edits.')) {
      // In a real implementation, this would use the original values from the API
      onResetAll();
    }
  };
  
  // Handle field update
  const handleFieldChange = (updatedField: ParsedField) => {
    // Add to pending changes if it's being saved
    if (updatedField.isSaving && !pendingChanges.some(f => f.id === updatedField.id)) {
      setPendingChanges([...pendingChanges, updatedField]);
    }
    
    // Pass update to parent component
    onFieldUpdate(updatedField);
  };
  
  // Format confidence indicator
  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.9) return 'bg-green-500';
    if (confidence > 0.7) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  if (isLoading) {
    return (
      <div className="w-full p-8 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mb-4"></div>
        <p className="text-gray-600">Loading fields...</p>
      </div>
    );
  }
  
  if (fields.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-600">No fields detected in this document</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Search and Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div className="relative w-full md:w-64">
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Search fields..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Save status */}
          {isSaving ? (
            <div className="text-blue-600 text-sm flex items-center">
              <svg className="animate-spin mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </div>
          ) : lastSaved ? (
            <div className="text-green-600 text-sm flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Saved at {lastSaved.toLocaleTimeString()}
            </div>
          ) : null}
          
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            onClick={handleAcceptAll}
            title="Alt+A"
          >
            Accept All (Alt+A)
          </button>
          <button
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm"
            onClick={onResetAll}
            disabled={modifiedCount === 0}
            title="Alt+R"
          >
            Reset All (Alt+R)
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm disabled:opacity-50"
            onClick={handleSaveChanges}
            disabled={pendingChanges.length === 0 || isSaving}
            title="Ctrl+S"
          >
            {pendingChanges.length > 0 && `Save (${pendingChanges.length})`}
            {pendingChanges.length === 0 && 'Save (Ctrl+S)'}
          </button>
        </div>
      </div>
      
      {searchTerm && (
        <div className="mb-4 text-sm">
          Found {filteredCategories.reduce((acc, cat) => acc + cat.fields.length, 0)} 
          {' '}fields matching "{searchTerm}"
        </div>
      )}
      
      {/* Field Categories */}
      <div className="space-y-6">
        {filteredCategories.map(({ category, fields }) => (
          <div key={category} className="border border-gray-200 rounded-md overflow-hidden">
            {/* Category Header */}
            <div 
              className="bg-gray-50 px-4 py-3 flex items-center justify-between cursor-pointer"
              onClick={() => toggleCategory(category as FieldCategory)}
            >
              <h3 className="font-medium text-gray-800">
                {category} <span className="text-gray-500 text-sm">({fields.length})</span>
              </h3>
              <button className="text-gray-500 focus:outline-none">
                {expandedCategories.includes(category as FieldCategory) ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            </div>
            
            {/* Category Fields */}
            {expandedCategories.includes(category as FieldCategory) && (
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
                          onChange={handleFieldChange}
                        />
                        
                        {field.isModified && (
                          <button
                            className="text-gray-500 hover:text-gray-700 mt-1"
                            onClick={() => handleFieldChange({
                              ...field, 
                              value: field.originalValue, 
                              isModified: false
                            })}
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
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
