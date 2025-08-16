package com.sajidbaba1.researchmanagementsystem.controller;

import com.sajidbaba1.researchmanagementsystem.dto.ChatbotRequest;
import com.sajidbaba1.researchmanagementsystem.dto.ChatbotResponse;
import com.sajidbaba1.researchmanagementsystem.service.ChatbotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chatbot")
@CrossOrigin(origins = "*")
public class ChatbotController {

    @Autowired
    private ChatbotService chatbotService;

    @PostMapping("/ask")
    public ResponseEntity<ChatbotResponse> askQuestion(@RequestBody ChatbotRequest request) {
        try {
            ChatbotResponse response = new ChatbotResponse(
                chatbotService.processQuery(request.getQuestion()), 
                true
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ChatbotResponse("Sorry, I encountered an error processing your question.", false));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Chatbot service is running");
    }
}
