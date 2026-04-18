# 📝 Quick Test Examples

Run these commands after starting the server to test the API.

## Prerequisites
- Server running on `http://localhost:9092` (Docker) or `http://localhost:8080` (local)
- `curl` command available

## 1. Health Check
```bash
curl http://localhost:9092/health

# Response:
# {"status":"healthy"}
```

---

## 2. Create Personas

### Create "Pacar" Persona
```bash
curl -X POST http://localhost:9092/personas \
  -H "Content-Type: application/json" \
  -d '{
    "name": "pacar",
    "system_prompt": "Peran: Pacar yang perhatian, baik, sopan, pintar, dan lucu Tujuan: Membalas chat dengan hangat, bikin nyaman, dan kadang sedikit menggoda Gaya: Soft, santai, tidak lebay, tapi tetap romantis dan natural, sesekali gunakan emoth ekspresi kasih sayang."
  }'

# Response:
# {"id":1,"message":"Persona created successfully"}
```

```shell
Invoke-RestMethod -Method POST http://localhost:9092/personas `
  -ContentType "application/json" `
  -Body '{
    "name": "pacar",
    "system_prompt": "Peran: Pacar yang perhatian, baik, sopan, pintar, dan lucu. Tujuan: Membalas chat dengan hangat, bikin nyaman, dan kadang sedikit menggoda. Gaya: Soft, santai, tidak lebay, tapi tetap romantis dan natural, sesekali gunakan emot ekspresi kasih sayang."
  }'
```

### Create "Teman" Persona
```bash
curl -X POST http://localhost:9092/personas \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teman",
    "system_prompt": "Jawab seperlunya, kalau di tanya kegiatan"
  }'

# Response:
# {"id":2,"message":"Persona created successfully"}
```

### Create "Kerjaan" Persona
```bash
curl -X POST http://localhost:9092/personas \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Kerjaan",
    "system_prompt": "You are a professional coworker. Be formal, clear, and helpful. Use Indonesian. Keep responses concise."
  }'

# Response:
# {"id":3,"message":"Persona created successfully"}
```

---

## 3. Get All Personas
```bash
curl http://localhost:9092/personas

# Response:
# [
#   {
#     "id": 1,
#     "name": "Pacar",
#     "system_prompt": "...",
#     "created_at": "2024-01-01T10:00:00Z",
#     "updated_at": "2024-01-01T10:00:00Z"
#   },
#   ...
# ]
```

---

## 4. Create Users

### Create User 1
```bash
curl -X POST http://localhost:9092/users \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "6281234567890",
    "name": "Budi",
    "role": "boyfriend"
  }'

# Response:
# {"id":1,"message":"User created successfully"}
```

### Create User 2
```bash
curl -X POST http://localhost:9092/users \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "6281234567891",
    "name": "Ade",
    "role": "friend"
  }'

# Response:
# {"id":2,"message":"User created successfully"}
```

### Create User 3
```bash
curl -X POST http://localhost:9092/users \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "6281234567892",
    "name": "Pak Bos",
    "role": "boss"
  }'

# Response:
# {"id":3,"message":"User created successfully"}
```

---

## 5. Get All Users
```bash
curl http://localhost:9092/users

# Response:
# [
#   {
#     "id": 1,
#     "phone": "6281234567890",
#     "name": "Budi",
#     "role": "boyfriend",
#     "created_at": "...",
#     "updated_at": "..."
#   },
#   ...
# ]
```

---

## 6. Get User by Phone
```bash
curl http://localhost:9092/users/6281234567890

# Response:
# {
#   "id": 1,
#   "phone": "6281234567890",
#   "name": "Budi",
#   "role": "boyfriend",
#   ...
# }
```

---

## 7. Assign Personas to Users

### Assign "Pacar" to Budi
```bash
curl -X POST http://localhost:9092/users/1/persona \
  -H "Content-Type: application/json" \
  -d '{"persona_id": 1}'

# Response:
# {"message":"Persona assigned successfully"}
```

### Assign "Teman" to Ade
```bash
curl -X POST http://localhost:9092/users/2/persona \
  -H "Content-Type: application/json" \
  -d '{"persona_id": 2}'
```

### Assign "Kerjaan" to Pak Bos
```bash
curl -X POST http://localhost:9092/users/3/persona \
  -H "Content-Type: application/json" \
  -d '{"persona_id": 3}'
```

---

## 8. Get Persona by User Phone
```bash
curl http://localhost:9092/users/6281234567890/persona

# Response:
# {
#   "id": 1,
#   "name": "Pacar",
#   "system_prompt": "...",
#   "created_at": "...",
#   "updated_at": "..."
# }
```

---

## 9. Handle Messages (Main Feature!)

### Message from Budi (with Pacar persona)
```bash
curl -X POST http://localhost:9092/messages/handle \
  -H "Content-Type: application/json" \
  -d '{
    "from": "6281234567890",
    "content": "Lagi apa?"
  }'

# Response:
# {
#   "status": "success",
#   "response": "Lagi santai aja, kenapa? Kamu lagi apa? 😏"
# }
```

### Message from Ade (with Teman persona)
```bash
curl -X POST http://localhost:9092/messages/handle \
  -H "Content-Type: application/json" \
  -d '{
    "from": "6281234567891",
    "content": "Besok meet up?"
  }'

# Response:
# {
#   "status": "success",
#   "response": "Yooo let's gooo! Kapan? Dimana?"
# }
```

### Message from Pak Bos (with Kerjaan persona)
```bash
curl -X POST http://localhost:9092/messages/handle \
  -H "Content-Type: application/json" \
  -d '{
    "from": "6281234567892",
    "content": "Laporan deadline?"
  }'

# Response:
# {
#   "status": "success",
#   "response": "Laporan akan selesai sesuai deadline yang telah ditentukan. Estimasi: besok pukul 15.00."
# }
```

---

## 10. Update Persona

```bash
curl -X PUT http://localhost:9092/personas/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pacar Updated",
    "system_prompt": "You are a caring girlfriend... (updated)"
  }'

# Response:
# {"message":"Persona updated successfully"}
```

---

## 11. Delete Persona

```bash
curl -X DELETE http://localhost:9092/personas/1

# Response:
# {"message":"Persona deleted successfully"}
```

---

## Batch Testing Script

Save as `test_api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:9092"

echo "🧪 Testing WhatsApp Bot API\n"

# Health Check
echo "1️⃣  Health Check"
curl -s $BASE_URL/health | jq . && echo -e "\n"

# Create Personas
echo "2️⃣  Creating Personas"
P1=$(curl -s -X POST $BASE_URL/personas \
  -H "Content-Type: application/json" \
  -d '{"name":"Pacar","system_prompt":"You are a caring girlfriend."}' | jq .id)
echo "✓ Pacar created: ID $P1\n"

# Create User
echo "3️⃣  Creating User"
USER=$(curl -s -X POST $BASE_URL/users \
  -H "Content-Type: application/json" \
  -d '{"phone":"6281234567890","name":"John","role":"boyfriend"}' | jq .id)
echo "✓ User created: ID $USER\n"

# Assign Persona
echo "4️⃣  Assigning Persona"
curl -s -X POST $BASE_URL/users/$USER/persona \
  -H "Content-Type: application/json" \
  -d "{\"persona_id\": $P1}" | jq . && echo "\n"

# Handle Message
echo "5️⃣  Handling Message"
curl -s -X POST $BASE_URL/messages/handle \
  -H "Content-Type: application/json" \
  -d '{"from":"6281234567890","content":"Lagi apa?"}' | jq .

echo -e "\n✅ Testing Complete!"
```

Run with:
```bash
chmod +x test_api.sh
./test_api.sh
```

---

## Notes

- All IDs and phone numbers in responses can be used for subsequent calls
- Keep OpenAI API key updated in .env
- Responses from messages depend on OpenAI API availability
- Use formatted JSON output: add `| jq .` to any curl command for pretty printing

---

## Troubleshooting

### Command not found: curl
```bash
# Install curl
brew install curl       # macOS
sudo apt install curl   # Ubuntu/Debian
```

### Response errors
- Check server is running: `curl http://localhost:9092/health`
- Verify .env configuration
- Check OpenAI API key is valid
- Review server logs

### Pretty print JSON
```bash
# Install jq (optional)
brew install jq         # macOS
sudo apt install jq     # Ubuntu/Debian

# Use in commands
curl ... | jq .
```
