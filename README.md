# Sistema de Gerenciamento de Planos de Aula (Desafio V-Lab)

Esta é uma aplicação completa (Single Page Application em React e API RESTful em Flask) projetada para otimizar o planejamento pedagógico de docentes, integrando o banco de dados SQLite e o assistente de Inteligência Artificial Google Gemini.

## 🛠️ Principais Recursos Implementados
- **CRUD Completo de Planos de Aula**: Cadastro, listagem com paginação estruturada, edição e remoção.
- **Smart Assist (IA)**: Módulo integrado com a API do Gemini Pro, atuando como Assistente Pedagógico para enriquecer planos e sugerir 3 tags automáticas.
- **Consultas Avançadas**: Filtros dinâmicos por Disciplina, Tags, Data Prevista e busca por Título com ordenação flexível.
- **Observabilidade**: Sistema de logs estruturados capturando latências de requisições de IA.
- **DevOps**: Containerização completa utilizando Multi-Container Docker Compose e pipeline de CI via GitHub Actions (Flake8).

## 🚀 Como Executar Localmente (Comando Único)

### Pré-requisitos
- Certifique-se de possuir o **Docker** e o **Docker Compose** instalados.

### Passo a Passo
1. Clone o repositório para o seu ambiente local:
   ```bash
   git clone [https://github.com/analauraboliveira/Desafio-V-Lab.git](https://github.com/analauraboliveira/Desafio-V-Lab.git)
   cd Desafio-V-Lab

2. Adicione sua chave de API do Gemini no arquivo ./backend/.env:
   ```bash
   GEMINI_API_KEY=SUA_CHAVE_AQUI
   
3. Suba toda a aplicação (Frontend, Backend e Banco de Dados) com apenas um comando:
    ``` bash
    docker-compose up --build

4. Acesse o sistema através do seu navegador:
- Frontend (Interface React): http://localhost:3000
- Backend (API Flask / Health Check): http://localhost:5000/health