# 🤝 Contributing Guide

## Development Workflow

### 1. Setup Development Environment
```bash
git clone https://github.com/yourusername/MalasBalasChat.git
cd MalasBalasChat
make install-deps
```

### 2. Create Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 3. Develop
```bash
cd node-whatsapp
npm start
```

### 4. Testing
```bash
./test.sh
```

### 5. Code Quality
```bash
npm install
# Add linting if needed
```

### 6. Commit
```bash
git add .
git commit -m "feat: add new feature"
git push origin feature/your-feature-name
```

## Project Structure

### Node.js Service
- `node-whatsapp/src/index.js` — entrypoint
- `node-whatsapp/src/config.js` — config loader
- `node-whatsapp/src/repository` — PostgreSQL repository
- `node-whatsapp/src/services` — AI and WhatsApp services
- `node-whatsapp/src/usecases` — business logic
- `node-whatsapp/src/server.js` — health/send API

## Pull Request
1. Push your branch
2. Create PR on GitHub
3. Describe changes clearly
4. Address feedback and merge
