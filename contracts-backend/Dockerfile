FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY hardhat.config.ts tsconfig.json ./
COPY contracts ./contracts
COPY ignition ./ignition

EXPOSE 8545

CMD ["npx", "hardhat", "node", "--hostname", "0.0.0.0"]
