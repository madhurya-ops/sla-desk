package com.madhurya.sladesk.triage;

import com.madhurya.sladesk.triage.dto.JevResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.time.Duration;
import java.util.Map;
import java.util.Optional;

@Component
@Slf4j
public class JevClient {
    private final RestClient restClient;
    private final String model;
    private final boolean enabled;

    public JevClient(@Value("${app.typesafe.api-key}") String apiKey,
                     @Value("${app.typesafe.base-url}") String baseUrl,
                     @Value("${app.typesafe.model}") String model) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(3));
        factory.setReadTimeout(Duration.ofSeconds(8));
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(factory)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .build();
        this.model = model;
        this.enabled = apiKey != null && !apiKey.isBlank();
    }

    /** Empty on any failure, so callers fall back instead of crashing. */
    public Optional<JevResponse> evaluate(Object state, Map<String, Object> questions) {
        if (!enabled) return Optional.empty();
        try {
            JevResponse res = restClient.post()
                    .uri("/v1/systemone")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("model", model, "state", state, "questions", questions))
                    .retrieve()
                    .body(JevResponse.class);
            return Optional.ofNullable(res);
        } catch (RestClientException e) {
            log.warn("Jev call failed: {}", e.getMessage());
            return Optional.empty();
        }
    }
}