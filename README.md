# 🤖 WhatsApp Auto Reply Bot

Bot WhatsApp berbasis Golang yang mampu membalas pesan secara otomatis menggunakan AI, dengan gaya percakapan yang dapat dikonfigurasi **per individu** melalui database PostgreSQL.

Project ini dirancang menggunakan **Clean Architecture**, sehingga scalable, modular, dan mudah dikembangkan.

---

# 🚀 Features

* Auto-reply WhatsApp (via WhatsApp Web)
* AI-generated response (custom prompt)
* Persona / gaya chat berbeda per user:

  * Pacar → manja 😏
  * Teman → santai 😄
  * Kerjaan → formal 🧠
* Config berbasis database (PostgreSQL)
* Support multiple persona
* Clean architecture (layered)
* Dockerized environment
* Environment-based configuration

---

# ⚠️ Disclaimer

Project ini menggunakan pendekatan **non-official WhatsApp integration**.

Risiko:

* Akun bisa dibatasi / banned
* Tidak cocok untuk high-scale production

Gunakan dengan bijak.

---

# 🧠 Architecture Overview

Struktur mengikuti Clean Architecture:

```
├── cmd/                 # entry point
├── internal/
│   ├── entity/          # entity & interface
│   ├── usecase/         # business logic
│   ├── repository/      # database implementation
│   ├── controller/        # handler (Gin / WA event)
│   └── infrastructure/  # external services (DB, AI, WA)
├── configs/             # config loader
├── pkg/                 # shared utilities
├── docker/
└── .env
```

---

# 🔄 Flow System

```
Incoming WhatsApp Message
        ↓
Extract Sender Number
        ↓
Fetch Persona from Database
        ↓
Generate Prompt
        ↓
Send to AI
        ↓
Return Response
        ↓
Send Back to WhatsApp
```

---

# 🗄️ Database Design

## users

Menyimpan data kontak

| field | type   |
| ----- | ------ |
| id    | int    |
| phone | string |
| name  | text   |
| role  | text   |

---

## personas

Menyimpan gaya komunikasi

| field         | type |
| ------------- | ---- |
| id            | int  |
| name          | text |
| system_prompt | text |

Contoh:

* "balas santai, sedikit manja, kadang hehe"
* "formal, jelas, profesional"

---

## user_personas

Relasi user ke persona

| field      | type |
| ---------- | ---- |
| id         | int  |
| user_id    | int  |
| persona_id | int  |

---

# ⚙️ Tech Stack

* Golang
* Gin (HTTP server / API)
* PostgreSQL
* Docker
* WhatsApp Web client (unofficial)
* OpenAI API (AI response)

---

# 🐳 Docker Setup

## docker-compose.yml

```yaml
version: '3.9'

services:
  app-malaschat:
    build: .
    container_name: wa-bot
    ports:
      - "9092:8080"
    env_file:
      - .env
    depends_on:
      - db-malaschat

  db-malaschat:
    image: postgres:15
    container_name: postgres
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: wa_bot
    ports:
      - "5444:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:

networks:
  malaschat-network:
    driver: bridge
```

---

# 🔐 Environment Variables (.env)

```
APP_PORT=8080

DB_HOST=db-malaschat
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=malaschat_bot

OPENAI_API_KEY=your_api_key

WHATSAPP_SESSION=./session
```

---

# ▶️ Running Project

```bash
docker-compose up --build
```

---

# 📡 API Endpoint (Gin)

## Create User

```
POST /users
```

## Assign Persona

```
POST /users/:id/persona
```

## Create Persona

```
POST /personas
```

---

# 🧩 Core Usecases

* Get Persona by Phone
* Generate AI Response
* Send WhatsApp Message
* Fallback to Default Persona

---

# 🧠 AI Prompt Strategy

System prompt diambil dari database.

Contoh:

```
Lu adalah pacar yang perhatian, santai, dan sedikit manja.
Gunakan bahasa Indonesia informal.
Kadang pakai "hehe" atau "ih".
```

User message:

```
"Lagi apa?"
```

---

# 🔄 Future Improvements

* Multi-persona per user (context aware)
* Time-based persona (pagi formal, malam santai)
* Dashboard UI (admin panel)
* Message queue (RabbitMQ / Kafka)
* Rate limiting & anti-ban strategy
* Typing simulation (delay + human-like behavior)

---

# 🧪 Development Strategy

Gunakan Copilot untuk:

* generate repository layer
* generate usecase
* generate handler gin
* generate struct & interface

Fokus manual:

* arsitektur
* flow logic
* prompt design

---

# 💀 Real Talk

Bot ini bisa:

* bantu komunikasi
* bikin hidup lebih efisien

Tapi juga bisa:

* bikin hubungan jadi “fake”

Gunakan sebagai **assistant**, bukan pengganti diri.

