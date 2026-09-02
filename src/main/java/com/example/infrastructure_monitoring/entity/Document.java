package com.example.infrastructure_monitoring.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "document_id")
    private Integer documentId;

    @Column(name = "project_id")
    private Integer projectId;

    @Column(name = "document_name")
    private String documentName;

    @Column(name = "document_type")
    private String documentType;

    @Column(name = "file_path")
    private String filePath;

    @Column(name = "uploaded_by")
    private Integer uploadedBy;

    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;

    protected Document() {
    }

    public Integer getDocumentId() {
        return documentId;
    }

    public Integer getProjectId() {
        return projectId;
    }

    public String getDocumentName() {
        return documentName;
    }

    public String getDocumentType() {
        return documentType;
    }

    public String getFilePath() {
        return filePath;
    }

    public Integer getUploadedBy() {
        return uploadedBy;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }
}