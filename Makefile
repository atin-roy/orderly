.PHONY: up down reset-db dev logs

up:
	docker compose up -d

down:
	docker compose down

reset-db:
	docker compose down -v
	docker compose up -d

dev:
	npm run dev

logs:
	docker compose logs -f
