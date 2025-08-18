package com.sajidbaba1.researchmanagementsystem.entity.gamification;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "gamification_events", indexes = {
        @Index(name = "idx_gam_event_user", columnList = "userId"),
        @Index(name = "idx_gam_event_type", columnList = "eventType"),
        @Index(name = "idx_gam_event_created", columnList = "createdAt")
})
public class GamificationEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String eventType;

    @Column(nullable = false)
    private int pointsAwarded;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public int getPointsAwarded() { return pointsAwarded; }
    public void setPointsAwarded(int pointsAwarded) { this.pointsAwarded = pointsAwarded; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
