.PHONY: help install-deps run docker-build docker-up docker-down clean

help:
	@echo "Available commands:"
	@echo "  make install-deps  - Install Node.js dependencies"
	@echo "  make run           - Run the Node.js application"
	@echo "  make docker-build  - Build Docker image"
	@echo "  make docker-up     - Start Docker containers"
	@echo "  make docker-down   - Stop Docker containers"
	@echo "  make clean         - Clean build artifacts"

install-deps:
	@echo "Installing dependencies..."
	npm install

run: install-deps
	@echo "Running application..."
	npm start

docker-build:
	@echo "Building Docker image..."
	docker-compose build

docker-up: docker-build
	@echo "Starting Docker containers..."
	docker-compose up -d
	@echo "Application is running on http://localhost:9092"
	@echo "PostgreSQL is running on localhost:5444"

docker-down:
	@echo "Stopping Docker containers..."
	docker-compose down

clean:
	@echo "Cleaning build artifacts..."
	rm -rf node_modules
	rm -f npm-debug.log

.DEFAULT_GOAL := help
