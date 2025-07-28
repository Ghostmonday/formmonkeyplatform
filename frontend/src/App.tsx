import React from 'react';
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

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex">
        <Navbar />
        <main className="flex-1 p-6">
          {/* Content will go here when routing is implemented */}
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">FormMonkey</h1>
            <p className="text-gray-600">
              Document processing and form extraction platform
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
