package com.sajidbaba1.researchmanagementsystem.controller;

import com.sajidbaba1.researchmanagementsystem.entity.ProjectMilestone;
import com.sajidbaba1.researchmanagementsystem.service.ProjectMilestoneService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/milestones")
@CrossOrigin(origins = "http://localhost:3000")
public class ProjectMilestoneController {
    
    @Autowired
    private ProjectMilestoneService projectMilestoneService;
    
    @GetMapping
    public List<ProjectMilestone> getAllMilestones() {
        return projectMilestoneService.findAll();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ProjectMilestone> getMilestoneById(@PathVariable Long id) {
        Optional<ProjectMilestone> milestone = projectMilestoneService.findById(id);
        return milestone.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/project/{projectId}")
    public List<ProjectMilestone> getMilestonesByProjectId(@PathVariable Long projectId) {
        return projectMilestoneService.findByProjectId(projectId);
    }
    
    @GetMapping("/project/{projectId}/status/{status}")
    public List<ProjectMilestone> getMilestonesByProjectIdAndStatus(@PathVariable Long projectId, @PathVariable String status) {
        return projectMilestoneService.findByProjectIdAndStatus(projectId, status);
    }
    
    @GetMapping("/project/{projectId}/sorted")
    public List<ProjectMilestone> getMilestonesByProjectIdSorted(@PathVariable Long projectId) {
        return projectMilestoneService.findByProjectIdOrderByDueDateAsc(projectId);
    }
    
    @PostMapping
    public ProjectMilestone createMilestone(@RequestBody ProjectMilestone milestone) {
        return projectMilestoneService.save(milestone);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ProjectMilestone> updateMilestone(@PathVariable Long id, @RequestBody ProjectMilestone milestoneDetails) {
        Optional<ProjectMilestone> existingMilestone = projectMilestoneService.findById(id);
        if (existingMilestone.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        ProjectMilestone milestone = existingMilestone.get();
        milestone.setTitle(milestoneDetails.getTitle());
        milestone.setDescription(milestoneDetails.getDescription());
        milestone.setDueDate(milestoneDetails.getDueDate());
        milestone.setCompletionDate(milestoneDetails.getCompletionDate());
        milestone.setStatus(milestoneDetails.getStatus());
        milestone.setProgress(milestoneDetails.getProgress());
        milestone.setDeliverables(milestoneDetails.getDeliverables());
        milestone.setResponsiblePerson(milestoneDetails.getResponsiblePerson());
        milestone.setDependencies(milestoneDetails.getDependencies());
        milestone.setRisks(milestoneDetails.getRisks());
        milestone.setNotes(milestoneDetails.getNotes());
        
        return ResponseEntity.ok(projectMilestoneService.save(milestone));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMilestone(@PathVariable Long id) {
        if (!projectMilestoneService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        projectMilestoneService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
