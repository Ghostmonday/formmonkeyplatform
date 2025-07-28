import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Header from './components/Header';
import Navbar from './components/Navbar';
/**
 * FormMonkey App Root Component
 *
 * Tasks:
 * - Set up the global application layout using React + Tailwind
 * - Initialize routing for major pages (Upload, Preview, Profile, Export)
 * - Include top-level context providers (Theme, Auth, Toast, etc.)
 * - Handle redirect for unauthenticated users
 * - Mount shared UI components (e.g., Navbar, Header)
 *
 * Routing & Navigation:
- React Router setup with protected routes
- Deep linking support for document editing workflows
- Navigation guards for authentication-required pages
- State preservation across route changes

Context Providers:
- Authentication context with user session management
- Theme context for dark/light mode support
- Toast notifications for user feedback
- Form data context for cross-page state persistence
*/
const App = () => {
    return (_jsxs("div", { className: "min-h-screen bg-gray-100", children: [_jsx(Header, {}), _jsxs("div", { className: "flex", children: [_jsx(Navbar, {}), _jsx("main", { className: "flex-1 p-6", children: _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-800 mb-4", children: "FormMonkey" }), _jsx("p", { className: "text-gray-600", children: "Document processing and form extraction platform" })] }) })] })] }));
};
export default App;
