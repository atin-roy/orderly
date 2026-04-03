.PHONY: up down build rebuild reset-db logs ps debug-up debug-down vps-config

up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build

rebuild:
	docker compose up -d --build

reset-db:
	docker compose down -v
	docker compose up -d

logs:
	docker compose logs -f

ps:
	docker compose ps

debug-up:
	docker compose --profile debug up -d

debug-down:
	docker compose --profile debug down

vps-config:
	docker compose -f docker-compose.yml -f docker-compose.vps.yml config
