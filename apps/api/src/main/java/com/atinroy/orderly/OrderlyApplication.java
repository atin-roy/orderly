package com.atinroy.orderly;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import java.time.Clock;
import java.time.ZoneId;
import java.util.TimeZone;

@SpringBootApplication
@EnableJpaAuditing
public class OrderlyApplication {

	private static final ZoneId IST = ZoneId.of("Asia/Kolkata");

	@Bean
	public Clock clock() {
		return Clock.system(IST);
	}

	public static void main(String[] args) {
		TimeZone.setDefault(TimeZone.getTimeZone(IST));
		SpringApplication.run(OrderlyApplication.class, args);
	}

}
