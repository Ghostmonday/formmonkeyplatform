import React from 'react';

interface ActionButtonsProps {
  isSaving: boolean;
  lastSaved: Date | null;
  pendingChangesCount: number;
  modifiedFieldsCount: number;
  onSave: () => void;
  onAcceptAll: () => void;
  onResetAll: () => void;
}

/**
 * ActionButtons component for document field operations
 */
const ActionButtons: React.FC<ActionButtonsProps> = ({
  isSaving,
  lastSaved,
  pendingChangesCount,
  modifiedFieldsCount,
  onSave,
  onAcceptAll,
  onResetAll
}) => {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Save status indicator */}
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
      
      {/* Action buttons */}
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        onClick={onAcceptAll}
        title="Alt+A"
      >
        Accept All (Alt+A)
      </button>
      
      <button
        className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm"
        onClick={onResetAll}
        disabled={modifiedFieldsCount === 0}
        title="Alt+R"
      >
        Reset All (Alt+R)
      </button>
      
      <button
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm disabled:opacity-50"
        onClick={onSave}
        disabled={pendingChangesCount === 0 || isSaving}
        title="Ctrl+S"
      >
        {pendingChangesCount > 0 && `Save (${pendingChangesCount})`}
        {pendingChangesCount === 0 && 'Save (Ctrl+S)'}
      </button>
    </div>
  );
};

export default ActionButtons;
