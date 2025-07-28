import React from 'react';

/**
 * Navbar Component
 * 
 * Vertical navigation sidebar with links to main application sections
 */
const Navbar: React.FC = () => {
  return (
    <nav className="bg-gray-800 text-white w-64 min-h-screen px-4 py-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-xs uppercase tracking-wide text-gray-400 font-semibold">
            Documents
          </h2>
          <div className="mt-2 space-y-1">
            <a href="#" className="block px-3 py-2 rounded-md bg-gray-900 text-white">
              Upload
            </a>
            <a href="#" className="block px-3 py-2 rounded-md text-gray-300 hover:bg-gray-700">
              Preview
            </a>
            <a href="#" className="block px-3 py-2 rounded-md text-gray-300 hover:bg-gray-700">
              Export
            </a>
          </div>
        </div>
        
        <div>
          <h2 className="text-xs uppercase tracking-wide text-gray-400 font-semibold">
            Account
          </h2>
          <div className="mt-2 space-y-1">
            <a href="#" className="block px-3 py-2 rounded-md text-gray-300 hover:bg-gray-700">
              Profile
            </a>
            <a href="#" className="block px-3 py-2 rounded-md text-gray-300 hover:bg-gray-700">
              Settings
            </a>
            <a href="#" className="block px-3 py-2 rounded-md text-gray-300 hover:bg-gray-700">
              Logout
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
