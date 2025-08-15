package com.sajidbaba1.researchmanagementsystem.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import jakarta.persistence.PrePersist;
import lombok.Data;

import java.util.Date;

@Entity
@Table(name = "team_members")
@Data
public class TeamMember {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    @Column(nullable = false)
    private String email;
    @Column(nullable = false)
    private String role;
    private String expertise;
    private String department;
    
    @ManyToOne
    @JoinColumn(name = "project_id", insertable = false, updatable = false)
    private ResearchProject project;
    
    @Column(name = "project_id")
    private Long projectId;
    
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "created_at")
    private Date createdAt = new Date();
    
    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
    }
}
