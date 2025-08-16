package com.sajidbaba1.researchmanagementsystem.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "resources")
public class Resource {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "calendar_id")
    private WorkCalendar calendar;

    // nominal hours per working day
    @Column(name = "capacity_per_day_hours")
    private Double capacityPerDayHours = 8.0;

    public Resource() {}

    public Resource(String name, String role) {
        this.name = name;
        this.role = role;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public WorkCalendar getCalendar() {
        return calendar;
    }

    public void setCalendar(WorkCalendar calendar) {
        this.calendar = calendar;
    }

    public Double getCapacityPerDayHours() {
        return capacityPerDayHours != null ? capacityPerDayHours : 8.0;
    }

    public void setCapacityPerDayHours(Double capacityPerDayHours) {
        this.capacityPerDayHours = capacityPerDayHours;
    }
}
