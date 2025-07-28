import { useEffect, useState } from 'react';
import { saveFieldUpdates } from '../services/api';
import { ParsedField } from '../types';

/**
 * Custom hook for handling auto-save functionality
 * 
 * @param jobId - The ID of the current job
 * @param delay - Delay in milliseconds before auto-saving (default: 3000ms)
 * @returns Object with auto-save state and handlers
 */
export function useAutoSave(jobId?: string, delay = 3000) {
  const [pendingChanges, setPendingChanges] = useState<ParsedField[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-save when there are pending changes
  useEffect(() => {
    if (pendingChanges.length > 0 && jobId) {
      const timer = setTimeout(() => saveChanges(), delay);
      return () => clearTimeout(timer);
    }
  }, [pendingChanges, jobId]);

  // Add a field to pending changes
  const addPendingChange = (field: ParsedField) => {
    if (!pendingChanges.some(f => f.id === field.id)) {
      setPendingChanges(prev => [...prev, field]);
    } else {
      setPendingChanges(prev =>
        prev.map(f => f.id === field.id ? field : f)
      );
    }
  };

  // Save changes to backend
  const saveChanges = async () => {
    if (!jobId || pendingChanges.length === 0) return null;

    setIsSaving(true);
    setError(null);

    try {
      const success = await saveFieldUpdates(jobId, pendingChanges);

      if (success) {
        const now = new Date();
        setLastSaved(now);

        // Return updated fields with timestamp
        const updatedFields = pendingChanges.map(field => ({
          ...field,
          isSaving: false,
          lastSaved: now.toISOString()
        }));

        setPendingChanges([]);
        return {
          success: true,
          fields: updatedFields,
          timestamp: now
        };
      } else {
        // Handle save failure
        const failedFields = pendingChanges.map(field => ({
          ...field,
          isSaving: false
        }));

        setError('Failed to save changes');
        return {
          success: false,
          fields: failedFields,
          error: 'Failed to save changes'
        };
      }
    } catch (error) {
      console.error('Error saving fields:', error);
      setError('Error saving changes');
      return {
        success: false,
        fields: pendingChanges.map(field => ({
          ...field,
          isSaving: false
        })),
        error: 'Error saving changes'
      };
    } finally {
      setIsSaving(false);
    }
  };

  // Clear pending changes
  const clearPendingChanges = () => {
    setPendingChanges([]);
  };

  return {
    pendingChanges,
    isSaving,
    lastSaved,
    error,
    addPendingChange,
    saveChanges,
    clearPendingChanges
  };
}
