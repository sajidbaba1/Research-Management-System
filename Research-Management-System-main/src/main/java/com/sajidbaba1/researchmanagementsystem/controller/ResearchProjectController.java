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
    public List<ResearchProject> getAll() {
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