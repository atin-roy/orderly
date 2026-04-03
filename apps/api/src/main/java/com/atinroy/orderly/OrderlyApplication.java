package com.atinroy.orderly;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import java.time.Clock;

@SpringBootApplication
@EnableJpaAuditing
public class OrderlyApplication {

	@Bean
	public Clock clock() {
		return Clock.systemDefaultZone();
	}

	public static void main(String[] args) {
		SpringApplication.run(OrderlyApplication.class, args);
	}

}
