# WhatsApp Bot Service (Node.js + Baileys)

This folder contains a Node.js WhatsApp bot service that replaces the Go `whatsmeow` layer with `@whiskeysockets/baileys`.

## Architecture

- `src/config.js` — environment configuration loader
- `src/repository/postgresRepository.js` — PostgreSQL user/persona repository
- `src/services/aiService.js` — OpenAI chat completion client
- `src/usecases/replyUsecase.js` — business logic for generating replies
- `src/services/whatsappClient.js` — Baileys client with multi-file auth state and message listener
- `src/server.js` — optional HTTP health/send endpoint
- `src/index.js` — entrypoint wiring all layers together

## Features

- Multi-file auth state for Baileys session
- `messages.upsert` event handling
- Message body extraction from `conversation`, `extendedTextMessage`, and captions
- Phone extraction from `remoteJid`
- Persona mapping using existing PostgreSQL schema
- Whitelist/role-based reply gating
- Random 3–15 second reply delay
- Optional natural skip behavior
- Reply length limiting
- Reconnect handling on WhatsApp disconnect

## Getting Started

1. Copy `.env.example` to `.env` and fill your credentials.
2. Install dependencies:

```bash
cd node-whatsapp
npm install
```

3. Start the bot:

```bash
npm start
```

## Integration Notes

- Shares the existing PostgreSQL schema for `users`, `personas`, and `user_personas`
- Can be integrated with other services via the same database or by calling the HTTP `/send` endpoint
- Use `APP_PORT` to separate the Node service from other services

## HTTP Endpoints

- `GET /health` — simple health check
- `GET /status` — socket connection status
- `POST /send` — send a message manually via WhatsApp
