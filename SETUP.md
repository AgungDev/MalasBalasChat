# 🚀 Project Setup Guide

## Quick Start (Docker - Recommended)

### Prerequisites
- Docker & Docker Compose
- Node.js 20+
- OpenAI API Key

### Steps

#### 1. Clone/Setup Project
```bash
cd MalasBalasChat
```

#### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your values
```

#### 3. Start Services
```bash
make docker-up
```

Or manually:
```bash
docker-compose up --build
```

#### 4. Verify
```bash
curl http://localhost:9092/health
```

**App is now running on: `http://localhost:9092`**

---

## Local Development Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 15 or Docker
- OpenAI API Key

### Steps

#### 1. Install Dependencies
```bash
cd node-whatsapp
npm install
```

#### 2. Configure Environment
```bash
cp .env.example .env
# Update OpenAI and DB values
```

#### 3. Run Application
```bash
npm start
```

**App is now running on: `http://localhost:9092`**

---

## First Test
```bash
curl http://localhost:3001/health
```
