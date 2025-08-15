import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { debounce } from 'lodash';

interface SearchBarProps {
  onSearch: (query: string, filters?: any) => void;
  placeholder?: string;
  showFilters?: boolean;
}

interface SearchSuggestion {
  text: string;
  type: 'document' | 'team-member' | 'project';
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = "Search documents, team members...",
  showFilters = true
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    type: '',
    dateRange: '',
    department: '',
    status: ''
  });

  // Debounced search suggestions
  const debouncedSuggestions = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `http://localhost:8080/api/search/suggestions?query=${encodeURIComponent(searchQuery)}`
        );
        const data = await response.json();
        
        const formattedSuggestions = data.map((suggestion: string) => ({
          text: suggestion,
          type: 'document' as const
        }));
        
        setSuggestions(formattedSuggestions);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSuggestions(query);
  }, [query, debouncedSuggestions]);

  const handleSearch = (searchQuery?: string) => {
    const searchTerm = searchQuery || query;
    if (searchTerm.trim()) {
      onSearch(searchTerm, selectedFilters);
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    handleSearch(suggestion.text);
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
          </div>
        )}
        {query && !isLoading && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <ul className="max-h-60 overflow-auto">
            {suggestions.map((suggestion, index) => (
              <li key={index}>
                <button
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                >
                  <div className="flex items-center">
                    <Search className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm">{suggestion.text}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Advanced filters */}
      {showFilters && (
        <div className="mt-2 flex gap-2 flex-wrap">
          <select
            value={selectedFilters.type}
            onChange={(e) => setSelectedFilters({...selectedFilters, type: e.target.value})}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="">All Types</option>
            <option value="document">Documents</option>
            <option value="team-member">Team Members</option>
            <option value="project">Projects</option>
          </select>

          <select
            value={selectedFilters.department}
            onChange={(e) => setSelectedFilters({...selectedFilters, department: e.target.value})}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Research">Research</option>
            <option value="Design">Design</option>
            <option value="Marketing">Marketing</option>
          </select>

          <select
            value={selectedFilters.status}
            onChange={(e) => setSelectedFilters({...selectedFilters, status: e.target.value})}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="ON_LEAVE">On Leave</option>
          </select>
        </div>
      )}
    </div>
  );
};
