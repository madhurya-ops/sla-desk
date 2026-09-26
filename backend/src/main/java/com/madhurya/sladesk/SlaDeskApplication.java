package com.madhurya.sladesk;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class SlaDeskApplication {
    public static void main(String[] args) {
        SpringApplication.run(SlaDeskApplication.class, args);
    }
}
