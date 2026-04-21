# ⚡ Quick Start (2 Minutes)

## Start in 60 seconds

### Step 1: Configure API Key
```bash
# .env is already configured
# Edit .env and set OPENAI_API_KEY and DB settings
```

### Step 2: Run with Docker
```bash
make docker-up
```

OR Local:
```bash
cd node-whatsapp
npm install
npm start
```

### Step 3: Test
```bash
curl http://localhost:9092/health
```

**Done! The service should respond with JSON.**

**Note:** On first run, the database will be automatically seeded with dummy personas, users, assignments, and global AI config.

---

## 5-Minute Setup

### 1. Create Persona
```bash
curl -X POST http://localhost:9092/send \
  -H "Content-Type: application/json" \
  -d '{"remoteJid":"628123456789@s.whatsapp.net","text":"Halo"}'
```

### 2. Send a Test Message
Use WhatsApp to message the connected phone number and confirm the bot receives it.

---

## Documentation

| Document | Purpose |
| --- | --- |
| [SETUP.md](./SETUP.md) | Complete setup guide |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | Development guide |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Contributing & workflow |
| [README.md](./README.md) | Project overview |
