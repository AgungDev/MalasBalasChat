# WhatsApp Auto Reply Bot - Project Structure

```
MalasBalasChat/
├── docker/
│   └── Dockerfile
├── node-whatsapp/
│   ├── package.json
│   ├── .env.example
│   ├── src/
│   │   ├── config.js
│   │   ├── index.js
│   │   ├── repository/
│   │   │   └── postgresRepository.js
│   │   ├── services/
│   │   │   ├── aiService.js
│   │   │   └── whatsappClient.js
│   │   ├── usecases/
│   │   │   └── replyUsecase.js
│   │   ├── server.js
│   │   └── utils/
│   │       └── random.js
├── docker-compose.yml
├── Makefile
├── README.md
├── QUICKSTART.md
├── SETUP.md
├── DEVELOPMENT.md
├── CONTRIBUTING.md
├── .env.example
└── .github/
```

## Architecture Layers

### 1. HTTP API Layer
- `node-whatsapp/src/server.js`
- Exposes `/health`, `/status`, `/send`

### 2. Business Logic Layer
- `node-whatsapp/src/usecases/replyUsecase.js`
- Handles persona checks, delay, reply generation

### 3. Data Access Layer
- `node-whatsapp/src/repository/postgresRepository.js`
- Reads persona and user mapping from PostgreSQL

### 4. Infrastructure Layer
- `node-whatsapp/src/services/aiService.js`
- `node-whatsapp/src/services/whatsappClient.js`

### 5. Utility Layer
- `node-whatsapp/src/utils/random.js`
- Helper functions for delay, phone normalization, truncation
