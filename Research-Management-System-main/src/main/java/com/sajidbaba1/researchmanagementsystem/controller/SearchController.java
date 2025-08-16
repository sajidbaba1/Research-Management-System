package com.sajidbaba1.researchmanagementsystem.controller;

import com.sajidbaba1.researchmanagementsystem.dto.SearchRequest;
import com.sajidbaba1.researchmanagementsystem.dto.SearchResponse;
import com.sajidbaba1.researchmanagementsystem.service.SearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
@CrossOrigin(origins = "*")
public class SearchController {

    @Autowired
    private SearchService searchService;

    @GetMapping
    public ResponseEntity<SearchResponse> search(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String status) {
        
        SearchRequest request = new SearchRequest();
        request.setQuery(query);
        request.setPage(page);
        request.setSize(size);
        request.setType(type);
        request.setDepartment(department);
        request.setStatus(status);
        
        SearchResponse response = searchService.universalSearch(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/documents")
    public ResponseEntity<SearchResponse> searchDocuments(@RequestBody SearchRequest request) {
        SearchResponse response = searchService.searchDocuments(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/team-members")
    public ResponseEntity<SearchResponse> searchTeamMembers(@RequestBody SearchRequest request) {
        SearchResponse response = searchService.searchTeamMembers(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/universal")
    public ResponseEntity<SearchResponse> universalSearch(@RequestBody SearchRequest request) {
        SearchResponse response = searchService.universalSearch(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/suggestions")
    public ResponseEntity<List<String>> getSearchSuggestions(@RequestParam String query) {
        List<String> suggestions = searchService.getSearchSuggestions(query);
        return ResponseEntity.ok(suggestions);
    }
}
