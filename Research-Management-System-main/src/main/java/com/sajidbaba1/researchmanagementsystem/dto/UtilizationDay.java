package com.sajidbaba1.researchmanagementsystem.dto;

import java.time.LocalDate;

public class UtilizationDay {
    private LocalDate date;
    private double hours;
    private double capacityHours;

    public UtilizationDay() {}

    public UtilizationDay(LocalDate date, double hours, double capacityHours) {
        this.date = date;
        this.hours = hours;
        this.capacityHours = capacityHours;
    }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public double getHours() { return hours; }
    public void setHours(double hours) { this.hours = hours; }

    public double getCapacityHours() { return capacityHours; }
    public void setCapacityHours(double capacityHours) { this.capacityHours = capacityHours; }
}
