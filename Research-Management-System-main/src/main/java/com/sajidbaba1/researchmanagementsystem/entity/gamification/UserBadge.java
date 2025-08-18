package com.sajidbaba1.researchmanagementsystem.entity.gamification;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "user_badges", indexes = {
        @Index(name = "idx_user_badge_user", columnList = "userId"),
        @Index(name = "idx_user_badge_code", columnList = "badgeCode")
})
public class UserBadge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String badgeCode;

    @Column(nullable = false)
    private Instant awardedAt = Instant.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getBadgeCode() { return badgeCode; }
    public void setBadgeCode(String badgeCode) { this.badgeCode = badgeCode; }

    public Instant getAwardedAt() { return awardedAt; }
    public void setAwardedAt(Instant awardedAt) { this.awardedAt = awardedAt; }
}
