#!/bin/bash

# Z.XTREAM - Termux Setup Script
# Run this script to set up the project in Termux

echo "=========================================="
echo "  Z.XTREAM - Termux Setup"
echo "=========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if running in Termux
if [ -d "/data/data/com.termux" ]; then
  echo -e "${GREEN}[✓] Running in Termux${NC}"
else
  echo -e "${YELLOW}[!] Not running in Termux. Proceeding anyway...${NC}"
fi

# Update packages
echo -e "\n${YELLOW}[1/8] Updating packages...${NC}"
pkg update -y && pkg upgrade -y

# Install required packages
echo -e "\n${YELLOW}[2/8] Installing required packages...${NC}"
pkg install -y nodejs-lts git python make clang

# Check Node.js version
echo -e "\n${YELLOW}[3/8] Checking Node.js...${NC}"
node --version
npm --version

# Install npm dependencies
echo -e "\n${YELLOW}[4/8] Installing dependencies...${NC}"
npm install

# Copy environment file
echo -e "\n${YELLOW}[5/8] Setting up environment...${NC}"
if [ ! -f .env ]; then
  cp .env.example .env
  echo -e "${GREEN}[✓] Created .env from .env.example${NC}"
  echo -e "${YELLOW}[!] Please edit .env with your Firebase credentials${NC}"
else
  echo -e "${GREEN}[✓] .env file already exists${NC}"
fi

# Create required directories
echo -e "\n${YELLOW}[6/8] Creating directories...${NC}"
mkdir -p public/icons
mkdir -p public/images

echo -e "\n${GREEN}=========================================="
echo "  Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Edit .env file with your Firebase credentials"
echo "2. Run: npm run dev"
echo ""
echo "Commands:"
echo "  npm run dev    - Start development server"
echo "  npm run build  - Build for production"
echo "  npm start      - Start production server"
echo ""
echo "The app will be available at:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001"
echo "=========================================="
