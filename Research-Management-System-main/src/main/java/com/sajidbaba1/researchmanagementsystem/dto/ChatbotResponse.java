package com.sajidbaba1.researchmanagementsystem.dto;

public class ChatbotResponse {
    private String answer;
    private boolean success;
    private boolean voiceOutput;
    private String voiceText;

    public ChatbotResponse() {}

    public ChatbotResponse(String answer, boolean success) {
        this.answer = answer;
        this.success = success;
        this.voiceOutput = true;
        this.voiceText = answer;
    }

    public ChatbotResponse(String answer, boolean success, boolean voiceOutput) {
        this.answer = answer;
        this.success = success;
        this.voiceOutput = voiceOutput;
        this.voiceText = answer;
    }

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
        this.voiceText = answer;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public boolean isVoiceOutput() {
        return voiceOutput;
    }

    public void setVoiceOutput(boolean voiceOutput) {
        this.voiceOutput = voiceOutput;
    }

    public String getVoiceText() {
        return voiceText;
    }

    public void setVoiceText(String voiceText) {
        this.voiceText = voiceText;
    }
}
