package com.sajidbaba1.researchmanagementsystem.repository;

import com.sajidbaba1.researchmanagementsystem.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

    @Query("""
        SELECT a FROM Assignment a
        WHERE a.endDate >= :from AND a.startDate <= :to
    """)
    List<Assignment> findOverlapping(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("""
        SELECT a FROM Assignment a
        WHERE a.endDate >= :from AND a.startDate <= :to AND a.resource.id = :resourceId
    """)
    List<Assignment> findOverlappingForResource(@Param("from") LocalDate from, @Param("to") LocalDate to, @Param("resourceId") Long resourceId);
}
