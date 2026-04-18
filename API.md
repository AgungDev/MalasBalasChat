# API Documentation

## Base URL
```
http://localhost:9092
```

## Health Check
```
GET /health
```

## Response Format
```json
{
  "status": "success|error",
  "message": "string",
  "data": {},
  "error": "string"
}
```

---

## Personas API

### Create Persona
```
POST /personas
```

**Request Body:**
```json
{
  "name": "Pacar",
  "system_prompt": "You are a caring girlfriend, playful, slightly clingy. Use Indonesian informal language. Sometimes use 'hehe' or 'ih'."
}
```

**Response:**
```json
{
  "message": "Persona created successfully",
  "id": 1
}
```

---

### Get All Personas
```
GET /personas
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Pacar",
    "system_prompt": "You are a caring girlfriend...",
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T10:00:00Z"
  }
]
```

---

### Get Persona by ID
```
GET /personas/:id
```

**Response:**
```json
{
  "id": 1,
  "name": "Pacar",
  "system_prompt": "...",
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T10:00:00Z"
}
```

---

### Update Persona
```
PUT /personas/:id
```

**Request Body:**
```json
{
  "name": "Pacar Updated",
  "system_prompt": "Updated prompt..."
}
```

---

### Delete Persona
```
DELETE /personas/:id
```

---

## Users API

### Create User
```
POST /users
```

**Request Body:**
```json
{
  "phone": "6281234567890",
  "name": "John Doe",
  "role": "boyfriend"
}
```

---

### Get All Users
```
GET /users
```

---

### Get User by Phone
```
GET /users/:phone
```

---

## User-Persona Assignment

### Assign Persona to User
```
POST /users/:user_id/persona
```

**Request Body:**
```json
{
  "persona_id": 1
}
```

---

### Get Persona by Phone
```
GET /users/:phone/persona
```

**Response:**
```json
{
  "id": 1,
  "name": "Pacar",
  "system_prompt": "..."
}
```

---

## Messages API

### Handle Incoming Message
```
POST /messages/handle
```

**Request Body:**
```json
{
  "from": "6281234567890",
  "content": "Lagi apa?"
}
```

**Response:**
```json
{
  "status": "success",
  "response": "Lagi santai aja, kenapa? 😏"
}
```

---

## Example Usage

### 1. Create Personas
```bash
curl -X POST http://localhost:9092/personas \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pacar",
    "system_prompt": "You are a caring girlfriend, playful. Use Indonesian language."
  }'

curl -X POST http://localhost:9092/personas \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teman",
    "system_prompt": "You are a casual friend. Keep responses short and friendly."
  }'
```

### 2. Create User
```bash
curl -X POST http://localhost:9092/users \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "6281234567890",
    "name": "Budi",
    "role": "boyfriend"
  }'
```

### 3. Assign Persona
```bash
curl -X POST http://localhost:9092/users/1/persona \
  -H "Content-Type: application/json" \
  -d '{"persona_id": 1}'
```

### 4. Handle Message
```bash
curl -X POST http://localhost:9092/messages/handle \
  -H "Content-Type: application/json" \
  -d '{
    "from": "6281234567890",
    "content": "Lagi apa?"
  }'
```
