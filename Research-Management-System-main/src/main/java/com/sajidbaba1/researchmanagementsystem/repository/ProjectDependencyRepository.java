package com.sajidbaba1.researchmanagementsystem.repository;

import com.sajidbaba1.researchmanagementsystem.entity.ProjectDependency;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectDependencyRepository extends JpaRepository<ProjectDependency, Long> {
    List<ProjectDependency> findByPredecessorId(Long predecessorId);
    List<ProjectDependency> findBySuccessorId(Long successorId);
}
