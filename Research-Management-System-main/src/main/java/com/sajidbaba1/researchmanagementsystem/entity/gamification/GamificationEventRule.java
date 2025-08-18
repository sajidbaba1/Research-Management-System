package com.sajidbaba1.researchmanagementsystem.entity.gamification;

import jakarta.persistence.*;

@Entity
@Table(name = "gamification_event_rules")
public class GamificationEventRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String eventType; // e.g., PROJECT_MILESTONE_COMPLETED

    @Column(nullable = false)
    private int points; // points awarded per event

    @Column(nullable = true)
    private Integer cooldownSeconds; // optional cooldown between same events for a user

    @Column(nullable = true)
    private Integer dailyCap; // optional max number of times per day that award points

    @Column(nullable = false)
    private boolean active = true;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public int getPoints() { return points; }
    public void setPoints(int points) { this.points = points; }

    public Integer getCooldownSeconds() { return cooldownSeconds; }
    public void setCooldownSeconds(Integer cooldownSeconds) { this.cooldownSeconds = cooldownSeconds; }

    public Integer getDailyCap() { return dailyCap; }
    public void setDailyCap(Integer dailyCap) { this.dailyCap = dailyCap; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
