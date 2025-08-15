package com.sajidbaba1.researchmanagementsystem.entity;

import jakarta.persistence.*;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "project_publications")
@NoArgsConstructor
@AllArgsConstructor
public class ProjectPublication {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String abstractText;
    
    @Column(nullable = false)
    private String type; // JOURNAL_ARTICLE, CONFERENCE_PAPER, BOOK_CHAPTER, TECHNICAL_REPORT, THESIS
    
    @Column
    private String journalName;
    
    @Column
    private String conferenceName;
    
    @Column
    private String authors;
    
    @Column
    private String correspondingAuthor;
    
    @Column
    private String doi;
    
    @Column
    private String issn;
    
    @Column
    private String isbn;
    
    @Column
    private String volume;
    
    @Column
    private String issue;
    
    @Column
    private String pages;
    
    @Column
    private String year;
    
    @Column
    private String publisher;
    
    @Column
    private String url;
    
    @Column
    private String keywords;
    
    @Column
    private String status; // DRAFT, SUBMITTED, UNDER_REVIEW, ACCEPTED, PUBLISHED
    
    @Column
    private LocalDateTime submissionDate;
    
    @Column
    private LocalDateTime acceptanceDate;
    
    @Column
    private LocalDateTime publicationDate;
    
    @Column
    private String impactFactor;
    
    @Column
    private Integer citations = 0;
    
    @Column
    private String openAccess; // YES, NO, EMBARGO
    
    @Column
    private String license;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private ResearchProject project;

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

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getJournalName() {
        return journalName;
    }

    public void setJournalName(String journalName) {
        this.journalName = journalName;
    }

    public String getConferenceName() {
        return conferenceName;
    }

    public void setConferenceName(String conferenceName) {
        this.conferenceName = conferenceName;
    }

    public String getAuthors() {
        return authors;
    }

    public void setAuthors(String authors) {
        this.authors = authors;
    }

    public String getCorrespondingAuthor() {
        return correspondingAuthor;
    }

    public void setCorrespondingAuthor(String correspondingAuthor) {
        this.correspondingAuthor = correspondingAuthor;
    }

    public String getDoi() {
        return doi;
    }

    public void setDoi(String doi) {
        this.doi = doi;
    }

    public String getIssn() {
        return issn;
    }

    public void setIssn(String issn) {
        this.issn = issn;
    }

    public String getIsbn() {
        return isbn;
    }

    public void setIsbn(String isbn) {
        this.isbn = isbn;
    }

    public String getVolume() {
        return volume;
    }

    public void setVolume(String volume) {
        this.volume = volume;
    }

    public String getIssue() {
        return issue;
    }

    public void setIssue(String issue) {
        this.issue = issue;
    }

    public String getPages() {
        return pages;
    }

    public void setPages(String pages) {
        this.pages = pages;
    }

    public String getYear() {
        return year;
    }

    public void setYear(String year) {
        this.year = year;
    }

    public String getPublisher() {
        return publisher;
    }

    public void setPublisher(String publisher) {
        this.publisher = publisher;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getKeywords() {
        return keywords;
    }

    public void setKeywords(String keywords) {
        this.keywords = keywords;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getSubmissionDate() {
        return submissionDate;
    }

    public void setSubmissionDate(LocalDateTime submissionDate) {
        this.submissionDate = submissionDate;
    }

    public LocalDateTime getAcceptanceDate() {
        return acceptanceDate;
    }

    public void setAcceptanceDate(LocalDateTime acceptanceDate) {
        this.acceptanceDate = acceptanceDate;
    }

    public LocalDateTime getPublicationDate() {
        return publicationDate;
    }

    public void setPublicationDate(LocalDateTime publicationDate) {
        this.publicationDate = publicationDate;
    }

    public String getImpactFactor() {
        return impactFactor;
    }

    public void setImpactFactor(String impactFactor) {
        this.impactFactor = impactFactor;
    }

    public Integer getCitations() {
        return citations;
    }

    public void setCitations(Integer citations) {
        this.citations = citations;
    }

    public String getOpenAccess() {
        return openAccess;
    }

    public void setOpenAccess(String openAccess) {
        this.openAccess = openAccess;
    }

    public String getLicense() {
        return license;
    }

    public void setLicense(String license) {
        this.license = license;
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
