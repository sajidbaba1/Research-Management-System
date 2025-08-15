package com.sajidbaba1.researchmanagementsystem.dto;

import java.time.LocalDateTime;
import java.util.List;

public class SearchRequest {
    private String query;
    private List<String> filters;
    private String type; // documents, team-members, universal
    private int page;
    private int size;
    private String sortBy;
    private String sortOrder;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String department;
    private String status;
    private List<String> fileTypes;

    // Constructors
    public SearchRequest() {}

    public SearchRequest(String query, int page, int size) {
        this.query = query;
        this.page = page;
        this.size = size;
    }

    // Getters and Setters
    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }

    public List<String> getFilters() { return filters; }
    public void setFilters(List<String> filters) { this.filters = filters; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }

    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }

    public String getSortBy() { return sortBy; }
    public void setSortBy(String sortBy) { this.sortBy = sortBy; }

    public String getSortOrder() { return sortOrder; }
    public void setSortOrder(String sortOrder) { this.sortOrder = sortOrder; }

    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }

    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public List<String> getFileTypes() { return fileTypes; }
    public void setFileTypes(List<String> fileTypes) { this.fileTypes = fileTypes; }
}
