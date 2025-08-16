package com.sajidbaba1.researchmanagementsystem.service;

import com.sajidbaba1.researchmanagementsystem.entity.Resource;
import com.sajidbaba1.researchmanagementsystem.repository.ResourceRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ResourceService {
    private final ResourceRepository repository;

    public ResourceService(ResourceRepository repository) {
        this.repository = repository;
    }

    public List<Resource> findAll() { return repository.findAll(); }
    public Optional<Resource> findById(Long id) { return repository.findById(id); }
    public Resource save(Resource r) { return repository.save(r); }
    public void delete(Long id) { repository.deleteById(id); }
}
