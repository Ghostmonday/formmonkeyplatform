import React from 'react';
import { ParsedField, FieldCategory } from "../../../../shared/types";
import FieldList from './FieldList';

interface CategorySectionProps {
  category: string;
  fields: ParsedField[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onFieldUpdate: (field: ParsedField) => void;
}

/**
 * CategorySection component for grouping fields by category
 */
const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  fields,
  isExpanded,
  onToggleExpand,
  onFieldUpdate
}) => {
  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      {/* Category Header */}
      <div 
        className="bg-gray-50 px-4 py-3 flex items-center justify-between cursor-pointer"
        onClick={onToggleExpand}
      >
        <h3 className="font-medium text-gray-800">
          {category} <span className="text-gray-500 text-sm">({fields.length})</span>
        </h3>
        <button className="text-gray-500 focus:outline-none">
          {isExpanded ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>
      
      {/* Category Fields */}
      {isExpanded && (
        <FieldList 
          fields={fields} 
          onFieldUpdate={onFieldUpdate} 
        />
      )}
    </div>
  );
};

export default CategorySection;
