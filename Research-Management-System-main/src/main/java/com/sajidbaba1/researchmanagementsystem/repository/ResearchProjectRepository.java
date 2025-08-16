package com.sajidbaba1.researchmanagementsystem.repository;

import com.sajidbaba1.researchmanagementsystem.entity.ResearchProject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.time.LocalDate;

public interface ResearchProjectRepository extends JpaRepository<ResearchProject, Long> {
    
    @Query("SELECT COUNT(p) FROM ResearchProject p WHERE p.status = :status")
    long countByStatus(@Param("status") String status);
    
    @Query("SELECT p.status, COUNT(p) FROM ResearchProject p GROUP BY p.status")
    List<Object[]> countByStatus();

    @Query("""
        SELECT p FROM ResearchProject p
        WHERE (:from IS NULL OR p.endDate >= :from)
          AND (:to IS NULL OR p.startDate <= :to)
          AND (
                :q IS NULL OR :q = '' OR 
                LOWER(p.title) LIKE LOWER(CONCAT('%', :q, '%')) OR
                LOWER(p.description) LIKE LOWER(CONCAT('%', :q, '%')) OR
                LOWER(p.status) LIKE LOWER(CONCAT('%', :q, '%'))
          )
        ORDER BY p.startDate ASC
    """)
    List<ResearchProject> findFiltered(
            @Param("from") LocalDate from,
            @Param("to") LocalDate to,
            @Param("q") String q
    );
}