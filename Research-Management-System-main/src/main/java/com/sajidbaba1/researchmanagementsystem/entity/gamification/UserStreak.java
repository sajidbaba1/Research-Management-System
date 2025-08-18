package com.sajidbaba1.researchmanagementsystem.entity.gamification;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "user_streaks", indexes = {
        @Index(name = "idx_user_streak_user_type", columnList = "userId,streakType", unique = true)
})
public class UserStreak {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String streakType; // e.g., DAILY_ACTIVITY

    @Column(nullable = false)
    private int currentCount = 0;

    @Column(nullable = false)
    private int longestCount = 0;

    @Column
    private LocalDate lastActiveDate; // in user's local or server local

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getStreakType() { return streakType; }
    public void setStreakType(String streakType) { this.streakType = streakType; }

    public int getCurrentCount() { return currentCount; }
    public void setCurrentCount(int currentCount) { this.currentCount = currentCount; }

    public int getLongestCount() { return longestCount; }
    public void setLongestCount(int longestCount) { this.longestCount = longestCount; }

    public LocalDate getLastActiveDate() { return lastActiveDate; }
    public void setLastActiveDate(LocalDate lastActiveDate) { this.lastActiveDate = lastActiveDate; }
}
