package com.sajidbaba1.researchmanagementsystem.controller;

import com.sajidbaba1.researchmanagementsystem.entity.ResearchProject;
import com.sajidbaba1.researchmanagementsystem.service.ResearchProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/projects")
public class ResearchProjectController {
    @Autowired
    private ResearchProjectService service;

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
        return service.save(project);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResearchProject> update(@PathVariable Long id, @RequestBody ResearchProject project) {
        Optional<ResearchProject> existing = service.findById(id);
        if (existing.isPresent()) {
            project.setId(id);
            return ResponseEntity.ok(service.save(project));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}