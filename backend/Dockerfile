# imagem oficial leve de Python
FROM python:3.10-slim

# define o diretório de trabalho dentro do container
WORKDIR /app

# copia a lista de dependências e as instala
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# copia o restante do código do backend para o container
COPY . .

# expõe a porta que o Flask vai rodar
EXPOSE 5000

# comando para iniciar a aplicação
CMD ["python", "app.py"]