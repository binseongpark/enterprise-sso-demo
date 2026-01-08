.PHONY: up down logs restart install dev clean

# Docker Compose 명령어
up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f

restart:
	docker-compose restart

# Next.js 앱 명령어
install:
	cd app && npm install

dev:
	cd app && npm run dev

build:
	cd app && npm run build

start:
	cd app && npm start

# 정리
clean:
	docker-compose down -v
	rm -rf app/node_modules app/.next

# 전체 환경 설정
setup: up install

# 도움말
help:
	@echo "사용 가능한 명령어:"
	@echo "  make up       - Docker Compose 서비스 시작"
	@echo "  make down     - Docker Compose 서비스 중지"
	@echo "  make logs     - Docker 로그 확인"
	@echo "  make restart  - Docker 서비스 재시작"
	@echo "  make install  - Next.js 앱 의존성 설치"
	@echo "  make dev      - Next.js 앱 개발 서버 시작"
	@echo "  make build    - Next.js 앱 빌드"
	@echo "  make start    - Next.js 앱 프로덕션 서버 시작"
	@echo "  make clean    - 모든 데이터 및 빌드 파일 삭제"
	@echo "  make setup    - 전체 환경 설정 (docker + npm install)"
