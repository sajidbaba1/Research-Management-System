package com.sajidbaba1.researchmanagementsystem.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "project_risks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class ProjectRisk {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Risk title is required")
    @Size(max = 100, message = "Risk title must not exceed 100 characters")
    @Column(nullable = false)
    private String title;

    @Size(max = 50, message = "Category must not exceed 50 characters")
    private String category;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RiskLevel riskLevel = RiskLevel.LOW;

    @Column(nullable = false)
    private Integer probability = 1;

    @Column(nullable = false)
    private Integer impact = 1;

    @Column(nullable = false)
    private Integer riskScore = 1;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RiskStatus status = RiskStatus.OPEN;

    @Column(columnDefinition = "TEXT")
    private String mitigationPlan;

    @Column(columnDefinition = "TEXT")
    private String contingencyPlan;

    @Size(max = 100, message = "Owner must not exceed 100 characters")
    private String owner;

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

    public enum RiskLevel {
        LOW, MEDIUM, HIGH, CRITICAL
    }

    public enum RiskStatus {
        OPEN, MITIGATED, CLOSED
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public RiskLevel getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(RiskLevel riskLevel) {
        this.riskLevel = riskLevel;
    }

    public Integer getProbability() {
        return probability;
    }

    public void setProbability(Integer probability) {
        this.probability = probability;
    }

    public Integer getImpact() {
        return impact;
    }

    public void setImpact(Integer impact) {
        this.impact = impact;
    }

    public Integer getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(Integer riskScore) {
        this.riskScore = riskScore;
    }

    public RiskStatus getStatus() {
        return status;
    }

    public void setStatus(RiskStatus status) {
        this.status = status;
    }

    public String getMitigationPlan() {
        return mitigationPlan;
    }

    public void setMitigationPlan(String mitigationPlan) {
        this.mitigationPlan = mitigationPlan;
    }

    public String getContingencyPlan() {
        return contingencyPlan;
    }

    public void setContingencyPlan(String contingencyPlan) {
        this.contingencyPlan = contingencyPlan;
    }

    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public ResearchProject getProject() {
        return project;
    }

    public void setProject(ResearchProject project) {
        this.project = project;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
