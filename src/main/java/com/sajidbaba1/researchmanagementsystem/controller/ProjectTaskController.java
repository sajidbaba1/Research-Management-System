package com.sajidbaba1.researchmanagementsystem.controller;

import com.sajidbaba1.researchmanagementsystem.entity.ProjectTask;
import com.sajidbaba1.researchmanagementsystem.service.ProjectTaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:3000")
public class ProjectTaskController {
    
    @Autowired
    private ProjectTaskService projectTaskService;
    
    @GetMapping
    public List<ProjectTask> getAllTasks() {
        return projectTaskService.findAll();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ProjectTask> getTaskById(@PathVariable Long id) {
        Optional<ProjectTask> task = projectTaskService.findById(id);
        return task.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/project/{projectId}")
    public List<ProjectTask> getTasksByProjectId(@PathVariable Long projectId) {
        return projectTaskService.findByProjectId(projectId);
    }
    
    @GetMapping("/project/{projectId}/status/{status}")
    public List<ProjectTask> getTasksByProjectIdAndStatus(@PathVariable Long projectId, @PathVariable String status) {
        return projectTaskService.findByProjectIdAndStatus(projectId, status);
    }
    
    @GetMapping("/project/{projectId}/assigned/{assignedToId}")
    public List<ProjectTask> getTasksByProjectIdAndAssignedToId(@PathVariable Long projectId, @PathVariable Long assignedToId) {
        return projectTaskService.findByProjectIdAndAssignedToId(projectId, assignedToId);
    }
    
    @GetMapping("/project/{projectId}/priority/{priority}")
    public List<ProjectTask> getTasksByProjectIdAndPriority(@PathVariable Long projectId, @PathVariable String priority) {
        return projectTaskService.findByProjectIdAndPriority(projectId, priority);
    }
    
    @GetMapping("/project/{projectId}/sorted")
    public List<ProjectTask> getTasksByProjectIdSorted(@PathVariable Long projectId) {
        return projectTaskService.findByProjectIdOrderByDueDateAsc(projectId);
    }
    
    @PostMapping
    public ProjectTask createTask(@RequestBody ProjectTask task) {
        return projectTaskService.save(task);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ProjectTask> updateTask(@PathVariable Long id, @RequestBody ProjectTask taskDetails) {
        Optional<ProjectTask> existingTask = projectTaskService.findById(id);
        if (existingTask.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        ProjectTask task = existingTask.get();
        task.setTitle(taskDetails.getTitle());
        task.setDescription(taskDetails.getDescription());
        task.setStatus(taskDetails.getStatus());
        task.setPriority(taskDetails.getPriority());
        task.setDueDate(taskDetails.getDueDate());
        task.setCompletionDate(taskDetails.getCompletionDate());
        task.setAssignedTo(taskDetails.getAssignedTo());
        task.setEstimatedHours(taskDetails.getEstimatedHours());
        task.setActualHours(taskDetails.getActualHours());
        task.setTags(taskDetails.getTags());
        task.setDependencies(taskDetails.getDependencies());
        task.setNotes(taskDetails.getNotes());
        
        return ResponseEntity.ok(projectTaskService.save(task));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        if (!projectTaskService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        projectTaskService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
