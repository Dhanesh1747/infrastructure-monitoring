package com.example.infrastructure_monitoring.controller;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final JdbcTemplate jdbcTemplate;

    public DocumentController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }
    @GetMapping
public List<Map<String, Object>> getAllDocuments() {
    return jdbcTemplate.queryForList(
            "SELECT * FROM documents ORDER BY document_id"
    );
}

    @GetMapping("/{documentId}")
    public Map<String, Object> getDocumentById(
            @PathVariable Integer documentId
    ) {
        try {
            return jdbcTemplate.queryForMap(
                    "SELECT * FROM documents WHERE document_id = ?",
                    documentId
            );
        } catch (Exception exception) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Document not found"
            );
        }
    }

    @PostMapping
    public Map<String, Object> createDocument(
            @RequestBody DocumentRequest request
    ) {
        int rowsInserted = jdbcTemplate.update(
                """
                INSERT INTO documents
                (project_id, document_name, document_type,
                 file_path, uploaded_by)
                VALUES (?, ?, ?, ?, ?)
                """,
                request.projectId(),
                request.documentName(),
                request.documentType(),
                request.filePath(),
                request.uploadedBy()
        );

        if (rowsInserted == 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Document could not be created"
            );
        }

        return jdbcTemplate.queryForMap(
                "SELECT * FROM documents WHERE document_id = LAST_INSERT_ID()"
        );
    }

    @PatchMapping("/{documentId}")
    public Map<String, Object> updateDocument(
            @PathVariable Integer documentId,
            @RequestBody DocumentRequest request
    ) {
        int rowsUpdated = jdbcTemplate.update(
                """
                UPDATE documents
                SET project_id = ?,
                    document_name = ?,
                    document_type = ?,
                    file_path = ?,
                    uploaded_by = ?
                WHERE document_id = ?
                """,
                request.projectId(),
                request.documentName(),
                request.documentType(),
                request.filePath(),
                request.uploadedBy(),
                documentId
        );

        if (rowsUpdated == 0) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Document not found"
            );
        }

        return getDocumentById(documentId);
    }

    @DeleteMapping("/{documentId}")
    public Map<String, String> deleteDocument(
            @PathVariable Integer documentId
    ) {
        int rowsDeleted = jdbcTemplate.update(
                "DELETE FROM documents WHERE document_id = ?",
                documentId
        );

        if (rowsDeleted == 0) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Document not found"
            );
        }

        return Map.of("message", "Document deleted successfully");
    }

    public record DocumentRequest(
            Integer projectId,
            String documentName,
            String documentType,
            String filePath,
            Integer uploadedBy
    ) {}
}