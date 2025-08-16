import React, { useState } from 'react';
import { SearchBar } from '../components/SearchBar';
import { FileText, User, Calendar, Tag, ChevronLeft, ChevronRight } from 'lucide-react';

interface SearchResult {
  id: string;
  type: string;
  title: string;
  description: string;
  contentPreview: string;
  score: number;
  url: string;
  metadata: any;
  highlight: string;
}

interface SearchResponse {
  results: SearchResult[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
  searchTimeMs: number;
}

const SearchResults: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [filters, setFilters] = useState({
    type: '',
    department: '',
    status: '',
    dateRange: ''
  });

  const handleSearch = async (query: string, searchFilters?: any) => {
    if (!query.trim()) return;

    setSearchQuery(query);
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        query,
        page: currentPage.toString(),
        size: '20',
        ...(searchFilters || {})
      });

      const response = await fetch(`/api/search?${params}`);
      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (searchQuery) {
      handleSearch(searchQuery, filters);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(0);
    if (searchQuery) {
      handleSearch(searchQuery, newFilters);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Search Results</h1>
        <SearchBar onSearch={handleSearch} />
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {searchResults && (
        <div>
          <div className="mb-4 text-sm text-gray-600">
            Found {searchResults.totalElements} results in {searchResults.searchTimeMs}ms
          </div>

          <div className="space-y-4">
            {searchResults.results.map((result) => (
              <div key={result.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      {result.type === 'document' ? (
                        <FileText className="h-5 w-5 text-blue-500 mr-2" />
                      ) : (
                        <User className="h-5 w-5 text-green-500 mr-2" />
                      )}
                      <h3 className="text-lg font-medium text-gray-900">{result.title}</h3>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{result.description}</p>
                    <p className="mt-2 text-sm text-gray-600">{result.contentPreview}</p>
                    {result.highlight && (
                      <div className="mt-2 text-sm">
                        <span className="font-medium">Relevant excerpt:</span>
                        <div className="mt-1 p-2 bg-gray-50 rounded text-sm" dangerouslySetInnerHTML={{ __html: result.highlight }} />
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {result.type}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Updated recently</span>
                  <Tag className="h-4 w-4 ml-4 mr-1" />
                  <span>Relevant</span>
                </div>
              </div>
            ))}
          </div>

          {searchResults.totalPages > 1 && (
            <div className="mt-6 flex justify-between items-center">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!searchResults.hasPrevious}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage + 1} of {searchResults.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!searchResults.hasNext}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
