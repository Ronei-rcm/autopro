.PHONY: help up down build logs clean seed migrate test setup-local dev-local init-db-local

help: ## Mostra esta mensagem de ajuda
	@echo "Comandos disponíveis:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

up: ## Inicia todos os containers
	docker-compose up -d

down: ## Para todos os containers
	docker-compose down

build: ## Constrói as imagens
	docker-compose build

logs: ## Mostra logs de todos os serviços
	docker-compose logs -f

logs-backend: ## Mostra logs do backend
	docker-compose logs -f backend

logs-frontend: ## Mostra logs do frontend
	docker-compose logs -f frontend

logs-db: ## Mostra logs do banco de dados
	docker-compose logs -f postgres

clean: ## Para containers e remove volumes
	docker-compose down -v

rebuild: ## Rebuild completo
	docker-compose down -v
	docker-compose build --no-cache
	docker-compose up -d

seed: ## Executa seed no banco
	docker exec -it mec-poa-backend npm run seed

migrate: ## Executa migrations
	docker exec -i mec-poa-db psql -U postgres -d mec_poa < backend/migrations/001_initial_schema.sql

shell-backend: ## Abre shell no container do backend
	docker exec -it mec-poa-backend sh

shell-db: ## Abre psql no banco de dados
	docker exec -it mec-poa-db psql -U postgres -d mec_poa

backup: ## Cria backup do banco
	docker exec mec-poa-db pg_dump -U postgres mec_poa > backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "Backup criado: backup_$$(date +%Y%m%d_%H%M%S).sql"

restore: ## Restaura backup (use: make restore FILE=backup.sql)
	docker exec -i mec-poa-db psql -U postgres mec_poa < $(FILE)

status: ## Mostra status dos containers
	docker-compose ps

prod-up: ## Inicia em modo produção
	docker-compose -f docker-compose.prod.yml up -d

prod-down: ## Para em modo produção
	docker-compose -f docker-compose.prod.yml down

prod-logs: ## Logs em modo produção
	docker-compose -f docker-compose.prod.yml logs -f

# ============================================
# Comandos para desenvolvimento LOCAL
# ============================================

setup-local: ## Configura ambiente local (instala dependências)
	@chmod +x scripts/setup-local.sh
	@./scripts/setup-local.sh

dev-local: ## Inicia desenvolvimento local (backend + frontend)
	@npm run dev

dev-backend: ## Inicia apenas o backend localmente
	@cd backend && npm run dev

dev-frontend: ## Inicia apenas o frontend localmente
	@cd frontend && npm run dev

init-db-local: ## Inicializa banco de dados local
	@chmod +x scripts/init-db-local.sh
	@./scripts/init-db-local.sh

install-all: ## Instala todas as dependências (raiz, backend, frontend)
	@npm run install:all

