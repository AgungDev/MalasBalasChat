#!/bin/bash

# Run basic Node.js validation for the WhatsApp bot service

set -e

echo "Installing dependencies..."
npm install

echo "Checking JavaScript syntax..."
node --check src/index.js src/config.js src/repository/postgresRepository.js src/services/aiService.js src/services/whatsappClient.js src/usecases/replyUsecase.js src/server.js

echo "✅ Syntax check passed!"
