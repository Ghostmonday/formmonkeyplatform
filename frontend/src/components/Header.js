import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Header Component
 *
 * Displays the application header with logo, user info, and action buttons
 */
const Header = () => {
    return (_jsx("header", { className: "bg-white shadow-md", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "flex justify-between items-center h-16", children: [_jsx("div", { className: "flex items-center", children: _jsx("div", { className: "flex-shrink-0", children: _jsx("span", { className: "text-blue-600 text-xl font-bold", children: "FormMonkey" }) }) }), _jsxs("div", { className: "flex items-center", children: [_jsx("button", { className: "bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium", children: "New Document" }), _jsx("div", { className: "ml-4 relative", children: _jsx("div", { className: "bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center", children: _jsx("span", { className: "text-gray-600 text-sm", children: "JD" }) }) })] })] }) }) }));
};
export default Header;
