package com.sajidbaba1.researchmanagementsystem.dto;

import jakarta.validation.constraints.NotBlank;

public class AIQueryRequest {
    
    @NotBlank(message = "Query is required")
    private String query;
    
    private Long projectId;
    
    private String context;
    
    private String type;

    public AIQueryRequest() {}

    public AIQueryRequest(String query, Long projectId, String context, String type) {
        this.query = query;
        this.projectId = projectId;
        this.context = context;
        this.type = type;
    }

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public String getContext() {
        return context;
    }

    public void setContext(String context) {
        this.context = context;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}
