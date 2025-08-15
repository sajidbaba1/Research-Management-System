package com.sajidbaba1.researchmanagementsystem.dto;

import java.util.List;

public class AIQueryResponse {
    
    private String response;
    
    private String confidence;
    
    private List<String> sources;
    
    private Long processingTime;
    
    private String type;
    
    private String error;

    public AIQueryResponse() {}

    public AIQueryResponse(String response, String confidence, List<String> sources, Long processingTime, String type, String error) {
        this.response = response;
        this.confidence = confidence;
        this.sources = sources;
        this.processingTime = processingTime;
        this.type = type;
        this.error = error;
    }

    public String getResponse() {
        return response;
    }

    public void setResponse(String response) {
        this.response = response;
    }

    public String getConfidence() {
        return confidence;
    }

    public void setConfidence(String confidence) {
        this.confidence = confidence;
    }

    public List<String> getSources() {
        return sources;
    }

    public void setSources(List<String> sources) {
        this.sources = sources;
    }

    public Long getProcessingTime() {
        return processingTime;
    }

    public void setProcessingTime(Long processingTime) {
        this.processingTime = processingTime;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }
}
