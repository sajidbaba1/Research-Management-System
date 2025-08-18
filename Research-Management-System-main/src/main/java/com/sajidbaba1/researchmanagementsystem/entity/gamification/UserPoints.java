package com.sajidbaba1.researchmanagementsystem.entity.gamification;

import jakarta.persistence.*;

@Entity
@Table(name = "user_points", indexes = {
        @Index(name = "idx_user_points_user", columnList = "userId", unique = true)
})
public class UserPoints {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long userId;

    @Column(nullable = false)
    private int totalPoints = 0;

    @Column(nullable = false)
    private int level = 1;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public int getTotalPoints() { return totalPoints; }
    public void setTotalPoints(int totalPoints) { this.totalPoints = totalPoints; }

    public int getLevel() { return level; }
    public void setLevel(int level) { this.level = level; }
}
