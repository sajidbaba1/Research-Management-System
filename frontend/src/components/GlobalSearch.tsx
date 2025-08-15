import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { searchApi, SearchResult, SearchFilters, SearchResponse } from '../services/api';
import { 
  Search, Filter, X, Calendar, User, FileText, Target, 
  TrendingUp, AlertTriangle, Package, Award, BookOpen,
  ChevronDown, ChevronRight, Clock, Hash
} from 'lucide-react';

interface GroupedResults {
  [key: string]: SearchResult[];
}

const GlobalSearch: React.FC = () => {
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    entityTypes: [],
    dateRange: { start: '', end: '' },
    status: [],
    priority: []
  });
  const [showFilters, setShowFilters] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['projects']));

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['globalSearch', debouncedQuery, filters],
    queryFn: () => searchApi.globalSearch(debouncedQuery, filters, token!),
    enabled: !!token && debouncedQuery.length >= 2,
    staleTime: 5 * 60 * 1000
  });

  const searchResultsData: SearchResponse = searchResults || { results: [], totalResults: 0, searchTime: 0 };

  const handleFilterChange = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const entityIcons = {
    project: Target,
    task: Hash,
    milestone: Calendar,
    team_member: User,
    document: FileText,
    risk: AlertTriangle,
    deliverable: Package,
    patent: Award,
    publication: BookOpen,
    budget: TrendingUp
  };

  const entityColors = {
    project: 'text-blue-600 bg-blue-100',
    task: 'text-green-600 bg-green-100',
    milestone: 'text-purple-600 bg-purple-100',
    team_member: 'text-orange-600 bg-orange-100',
    document: 'text-indigo-600 bg-indigo-100',
    risk: 'text-red-600 bg-red-100',
    deliverable: 'text-yellow-600 bg-yellow-100',
    patent: 'text-pink-600 bg-pink-100',
    publication: 'text-teal-600 bg-teal-100',
    budget: 'text-cyan-600 bg-cyan-100'
  };

  const groupedResults = searchResultsData.results.reduce<GroupedResults>((acc, result) => {
    if (!acc[result.entityType]) {
      acc[result.entityType] = [];
    }
    acc[result.entityType].push(result);
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Global Search
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Search across all your projects, documents, and research data
        </p>
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects, documents, tasks, and more..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-lg"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-colors ${
              showFilters ? 'text-blue-600 bg-blue-100' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Entity Types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Entity Types
                </label>
                <div className="space-y-2">
                  {Object.keys(entityIcons).map(type => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.entityTypes.includes(type)}
                        onChange={(e) => {
                          const newTypes = e.target.checked
                            ? [...filters.entityTypes, type]
                            : filters.entityTypes.filter(t => t !== type);
                          handleFilterChange({ entityTypes: newTypes });
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date Range
                </label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => handleFilterChange({ 
                      dateRange: { ...filters.dateRange, start: e.target.value } 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-600 dark:text-white"
                  />
                  <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => handleFilterChange({ 
                      dateRange: { ...filters.dateRange, end: e.target.value } 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-600 dark:text-white"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <div className="space-y-2">
                  {['active', 'completed', 'pending', 'in_progress', 'cancelled'].map(status => (
                    <label key={status} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.status.includes(status)}
                        onChange={(e) => {
                          const newStatus = e.target.checked
                            ? [...filters.status, status]
                            : filters.status.filter(s => s !== status);
                          handleFilterChange({ status: newStatus });
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm capitalize">{status.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <div className="space-y-2">
                  {['high', 'medium', 'low'].map(priority => (
                    <label key={priority} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.priority.includes(priority)}
                        onChange={(e) => {
                          const newPriority = e.target.checked
                            ? [...filters.priority, priority]
                            : filters.priority.filter(p => p !== priority);
                          handleFilterChange({ priority: newPriority });
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm capitalize">{priority}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setFilters({
                  entityTypes: [],
                  dateRange: { start: '', end: '' },
                  status: [],
                  priority: []
                });
              }}
              className="mt-4 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Search Results */}
      <div className="space-y-6">
        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Searching...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 dark:text-red-400">Error performing search</p>
          </div>
        )}

        {/* No Query */}
        {!debouncedQuery && !isLoading && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Enter at least 2 characters to start searching
            </p>
          </div>
        )}

        {/* No Results */}
        {debouncedQuery && searchResultsData.results.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No results found for "{debouncedQuery}"
            </p>
          </div>
        )}

        {/* Results Summary */}
        {searchResultsData.results.length > 0 && (
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Found {searchResultsData.totalResults} results in {searchResultsData.searchTime}ms
            </p>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <Clock className="w-4 h-4 inline mr-1" />
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        )}

        {/* Grouped Results */}
        {Object.keys(groupedResults).map(entityType => {
          const Icon = entityIcons[entityType as keyof typeof entityIcons];
          const colorClasses = entityColors[entityType as keyof typeof entityColors];
          const isExpanded = expandedSections.has(entityType);
          const results = groupedResults[entityType];

          return (
            <div key={entityType} className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <button
                onClick={() => toggleSection(entityType)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${colorClasses}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 dark:text-white capitalize">
                      {entityType.replace('_', ' ')}s
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {results.length} result{results.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {isExpanded && (
                <div className="border-t border-gray-200 dark:border-gray-600">
                  {results.map((result: SearchResult, index: number) => (
                    <div
                      key={index}
                      className="p-6 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                            {result.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                            {result.content}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Hash className="w-3 h-3" />
                              ID: {result.entityId}
                            </span>
                            {result.projectName && (
                              <span className="flex items-center gap-1">
                                <Target className="w-3 h-3" />
                                {result.projectName}
                              </span>
                            )}
                            {result.lastModified && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(result.lastModified).toLocaleDateString()}
                              </span>
                            )}
                          </div>

                          {result.metadata && Object.keys(result.metadata).length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {Object.entries(result.metadata).map(([key, value]) => (
                                <span
                                  key={key}
                                  className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-xs rounded-full text-gray-700 dark:text-gray-300"
                                >
                                  {key}: {String(value)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="ml-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorClasses}`}>
                            {result.relevanceScore.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GlobalSearch;
