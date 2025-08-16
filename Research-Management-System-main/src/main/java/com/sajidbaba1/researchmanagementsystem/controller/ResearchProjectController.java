package com.sajidbaba1.researchmanagementsystem.controller;

import com.sajidbaba1.researchmanagementsystem.entity.ResearchProject;
import com.sajidbaba1.researchmanagementsystem.entity.ResearchAnalytics;
import com.sajidbaba1.researchmanagementsystem.service.ResearchProjectService;
import com.sajidbaba1.researchmanagementsystem.service.ResearchAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/projects")
public class ResearchProjectController {
    @Autowired
    private ResearchProjectService service;

    @Autowired
    private ResearchAnalyticsService analyticsService;

    @GetMapping
    public List<ResearchProject> getAll(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(required = false) String q
    ) {
        LocalDate fromDate = null;
        LocalDate toDate = null;
        try { if (from != null && !from.isBlank()) fromDate = LocalDate.parse(from); } catch (Exception ignored) {}
        try { if (to != null && !to.isBlank()) toDate = LocalDate.parse(to); } catch (Exception ignored) {}
        if (fromDate != null || toDate != null || (q != null && !q.isBlank())) {
            return service.findFiltered(fromDate, toDate, q);
        }
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResearchProject> getById(@PathVariable Long id) {
        Optional<ResearchProject> project = service.findById(id);
        return project.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResearchProject create(@RequestBody ResearchProject project) {
        ResearchProject savedProject = service.save(project);
        
        // Create analytics entry for the new project
        analyticsService.calculateProjectAnalytics(savedProject.getId());
        
        return savedProject;
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResearchProject> update(@PathVariable Long id, @RequestBody ResearchProject project) {
        Optional<ResearchProject> existing = service.findById(id);
        if (existing.isPresent()) {
            ResearchProject updatedProject = service.save(project);
            
            // Update analytics entry
            analyticsService.calculateProjectAnalytics(updatedProject.getId());
            
            return ResponseEntity.ok(updatedProject);
        }
        return ResponseEntity.notFound().build();
    }

    public static class ScheduleUpdateRequest {
        public String startDate; // ISO yyyy-MM-dd
        public String endDate;   // ISO yyyy-MM-dd
        public String getStartDate() { return startDate; }
        public void setStartDate(String startDate) { this.startDate = startDate; }
        public String getEndDate() { return endDate; }
        public void setEndDate(String endDate) { this.endDate = endDate; }
    }

    @PutMapping("/{id}/schedule")
    public ResponseEntity<ResearchProject> updateSchedule(@PathVariable Long id, @RequestBody ScheduleUpdateRequest req) {
        LocalDate s = null, e = null;
        try { if (req.startDate != null && !req.startDate.isBlank()) s = LocalDate.parse(req.startDate); } catch (Exception ignored) {}
        try { if (req.endDate != null && !req.endDate.isBlank()) e = LocalDate.parse(req.endDate); } catch (Exception ignored) {}
        Optional<ResearchProject> updated = service.updateSchedule(id, s, e);
        return updated.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        // Delete associated analytics
        List<ResearchAnalytics> analyticsList = analyticsService.getAnalyticsByProjectId(id);
        if (!analyticsList.isEmpty()) {
            analyticsService.deleteById(analyticsList.get(0).getId());
        }
        
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}