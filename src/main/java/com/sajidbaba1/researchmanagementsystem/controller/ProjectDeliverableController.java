package com.sajidbaba1.researchmanagementsystem.controller;

import com.sajidbaba1.researchmanagementsystem.entity.ProjectDeliverable;
import com.sajidbaba1.researchmanagementsystem.service.ProjectDeliverableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/deliverables")
@CrossOrigin(origins = "http://localhost:3000")
public class ProjectDeliverableController {
    
    @Autowired
    private ProjectDeliverableService projectDeliverableService;
    
    @GetMapping
    public List<ProjectDeliverable> getAllDeliverables() {
        return projectDeliverableService.findAll();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ProjectDeliverable> getDeliverableById(@PathVariable Long id) {
        Optional<ProjectDeliverable> deliverable = projectDeliverableService.findById(id);
        return deliverable.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/project/{projectId}")
    public List<ProjectDeliverable> getDeliverablesByProjectId(@PathVariable Long projectId) {
        return projectDeliverableService.findByProjectId(projectId);
    }
    
    @GetMapping("/project/{projectId}/status/{status}")
    public List<ProjectDeliverable> getDeliverablesByProjectIdAndStatus(@PathVariable Long projectId, @PathVariable String status) {
        return projectDeliverableService.findByProjectIdAndStatus(projectId, status);
    }
    
    @GetMapping("/project/{projectId}/type/{type}")
    public List<ProjectDeliverable> getDeliverablesByProjectIdAndType(@PathVariable Long projectId, @PathVariable String type) {
        return projectDeliverableService.findByProjectIdAndType(projectId, type);
    }
    
    @PostMapping
    public ProjectDeliverable createDeliverable(@RequestBody ProjectDeliverable deliverable) {
        return projectDeliverableService.save(deliverable);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ProjectDeliverable> updateDeliverable(@PathVariable Long id, @RequestBody ProjectDeliverable deliverableDetails) {
        Optional<ProjectDeliverable> existingDeliverable = projectDeliverableService.findById(id);
        if (existingDeliverable.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        ProjectDeliverable deliverable = existingDeliverable.get();
        deliverable.setTitle(deliverableDetails.getTitle());
        deliverable.setDescription(deliverableDetails.getDescription());
        deliverable.setType(deliverableDetails.getType());
        deliverable.setStatus(deliverableDetails.getStatus());
        deliverable.setDueDate(deliverableDetails.getDueDate());
        deliverable.setCompletionDate(deliverableDetails.getCompletionDate());
        deliverable.setResponsiblePerson(deliverableDetails.getResponsiblePerson());
        deliverable.setFilePath(deliverableDetails.getFilePath());
        deliverable.setVersion(deliverableDetails.getVersion());
        deliverable.setQualityCriteria(deliverableDetails.getQualityCriteria());
        deliverable.setApprovalStatus(deliverableDetails.getApprovalStatus());
        deliverable.setNotes(deliverableDetails.getNotes());
        
        return ResponseEntity.ok(projectDeliverableService.save(deliverable));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDeliverable(@PathVariable Long id) {
        if (!projectDeliverableService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        projectDeliverableService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
