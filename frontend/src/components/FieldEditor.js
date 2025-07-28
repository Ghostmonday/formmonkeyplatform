import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { FieldType } from '../types';
import { useFieldValidation } from '../hooks/useValidation';
/**
 * FieldEditor Component
 *
 * Provides intelligent editing interface for individual parsed fields
 * with real-time validation, confidence visualization, and auto-save
 */
const FieldEditor = ({ field, onChange, autoSave = true }) => {
    const [localValue, setLocalValue] = useState(field.value);
    const [isFocused, setIsFocused] = useState(false);
    const autoSaveTimerRef = useRef(null);
    // Use the shared validation hook for real-time validation
    const { isValid, errors, warnings, isValidating, validateNow } = useFieldValidation({
        ...field,
        value: localValue
    });
    // Reset local state when field changes from parent
    useEffect(() => {
        setLocalValue(field.value);
    }, [field.value]);
    // Set up keyboard shortcuts
    useEffect(() => {
        if (!isFocused)
            return;
        const handleKeyDown = (e) => {
            // Ctrl+Enter or Alt+Enter to accept the value without validation
            if ((e.ctrlKey || e.altKey) && e.key === 'Enter') {
                commitChanges();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFocused, localValue]);
    // Handle input change with real-time validation feedback
    const handleChange = (value) => {
        setLocalValue(value);
        // Mark field as modified and set up auto-save timer
        if (autoSave) {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }
            autoSaveTimerRef.current = window.setTimeout(() => {
                if (isValid) { // Only auto-save if valid
                    commitChanges(value);
                }
            }, 1500);
        }
    };
    // Commit changes to parent component
    const commitChanges = (valueToCommit = localValue) => {
        const isChanged = valueToCommit !== field.originalValue;
        // Get validation result for the final value
        const validationResult = validateNow();
        // Update with validation feedback
        onChange({
            ...field,
            value: valueToCommit,
            isModified: isChanged,
            validationMessage: validationResult.errors.length > 0
                ? validationResult.errors[0].message
                : undefined,
            isSaving: isChanged // Mark as saving if changed
        });
    };
    // Format value based on field type
    const formatValue = (type, value) => {
        switch (type) {
            case FieldType.NUMBER:
                return value; // Keep as entered to avoid cursor position issues
            case FieldType.DATE:
                return value; // Keep as entered to avoid cursor position issues
            default:
                return value;
        }
    };
    // Get appropriate input type based on field type
    const getInputType = (type) => {
        switch (type) {
            case FieldType.DATE:
                return 'date';
            case FieldType.NUMBER:
                return 'text'; // Using text allows for better formatting control
            case FieldType.EMAIL:
                return 'email';
            case FieldType.CHECKBOX:
                return 'checkbox';
            default:
                return 'text';
        }
    };
    // Get confidence color
    const getConfidenceColor = () => {
        if (field.confidence >= 0.9)
            return 'bg-green-500';
        if (field.confidence >= 0.7)
            return 'bg-yellow-500';
        return 'bg-red-500';
    };
    // Get border class based on validation and confidence
    const getBorderClass = () => {
        if (errors.length > 0)
            return 'border-red-500';
        if (field.isModified)
            return 'border-blue-500';
        return 'border-gray-300';
    };
    return (_jsxs("div", { className: "field-editor relative", children: [_jsxs("div", { className: "flex justify-between items-center mb-1", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: field.name }), _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-16 h-1 bg-gray-200 rounded-full overflow-hidden mr-1", children: _jsx("div", { className: `h-full ${getConfidenceColor()}`, style: { width: `${field.confidence * 100}%` } }) }), _jsxs("span", { className: "text-xs text-gray-500", children: [Math.round(field.confidence * 100), "%"] })] })] }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: getInputType(field.type), value: formatValue(field.type, localValue), onChange: (e) => handleChange(e.target.value), onFocus: () => setIsFocused(true), onBlur: () => {
                            setIsFocused(false);
                            commitChanges();
                        }, className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${getBorderClass()}`, placeholder: field.type === FieldType.DATE ? 'YYYY-MM-DD' : '' }), field.isSaving && (_jsx("span", { className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500", children: _jsxs("svg", { className: "animate-spin h-4 w-4", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }) })), field.lastSaved && !field.isSaving && (_jsx("span", { className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" }) }) }))] }), errors.length > 0 && (_jsx("div", { className: "text-red-500 text-xs mt-1", children: errors[0].message })), warnings.length > 0 && (_jsxs("div", { className: "text-orange-500 text-xs mt-1", children: ["\u26A0\uFE0F ", warnings[0].message] })), field.suggestions && field.suggestions.length > 0 && (_jsxs("div", { className: "mt-1", children: [_jsx("span", { className: "text-xs text-gray-500", children: "Suggestions: " }), field.suggestions.map((suggestion, index) => (_jsx("button", { onClick: () => handleChange(suggestion), className: "inline-block text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-1 py-0.5 rounded mr-1 mb-1", children: suggestion }, index)))] })), isFocused && (_jsx("div", { className: "text-xs text-gray-400 mt-1", children: "Tip: Press Ctrl+Enter to accept" }))] }));
};
export default FieldEditor;
