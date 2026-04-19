# Development Guide

## Prerequisites
- Node.js 20+
- PostgreSQL 15 (or Docker)
- Docker & Docker Compose (optional)
- OpenAI API Key

## Local Development Setup

### 1. Environment Setup
```bash
# .env already exists in this repo
# Edit .env with your values
```

### 2. Install Dependencies
```bash
cd node-whatsapp
npm install
```

### 3. Database Setup

Use PostgreSQL locally or Docker Compose to run the database.

### 4. Run Application
```bash
npm start
```

The app starts on `http://localhost:9092`

### 5. Health Check
```bash
curl http://localhost:9092/health
```

## Docker Setup

### Build and Run
```bash
make docker-up
```

### Stop
```bash
make docker-down
```
