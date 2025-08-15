package com.sajidbaba1.researchmanagementsystem.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "project_patents")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectPatent {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String abstractText;
    
    @Column(nullable = false)
    private String patentNumber;
    
    @Column(nullable = false)
    private String type; // UTILITY, DESIGN, PLANT, PROVISIONAL
    
    @Column
    private String status; // FILED, PENDING, EXAMINED, GRANTED, ABANDONED
    
    @Column
    private String inventors;
    
    @Column
    private String assignee;
    
    @Column
    private String patentOffice; // USPTO, EPO, WIPO, JPO, etc.
    
    @Column
    private LocalDateTime filingDate;
    
    @Column
    private LocalDateTime publicationDate;
    
    @Column
    private LocalDateTime grantDate;
    
    @Column
    private LocalDateTime priorityDate;
    
    @Column
    private String licensingStatus;
    
    @Column
    private Double revenueGenerated;
    
    @ManyToOne
    @JoinColumn(name = "project_id")
    private ResearchProject project;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column
    private String ipcClass;

    @Column
    private String cpcClass;

    @Column(columnDefinition = "TEXT")
    private String claims;

    @Column(columnDefinition = "TEXT")
    private String drawings;

    @Column
    private String url;

    @Column
    private String commercializationStatus;

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

    public String getAbstractText() {
        return abstractText;
    }

    public void setAbstractText(String abstractText) {
        this.abstractText = abstractText;
    }

    public String getPatentNumber() {
        return patentNumber;
    }

    public void setPatentNumber(String patentNumber) {
        this.patentNumber = patentNumber;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getInventors() {
        return inventors;
    }

    public void setInventors(String inventors) {
        this.inventors = inventors;
    }

    public String getAssignee() {
        return assignee;
    }

    public void setAssignee(String assignee) {
        this.assignee = assignee;
    }

    public String getPatentOffice() {
        return patentOffice;
    }

    public void setPatentOffice(String patentOffice) {
        this.patentOffice = patentOffice;
    }

    public LocalDateTime getFilingDate() {
        return filingDate;
    }

    public void setFilingDate(LocalDateTime filingDate) {
        this.filingDate = filingDate;
    }

    public LocalDateTime getPublicationDate() {
        return publicationDate;
    }

    public void setPublicationDate(LocalDateTime publicationDate) {
        this.publicationDate = publicationDate;
    }

    public LocalDateTime getGrantDate() {
        return grantDate;
    }

    public void setGrantDate(LocalDateTime grantDate) {
        this.grantDate = grantDate;
    }

    public LocalDateTime getPriorityDate() {
        return priorityDate;
    }

    public void setPriorityDate(LocalDateTime priorityDate) {
        this.priorityDate = priorityDate;
    }

    public String getLicensingStatus() {
        return licensingStatus;
    }

    public void setLicensingStatus(String licensingStatus) {
        this.licensingStatus = licensingStatus;
    }

    public Double getRevenueGenerated() {
        return revenueGenerated;
    }

    public void setRevenueGenerated(Double revenueGenerated) {
        this.revenueGenerated = revenueGenerated;
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

    public String getIpcClass() {
        return ipcClass;
    }

    public void setIpcClass(String ipcClass) {
        this.ipcClass = ipcClass;
    }

    public String getCpcClass() {
        return cpcClass;
    }

    public void setCpcClass(String cpcClass) {
        this.cpcClass = cpcClass;
    }

    public String getClaims() {
        return claims;
    }

    public void setClaims(String claims) {
        this.claims = claims;
    }

    public String getDrawings() {
        return drawings;
    }

    public void setDrawings(String drawings) {
        this.drawings = drawings;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getCommercializationStatus() {
        return commercializationStatus;
    }

    public void setCommercializationStatus(String commercializationStatus) {
        this.commercializationStatus = commercializationStatus;
    }
}
