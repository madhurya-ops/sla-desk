package com.madhurya.sladesk.triage.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.Map;

@JsonIgnoreProperties(ignoreUnknown = true)
public record JevAnswer(String type, String choice, Double noul, Double score,
                        Double confidence, Map<String, Double> probabilities) {}