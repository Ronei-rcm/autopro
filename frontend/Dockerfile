# Dockerfile para Frontend (Desenvolvimento)
FROM node:18-alpine

# Criar diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências (incluindo jspdf e html2canvas)
RUN npm install && \
    npm list jspdf html2canvas @types/jspdf || npm install jspdf html2canvas @types/jspdf

# Copiar código fonte
COPY . .

# Expor porta do Vite
EXPOSE 5173

# Comando padrão (pode ser sobrescrito no docker-compose)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

