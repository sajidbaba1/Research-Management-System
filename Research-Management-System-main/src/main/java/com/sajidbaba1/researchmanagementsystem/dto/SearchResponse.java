package com.sajidbaba1.researchmanagementsystem.dto;

import java.util.List;

public class SearchResponse {
    private List<SearchResult> results;
    private long totalElements;
    private int totalPages;
    private int currentPage;
    private int pageSize;
    private boolean hasNext;
    private boolean hasPrevious;
    private long searchTimeMs;
    private List<SearchFacet> facets;

    // Constructors
    public SearchResponse() {}

    public SearchResponse(List<SearchResult> results, long totalElements, int totalPages, 
                         int currentPage, int pageSize, long searchTimeMs) {
        this.results = results;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
        this.currentPage = currentPage;
        this.pageSize = pageSize;
        this.searchTimeMs = searchTimeMs;
        this.hasNext = currentPage < totalPages - 1;
        this.hasPrevious = currentPage > 0;
    }

    // Getters and Setters
    public List<SearchResult> getResults() { return results; }
    public void setResults(List<SearchResult> results) { this.results = results; }

    public long getTotalElements() { return totalElements; }
    public void setTotalElements(long totalElements) { this.totalElements = totalElements; }

    public int getTotalPages() { return totalPages; }
    public void setTotalPages(int totalPages) { this.totalPages = totalPages; }

    public int getCurrentPage() { return currentPage; }
    public void setCurrentPage(int currentPage) { this.currentPage = currentPage; }

    public int getPageSize() { return pageSize; }
    public void setPageSize(int pageSize) { this.pageSize = pageSize; }

    public boolean isHasNext() { return hasNext; }
    public void setHasNext(boolean hasNext) { this.hasNext = hasNext; }

    public boolean isHasPrevious() { return hasPrevious; }
    public void setHasPrevious(boolean hasPrevious) { this.hasPrevious = hasPrevious; }

    public long getSearchTimeMs() { return searchTimeMs; }
    public void setSearchTimeMs(long searchTimeMs) { this.searchTimeMs = searchTimeMs; }

    public List<SearchFacet> getFacets() { return facets; }
    public void setFacets(List<SearchFacet> facets) { this.facets = facets; }
}
