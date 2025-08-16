package com.sajidbaba1.researchmanagementsystem.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "project_dependencies")
public class ProjectDependency {
    public enum Type { FS, SS, FF, SF }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "predecessor_id")
    private ResearchProject predecessor;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "successor_id")
    private ResearchProject successor;

    @Enumerated(EnumType.STRING)
    private Type type = Type.FS;

    // lag days, can be negative/positive
    private int lagDays = 0;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ResearchProject getPredecessor() { return predecessor; }
    public void setPredecessor(ResearchProject predecessor) { this.predecessor = predecessor; }

    public ResearchProject getSuccessor() { return successor; }
    public void setSuccessor(ResearchProject successor) { this.successor = successor; }

    public Type getType() { return type; }
    public void setType(Type type) { this.type = type; }

    public int getLagDays() { return lagDays; }
    public void setLagDays(int lagDays) { this.lagDays = lagDays; }
}
