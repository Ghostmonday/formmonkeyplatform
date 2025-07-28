import React from 'react';

/**
 * Header Component
 * 
 * Displays the application header with logo, user info, and action buttons
 */
const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-blue-600 text-xl font-bold">FormMonkey</span>
            </div>
          </div>
          <div className="flex items-center">
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium">
              New Document
            </button>
            <div className="ml-4 relative">
              <div className="bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center">
                <span className="text-gray-600 text-sm">JD</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
