# Dockerfile para Backend
FROM node:18-alpine

# Instalar dependências do sistema
RUN apk add --no-cache postgresql-client

# Criar diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY . .

# Expor porta
EXPOSE 3001

# Comando padrão (pode ser sobrescrito no docker-compose)
CMD ["npm", "run", "dev"]

