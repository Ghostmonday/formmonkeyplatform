import React from 'react';

export interface SearchBarProps {
  searchTerm: string;
  onSearch: (term: string) => void;
  placeholder?: string;
  className?: string;
  resultsCount?: number;
  totalCount?: number;
}

/**
 * SearchBar component for filtering fields
 */
const SearchBar: React.FC<SearchBarProps> = ({ 
  searchTerm, 
  onSearch, 
  placeholder = "Search fields...",
  className = "",
  resultsCount,
  totalCount
}) => {
  return (
    <div className={`relative ${className ? className : "w-full md:w-64"}`}>
      <input
        type="text"
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => onSearch(e.target.value)}
        aria-label="Search fields"
      />
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      
      {searchTerm && resultsCount !== undefined && (
        <div className="mt-2 text-sm text-gray-600">
          Found {resultsCount} {resultsCount === 1 ? 'result' : 'results'}
          {totalCount !== undefined && ` out of ${totalCount}`}
          {` for "${searchTerm}"`}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
