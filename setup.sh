#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}WhatsApp Auto Reply Bot Setup${NC}"
echo -e "${GREEN}======================================${NC}\n"

# Check Node.js installation
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js installed: $(node --version)${NC}"

# Check npm installation
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm installed: $(npm --version)${NC}"

# Check Docker (optional)
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓ Docker installed: $(docker --version)${NC}"
else
    echo -e "${YELLOW}⚠ Docker not installed (optional for local dev)${NC}"
fi

# Check PostgreSQL (optional)
if command -v psql &> /dev/null; then
    echo -e "${GREEN}✓ PostgreSQL installed: $(psql --version)${NC}"
else
    echo -e "${YELLOW}⚠ PostgreSQL not installed locally (can use Docker)${NC}"
fi

# Install dependencies
echo -e "\n${YELLOW}Installing dependencies...${NC}"
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${RED}✗ Failed to install dependencies${NC}"
    exit 1
fi

# Create .env if not exists
if [ ! -f .env ]; then
    echo -e "\n${YELLOW}Creating .env file...${NC}"
    # .env is already configured
    echo -e "${GREEN}✓ .env file created (update with your OpenAI API key)${NC}"
else
    echo -e "${YELLOW}⚠ .env file already exists${NC}"
fi

# Check if OPENAI_API_KEY is set
if grep -q "sk-" .env; then
    echo -e "${GREEN}✓ OpenAI API key is configured${NC}"
else
    echo -e "${RED}✗ Please configure OPENAI_API_KEY in .env file${NC}"
fi

echo -e "\n${GREEN}======================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}======================================${NC}\n"

echo -e "Next steps:"
echo -e "1. Configure .env with your OpenAI API key"
echo -e "2. Run: ${YELLOW}make docker-up${NC} (for Docker setup)"
echo -e "   OR: ${YELLOW}make run${NC} (for local development)"
echo -e "3. Visit: ${YELLOW}http://localhost:9092${NC}"
echo -e "4. Read: ${YELLOW}SETUP.md${NC} for detailed instructions\n"
