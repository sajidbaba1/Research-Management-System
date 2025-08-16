package com.sajidbaba1.researchmanagementsystem.repository;

import com.sajidbaba1.researchmanagementsystem.entity.ProjectDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectDocumentRepository extends JpaRepository<ProjectDocument, Long> {
    List<ProjectDocument> findByProjectId(Long projectId);
    List<ProjectDocument> findByFileType(String fileType);
    List<ProjectDocument> findByUploadedBy(String uploadedBy);
}
