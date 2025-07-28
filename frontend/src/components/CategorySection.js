import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import FieldList from './FieldList';
/**
 * CategorySection component for grouping fields by category
 */
const CategorySection = ({ category, fields, isExpanded, onToggleExpand, onFieldUpdate }) => {
    return (_jsxs("div", { className: "border border-gray-200 rounded-md overflow-hidden", children: [_jsxs("div", { className: "bg-gray-50 px-4 py-3 flex items-center justify-between cursor-pointer", onClick: onToggleExpand, children: [_jsxs("h3", { className: "font-medium text-gray-800", children: [category, " ", _jsxs("span", { className: "text-gray-500 text-sm", children: ["(", fields.length, ")"] })] }), _jsx("button", { className: "text-gray-500 focus:outline-none", children: isExpanded ? (_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" }) })) : (_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) })) })] }), isExpanded && (_jsx(FieldList, { fields: fields, onFieldUpdate: onFieldUpdate }))] }));
};
export default CategorySection;
