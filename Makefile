.PHONY: up down reset-db api-dev web-dev dev dev-full logs

up:
	docker compose up -d

down:
	docker compose down

reset-db:
	docker compose down -v
	docker compose up -d

api-dev:
	cd apps/api && ./mvnw spring-boot:run

web-dev:
	npm run dev

dev:
	npm run dev

dev-full:
	docker compose up -d
	( cd apps/api && ./mvnw spring-boot:run ) & npm run dev

logs:
	docker compose logs -f
