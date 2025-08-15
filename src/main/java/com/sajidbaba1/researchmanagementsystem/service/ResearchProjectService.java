package com.sajidbaba1.researchmanagementsystem.service;

import com.sajidbaba1.researchmanagementsystem.entity.ResearchProject;
import com.sajidbaba1.researchmanagementsystem.repository.ResearchProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ResearchProjectService {
    @Autowired
    private ResearchProjectRepository repository;

    public List<ResearchProject> findAll() {
        return repository.findAll();
    }

    public Optional<ResearchProject> findById(Long id) {
        return repository.findById(id);
    }

    public ResearchProject save(ResearchProject project) {
        return repository.save(project);
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}