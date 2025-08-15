package com.sajidbaba1.researchmanagementsystem.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "project_milestones")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class ProjectMilestone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Milestone title is required")
    @Size(max = 100, message = "Milestone title must not exceed 100 characters")
    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull(message = "Due date is required")
    @Column(nullable = false)
    private LocalDate dueDate;

    @Column
    private LocalDate completionDate;

    @Column(nullable = false)
    private Integer progress = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MilestoneStatus status = MilestoneStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String deliverables;

    @Size(max = 100, message = "Responsible person must not exceed 100 characters")
    private String responsiblePerson;

    @Column(columnDefinition = "TEXT")
    private String dependencies;

    @Column(columnDefinition = "TEXT")
    private String risks;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private ResearchProject project;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public enum MilestoneStatus {
        PENDING, IN_PROGRESS, COMPLETED, CANCELLED, DELAYED
    }
}
