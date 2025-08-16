package com.sajidbaba1.researchmanagementsystem.controller;

import com.sajidbaba1.researchmanagementsystem.entity.Resource;
import com.sajidbaba1.researchmanagementsystem.service.ResourceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    private final ResourceService service;

    public ResourceController(ResourceService service) {
        this.service = service;
    }

    @GetMapping
    public List<Resource> list() { return service.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> get(@PathVariable Long id) {
        return service.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Resource> create(@RequestBody Resource r) {
        Resource saved = service.save(r);
        return ResponseEntity.created(URI.create("/api/resources/" + saved.getId())).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Resource> update(@PathVariable Long id, @RequestBody Resource r) {
        return service.findById(id).map(existing -> {
            existing.setName(r.getName());
            existing.setRole(r.getRole());
            existing.setCalendar(r.getCalendar());
            existing.setCapacityPerDayHours(r.getCapacityPerDayHours());
            return ResponseEntity.ok(service.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
