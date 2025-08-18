package com.sajidbaba1.researchmanagementsystem.dto.gamification;

public class GamificationEventRequest {
    private Long userId;
    private String eventType;

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }
}
