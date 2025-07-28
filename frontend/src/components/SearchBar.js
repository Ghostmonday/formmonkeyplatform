import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * SearchBar component for filtering fields
 */
const SearchBar = ({ searchTerm, onSearch, placeholder = "Search fields...", className = "", resultsCount, totalCount }) => {
    return (_jsxs("div", { className: `relative ${className ? className : "w-full md:w-64"}`, children: [_jsx("input", { type: "text", className: "w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent", placeholder: placeholder, value: searchTerm, onChange: (e) => onSearch(e.target.value), "aria-label": "Search fields" }), _jsx("div", { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }) }), searchTerm && resultsCount !== undefined && (_jsxs("div", { className: "mt-2 text-sm text-gray-600", children: ["Found ", resultsCount, " ", resultsCount === 1 ? 'result' : 'results', totalCount !== undefined && ` out of ${totalCount}`, ` for "${searchTerm}"`] }))] }));
};
export default SearchBar;
