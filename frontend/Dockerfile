# Usa uma imagem oficial estável do Node
FROM node:18-alpine

# Define o diretório de trabalho no container
WORKDIR /app

# Copia os arquivos de dependências e instala
COPY package.json .
RUN npm install

# Copia o resto dos arquivos do frontend
COPY . .

# Expõe a porta padrão do React
EXPOSE 3000

# Inicia o servidor de desenvolvimento do React
CMD ["npm", "start"]