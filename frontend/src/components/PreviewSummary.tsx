import React from 'react';
import { ParsedField } from "../../../../shared/types";

interface PreviewSummaryProps {
  fields: ParsedField[];
  onFieldUpdate: (updatedField: ParsedField) => void;
  onResetAll: () => void;
  isLoading: boolean;
  jobId?: string;
}

const PreviewSummary: React.FC<PreviewSummaryProps> = ({
  fields,
  onFieldUpdate,
  onResetAll,
  isLoading,
  jobId
}) => {
  const totalFields = fields.length;
  const extractedFields = fields.filter(field => field.value && field.value.trim() !== '').length;
  const confidenceScore = fields.reduce((sum, field) => sum + (field.confidence || 0), 0) / totalFields || 0;

  return (
    <div className="preview-summary">
      <h3>Document Summary</h3>
      <div className="summary-stats">
        <div className="stat">
          <span className="stat-label">Total Fields:</span>
          <span className="stat-value">{totalFields}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Extracted:</span>
          <span className="stat-value">{extractedFields}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Confidence:</span>
          <span className="stat-value">{Math.round(confidenceScore * 100)}%</span>
        </div>
      </div>
      
      <div className="field-summary">
        <h4>Extracted Fields</h4>
        <div className="field-list">
          {fields.map((field, index) => (
            <div key={index} className="field-item">
              <label className="field-name">{field.name}:</label>
              <input
                type="text"
                value={field.value || ''}
                onChange={(e) => onFieldUpdate({ ...field, value: e.target.value })}
                className="field-input"
                disabled={isLoading}
              />
              <span className="field-confidence">
                {field.confidence ? Math.round(field.confidence * 100) : 0}%
              </span>
            </div>
          ))}
        </div>
        
        <div className="summary-actions">
          <button
            onClick={onResetAll}
            disabled={isLoading}
            className="reset-button"
          >
            Reset All Fields
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewSummary;
