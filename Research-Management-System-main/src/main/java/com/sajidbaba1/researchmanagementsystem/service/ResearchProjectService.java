package com.sajidbaba1.researchmanagementsystem.service;

import com.sajidbaba1.researchmanagementsystem.entity.ResearchProject;
import com.sajidbaba1.researchmanagementsystem.repository.ResearchProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.time.LocalDate;

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

    public List<ResearchProject> findFiltered(LocalDate from, LocalDate to, String q) {
        return repository.findFiltered(from, to, q);
    }

    public Optional<ResearchProject> updateSchedule(Long id, LocalDate startDate, LocalDate endDate) {
        Optional<ResearchProject> opt = repository.findById(id);
        if (opt.isEmpty()) return opt;
        ResearchProject p = opt.get();
        if (startDate != null) p.setStartDate(startDate);
        if (endDate != null) p.setEndDate(endDate);
        if (p.getStartDate() != null && p.getEndDate() != null && p.getEndDate().isBefore(p.getStartDate())) {
            // swap if inverted
            LocalDate s = p.getStartDate();
            p.setStartDate(p.getEndDate());
            p.setEndDate(s);
        }
        repository.save(p);
        return Optional.of(p);
    }
}