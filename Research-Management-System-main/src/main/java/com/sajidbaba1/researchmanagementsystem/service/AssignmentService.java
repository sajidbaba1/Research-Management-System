package com.sajidbaba1.researchmanagementsystem.service;

import com.sajidbaba1.researchmanagementsystem.entity.Assignment;
import com.sajidbaba1.researchmanagementsystem.repository.AssignmentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class AssignmentService {
    private final AssignmentRepository repository;

    public AssignmentService(AssignmentRepository repository) {
        this.repository = repository;
    }

    public List<Assignment> findAll() { return repository.findAll(); }
    public Optional<Assignment> findById(Long id) { return repository.findById(id); }
    public Assignment save(Assignment a) { return repository.save(a); }
    public void delete(Long id) { repository.deleteById(id); }

    public List<Assignment> findOverlapping(LocalDate from, LocalDate to) {
        return repository.findOverlapping(from, to);
    }
}
