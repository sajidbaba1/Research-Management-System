package com.sajidbaba1.researchmanagementsystem.dto;

public class ChatbotRequest {
    private String question;
    private boolean voiceInput;

    public ChatbotRequest() {}

    public ChatbotRequest(String question, boolean voiceInput) {
        this.question = question;
        this.voiceInput = voiceInput;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public boolean isVoiceInput() {
        return voiceInput;
    }

    public void setVoiceInput(boolean voiceInput) {
        this.voiceInput = voiceInput;
    }
}
