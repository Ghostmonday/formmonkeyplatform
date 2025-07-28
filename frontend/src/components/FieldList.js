import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import FieldEditor from './FieldEditor';
/**
 * FieldList component for rendering individual fields
 */
const FieldList = ({ fields, onFieldUpdate }) => {
    // Format confidence indicator
    const getConfidenceColor = (confidence) => {
        if (confidence > 0.9)
            return 'bg-green-500';
        if (confidence > 0.7)
            return 'bg-yellow-500';
        return 'bg-red-500';
    };
    // Handle reset of field to original value
    const handleReset = (field) => {
        onFieldUpdate({
            ...field,
            value: field.originalValue,
            isModified: false
        });
    };
    return (_jsx("div", { className: "divide-y divide-gray-200", children: fields.map(field => (_jsxs("div", { className: "p-4", children: [_jsxs("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between gap-2", children: [_jsxs("div", { className: "w-full md:w-1/3", children: [_jsx("p", { className: "font-medium text-gray-700", children: field.name }), _jsxs("div", { className: "flex items-center mt-1", children: [_jsx("div", { className: "h-1 w-20 bg-gray-200 rounded-full overflow-hidden", title: `${Math.round(field.confidence * 100)}% confidence`, children: _jsx("div", { className: `h-full ${getConfidenceColor(field.confidence)}`, style: { width: `${field.confidence * 100}%` } }) }), _jsxs("span", { className: "text-xs ml-2 text-gray-500", children: [Math.round(field.confidence * 100), "%"] })] })] }), _jsxs("div", { className: "w-full md:w-2/3 flex items-center gap-2", children: [_jsx(FieldEditor, { field: field, onChange: onFieldUpdate }), field.isModified && (_jsx("button", { className: "text-gray-500 hover:text-gray-700 mt-1", onClick: () => handleReset(field), title: "Reset to original", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" }) }) }))] })] }), field.originalValue !== field.value && (_jsxs("div", { className: "mt-2 text-xs text-gray-500 italic", children: ["Original: ", field.originalValue] }))] }, field.id))) }));
};
export default FieldList;
