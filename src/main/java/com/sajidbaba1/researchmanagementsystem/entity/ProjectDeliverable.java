package com.sajidbaba1.researchmanagementsystem.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "project_deliverables")
@EntityListeners(AuditingEntityListener.class)
public class ProjectDeliverable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Deliverable title is required")
    @Size(max = 100, message = "Deliverable title must not exceed 100 characters")
    @Column(nullable = false)
    private String title;

    @Size(max = 50, message = "Type must not exceed 50 characters")
    private String type;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Size(max = 200, message = "File path must not exceed 200 characters")
    private String filePath;

    @Size(max = 100, message = "File type must not exceed 100 characters")
    private String fileType;

    @Column
    private LocalDate dueDate;

    @Column
    private LocalDate completionDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeliverableStatus status = DeliverableStatus.PENDING;

    @Size(max = 100, message = "Responsible person must not exceed 100 characters")
    private String responsiblePerson;

    @Column(columnDefinition = "TEXT")
    private String qualityCriteria;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Size(max = 20, message = "Version must not exceed 20 characters")
    private String version;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private ResearchProject project;

    public enum DeliverableStatus {
        PENDING, IN_PROGRESS, COMPLETED, APPROVED, REJECTED
    }

    public enum ApprovalStatus {
        PENDING, APPROVED, REJECTED
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

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public LocalDate getCompletionDate() {
        return completionDate;
    }

    public void setCompletionDate(LocalDate completionDate) {
        this.completionDate = completionDate;
    }

    public DeliverableStatus getStatus() {
        return status;
    }

    public void setStatus(DeliverableStatus status) {
        this.status = status;
    }

    public String getResponsiblePerson() {
        return responsiblePerson;
    }

    public void setResponsiblePerson(String responsiblePerson) {
        this.responsiblePerson = responsiblePerson;
    }

    public String getQualityCriteria() {
        return qualityCriteria;
    }

    public void setQualityCriteria(String qualityCriteria) {
        this.qualityCriteria = qualityCriteria;
    }

    public ApprovalStatus getApprovalStatus() {
        return approvalStatus;
    }

    public void setApprovalStatus(ApprovalStatus approvalStatus) {
        this.approvalStatus = approvalStatus;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
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

    public ResearchProject getProject() {
        return project;
    }

    public void setProject(ResearchProject project) {
        this.project = project;
    }
}
