package com.sajidbaba1.researchmanagementsystem.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "project_constraints")
public class ProjectConstraint {
    public enum Type { HARD, SOFT }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private ResearchProject project;

    @Enumerated(EnumType.STRING)
    private Type type;

    private LocalDate date;

    @Column(length = 1000)
    private String note;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ResearchProject getProject() { return project; }
    public void setProject(ResearchProject project) { this.project = project; }

    public Type getType() { return type; }
    public void setType(Type type) { this.type = type; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
