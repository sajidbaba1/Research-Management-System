package com.sajidbaba1.researchmanagementsystem.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "work_calendars")
public class WorkCalendar {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String timezone = "UTC";

    public WorkCalendar() {}

    public WorkCalendar(String name, String timezone) {
        this.name = name;
        this.timezone = timezone;
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

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }
}
