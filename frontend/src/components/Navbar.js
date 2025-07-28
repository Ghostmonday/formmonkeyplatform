import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Navbar Component
 *
 * Vertical navigation sidebar with links to main application sections
 */
const Navbar = () => {
    return (_jsx("nav", { className: "bg-gray-800 text-white w-64 min-h-screen px-4 py-6", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xs uppercase tracking-wide text-gray-400 font-semibold", children: "Documents" }), _jsxs("div", { className: "mt-2 space-y-1", children: [_jsx("a", { href: "#", className: "block px-3 py-2 rounded-md bg-gray-900 text-white", children: "Upload" }), _jsx("a", { href: "#", className: "block px-3 py-2 rounded-md text-gray-300 hover:bg-gray-700", children: "Preview" }), _jsx("a", { href: "#", className: "block px-3 py-2 rounded-md text-gray-300 hover:bg-gray-700", children: "Export" })] })] }), _jsxs("div", { children: [_jsx("h2", { className: "text-xs uppercase tracking-wide text-gray-400 font-semibold", children: "Account" }), _jsxs("div", { className: "mt-2 space-y-1", children: [_jsx("a", { href: "#", className: "block px-3 py-2 rounded-md text-gray-300 hover:bg-gray-700", children: "Profile" }), _jsx("a", { href: "#", className: "block px-3 py-2 rounded-md text-gray-300 hover:bg-gray-700", children: "Settings" }), _jsx("a", { href: "#", className: "block px-3 py-2 rounded-md text-gray-300 hover:bg-gray-700", children: "Logout" })] })] })] }) }));
};
export default Navbar;
