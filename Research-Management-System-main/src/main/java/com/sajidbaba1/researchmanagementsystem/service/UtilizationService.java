package com.sajidbaba1.researchmanagementsystem.service;

import com.sajidbaba1.researchmanagementsystem.dto.UtilizationDay;
import com.sajidbaba1.researchmanagementsystem.entity.Assignment;
import com.sajidbaba1.researchmanagementsystem.entity.Resource;
import com.sajidbaba1.researchmanagementsystem.repository.AssignmentRepository;
import com.sajidbaba1.researchmanagementsystem.repository.ResourceRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class UtilizationService {
    private final AssignmentRepository assignmentRepository;
    private final ResourceRepository resourceRepository;

    public UtilizationService(AssignmentRepository assignmentRepository, ResourceRepository resourceRepository) {
        this.assignmentRepository = assignmentRepository;
        this.resourceRepository = resourceRepository;
    }

    public List<UtilizationDay> getUtilization(LocalDate from, LocalDate to, Long resourceId) {
        if (from == null || to == null) throw new IllegalArgumentException("from/to required");
        if (to.isBefore(from)) { LocalDate t = from; from = to; to = t; }

        List<Assignment> assignments = (resourceId != null)
                ? assignmentRepository.findOverlappingForResource(from, to, resourceId)
                : assignmentRepository.findOverlapping(from, to);

        Map<LocalDate, Double> hoursByDay = new LinkedHashMap<>();
        Map<LocalDate, Double> capacityByDay = new LinkedHashMap<>();

        for (LocalDate d = from; !d.isAfter(to); d = d.plusDays(1)) {
            hoursByDay.put(d, 0.0);
            // naive default capacity: if single resource specified, use their capacity; else 8h
            double cap = 8.0;
            if (resourceId != null) {
                Optional<Resource> r = resourceRepository.findById(resourceId);
                cap = r.map(Resource::getCapacityPerDayHours).orElse(8.0);
            }
            capacityByDay.put(d, cap);
        }

        for (Assignment a : assignments) {
            LocalDate s = a.getStartDate().isBefore(from) ? from : a.getStartDate();
            LocalDate e = a.getEndDate().isAfter(to) ? to : a.getEndDate();
            long days = Math.max(1, ChronoUnit.DAYS.between(s, e) + 1);
            double perDay = (a.getEffortHours() != null ? a.getEffortHours() : 0.0) / days;
            for (LocalDate d = s; !d.isAfter(e); d = d.plusDays(1)) {
                hoursByDay.computeIfPresent(d, (k, v) -> v + perDay);
            }
        }

        List<UtilizationDay> out = new ArrayList<>();
        for (LocalDate d : hoursByDay.keySet()) {
            out.add(new UtilizationDay(d, hoursByDay.get(d), capacityByDay.get(d)));
        }
        return out;
    }
}
