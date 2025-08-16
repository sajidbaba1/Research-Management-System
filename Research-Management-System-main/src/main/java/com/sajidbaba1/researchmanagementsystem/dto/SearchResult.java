package com.sajidbaba1.researchmanagementsystem.dto;

public class SearchResult {
    private String id;
    private String type; // document, team-member, project
    private String title;
    private String description;
    private String contentPreview;
    private double score;
    private String url;
    private Object metadata;
    private String highlight;

    // Constructors
    public SearchResult() {}

    public SearchResult(String id, String type, String title, String description, 
                       String contentPreview, double score) {
        this.id = id;
        this.type = type;
        this.title = title;
        this.description = description;
        this.contentPreview = contentPreview;
        this.score = score;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getContentPreview() { return contentPreview; }
    public void setContentPreview(String contentPreview) { this.contentPreview = contentPreview; }

    public double getScore() { return score; }
    public void setScore(double score) { this.score = score; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public Object getMetadata() { return metadata; }
    public void setMetadata(Object metadata) { this.metadata = metadata; }

    public String getHighlight() { return highlight; }
    public void setHighlight(String highlight) { this.highlight = highlight; }
}
