# 🤖 WhatsApp Auto Reply Bot (Node.js)

Bot WhatsApp berbasis Node.js yang menggunakan **Baileys** untuk WhatsApp Web dan **OpenAI** untuk membalas pesan otomatis. Sistem tetap menggunakan database PostgreSQL untuk menyimpan persona dan mapping nomor.

Project ini dibangun dengan gaya modular dan clean architecture supaya mudah diadaptasi, dikembangkan, dan diintegrasikan dengan backend lain.

---

# 🚀 Features

* WhatsApp Web integration via `@whiskeysockets/baileys`
* Multi-file auth state session storage
* Auto-reply dengan AI
* Persona / gaya chat per kontak
* Database-driven persona mapping
* Role / whitelist-based reply gating
* Random reply delay untuk kesan natural
* Optional skip reply behavior
* Dockerized Node.js service

---

# ⚠️ Disclaimer

Pendekatan ini menggunakan WhatsApp Web yang tidak resmi.

Risiko:

* Akun bisa dibatasi / banned
* Tidak cocok untuk high-scale production

Gunakan dengan bijak.

---

# 🧠 Architecture Overview

Struktur project Node.js:

```
node-whatsapp/
├── src/
│   ├── config.js
│   ├── index.js
│   ├── server.js
│   ├── repository/
│   │   └── postgresRepository.js
│   ├── services/
│   │   ├── aiService.js
│   │   └── whatsappClient.js
│   ├── usecases/
│   │   └── replyUsecase.js
│   └── utils/
│       └── random.js
├── package.json
├── .env.example
└── README.md
```

---

# 🔄 Bot Flow

```
Incoming WhatsApp message
          ↓
Extract remoteJid and message text
          ↓
Normalize sender phone number
          ↓
Fetch persona from PostgreSQL
          ↓
Check whitelist / allowed role
          ↓
Optionally skip reply
          ↓
Generate reply with OpenAI
          ↓
Send reply back via Baileys
```

---

# 🗄️ Database Design

## users

Menyimpan kontak WhatsApp dan role.

| field | type   |
| ----- | ------ |
| id    | int    |
| phone | string |
| name  | text   |
| role  | text   |

---

## personas

Menyimpan gaya komunikasi / prompt.

| field         | type |
| ------------- | ---- |
| id            | int  |
| name          | text |
| system_prompt | text |

---

## user_personas

Relasi user ke persona.

| field      | type |
| ---------- | ---- |
| id         | int  |
| user_id    | int  |
| persona_id | int  |

---

# ⚙️ Tech Stack

* Node.js
* Baileys (`@whiskeysockets/baileys`)
* PostgreSQL
* OpenAI API
* Docker

---

# 🐳 Docker Setup

## docker-compose.yml

```yaml
version: '3.9'

services:
  app-malaschat:
    build:
      context: .
      dockerfile: docker/Dockerfile
    container_name: wa-bot
    ports:
      - "9092:3001"
    env_file:
      - .env
    depends_on:
      - db-malaschat
    networks:
      - malaschat-network
    restart: on-failure

  db-malaschat:
    image: postgres:15
    container_name: postgres-malaschat
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: malaschat_bot
    ports:
      - "5444:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - malaschat-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  pgdata:

networks:
  malaschat-network:
    driver: bridge
```

---

# 🔐 Environment Variables (.env)

```
APP_PORT=9092

DB_HOST=db-malaschat
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=malaschat_bot

OPENAI_API_KEY=your_api_key_here

WHATSAPP_SESSION_DIR=./session
WHITELIST_NUMBERS=628123456789,628987654321
ALLOWED_ROLES=whitelist,pacar,teman
MAX_REPLY_LENGTH=360
SKIP_REPLY_RATE=0.2
REPLY_DELAY_MIN=3000
REPLY_DELAY_MAX=15000
```

---

# ▶️ Running Project

```bash
docker-compose up --build
```

Service is exposed at `http://localhost:9092`.

---

# 📡 HTTP API

The Node.js bot also exposes simple endpoints:

* `GET /health` — service health
* `GET /status` — WhatsApp socket status
* `POST /send` — manual send via WhatsApp

Example request:

```bash
curl -X POST http://localhost:9092/send \
  -H "Content-Type: application/json" \
  -d '{"remoteJid":"628123456789@s.whatsapp.net","text":"Halo"}'
```

---

# 🧠 Behavior

* Only replies to allowed roles or whitelisted numbers
* Adds random delay before reply
* Limits reply length for natural tone
* May skip replies to simulate human behavior
* Uses persona prompt from PostgreSQL

---

# 💡 Notes

* Keep `OPENAI_API_KEY` out of source control
* `WHATSAPP_SESSION_DIR` stores Baileys session files
* Use the existing PostgreSQL schema for persona mapping

---

# ✅ Integration

The Node.js service is standalone and easy to integrate with other services via shared DB or REST API.

