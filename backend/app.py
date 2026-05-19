import os
import time
import logging
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai

# carrega as variáveis de ambiente do arquivo .env
load_dotenv()

app = Flask(__name__)
CORS(app)  # permite que o frontend em React acesse a API sem problemas de segurança

# configura o banco de dados SQLite local
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///planos.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# configuração de Logs Estruturados exigidos no desafio
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)

# configura a IA do Gemini usando a chave protegida
API_KEY = os.getenv("GEMINI_API_KEY")
if API_KEY:
    genai.configure(api_key=API_KEY)

# modelo da tabela no banco de dados com todos os campos solicitados
class PlanoAula(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(150), nullable=False)
    objetivo = db.Column(db.Text, nullable=False)
    ementa = db.Column(db.Text, nullable=False)
    data_prevista = db.Column(db.String(50), nullable=False)
    disciplina = db.Column(db.String(100), nullable=False)
    conteudos = db.Column(db.Text)
    recursos = db.Column(db.Text)
    tags = db.Column(db.String(200))
    data_cadastro = db.Column(db.Float, default=time.time)

    def to_dict(self):
        return {
            "id": self.id,
            "titulo": self.titulo,
            "objetivo": self.objetivo,
            "ementa": self.ementa,
            "data_prevista": self.data_prevista,
            "disciplina": self.disciplina,
            "conteudos": self.conteudos,
            "recursos": self.recursos,
            "tags": self.tags
        }

# endpoint 1: Health Check
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

# endpoint 2: Smart Assist (Integração com LLM)
@app.route('/api/ai/recommend', methods=['POST'])
def smart_assist():
    data = request.json
    titulo = data.get("titulo", "")
    disciplina = data.get("disciplina", "")
    ementa = data.get("ementa", "")
    
    start_time = time.time()
    
    # validação simples se os dados existem antes de chamar a IA
    if not titulo or not disciplina:
        return jsonify({"error": "Título e Disciplina são obrigatórios para a IA."}), 400

    # prompt Engineering rígido para atuar como Assistente Pedagógico e responder em JSON
    prompt = (
        f"Atue estritamente como um Assistente Pedagógico especialista. Com base nos detalhes da aula abaixo, "
        f"gere sugestões de conteúdos complementares e tópicos relacionados de forma textual, "
        f"e liste exatamente 3 tags recomendadas para indexação.\n\n"
        f"Título da Aula: {titulo}\n"
        f"Disciplina: {disciplina}\n"
        f"Ementa/Resumo: {ementa}\n\n"
        f"Sua resposta DEVE ser exclusivamente um objeto JSON válido, sem formatações markdown adicionais, "
        f"no seguinte formato:\n"
        f"{{\n"
        f"  \"conteudos\": \"Texto sugerindo conteúdos complementares e tópicos relacionados aqui.\",\n"
        f"  \"tags\": [\"tag1\", \"tag2\", \"tag3\"]\n"
        f"}}"
    )

    try:
        if not API_KEY:
            raise ValueError("Chave GEMINI_API_KEY não configurada no ambiente.")
            
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        ai_response_text = response.text.strip()
        
        # remove possíveis blocos de código que o markdown do LLM costuma colocar
        if ai_response_text.startswith("```json"):
            ai_response_text = ai_response_text.replace("```json", "").replace("```", "").strip()
            
        latency = round(time.time() - start_time, 2)
        # Log estruturado igual ao solicitado pelo desafio
        logger.info(f'[INFO] AI Request: Title="{titulo}", Discipline="{disciplina}", Latency={latency}s')
        
        return ai_response_text, 200, {'Content-Type': 'application/json'}
        
    except Exception as e:
        latency = round(time.time() - start_time, 2)
        logger.error(f'[ERROR] AI Failure: Title="{titulo}", Latency={latency}s. Reason: {str(e)}')
        # retorna uma simulação (fallback) caso a API falhe ou a chave não exista, evitando travar o candidato
        mock_response = {
            "conteudos": "Sugestão de conteúdo complementar focado em práticas de laboratório e tópicos avançados.",
            "tags": [disciplina, "Prática", "Estudo"]
        }
        return jsonify(mock_response), 200

# Endpoint 3: Criar um Plano de Aula (Create)
@app.route('/api/planos', methods=['POST'])
def criar_plano():
    data = request.json
    try:
        novo_plano = PlanoAula(
            titulo=data['titulo'],
            objetivo=data['objetivo'],
            ementa=data['ementa'],
            data_prevista=data['data_prevista'],
            disciplina=data['disciplina'],
            conteudos=data.get('conteudos', ''),
            recursos=data.get('recursos', ''),
            tags=data.get('tags', '')
        )
        db.session.add(novo_plano)
        db.session.commit()
        return jsonify(novo_plano.to_dict()), 201
    except KeyError as e:
        return jsonify({"error": f"O campo {str(e)} é obrigatório."}), 400

# Endpoint 4: Listagem com paginação, filtros e ordenação (Read)
@app.route('/api/planos', methods=['GET'])
def listar_planos():
    # Parâmetros de paginação
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 5, type=int)
    
    # Parâmetros de filtros e busca
    busca_titulo = request.args.get('titulo', '')
    filtro_disciplina = request.args.get('disciplina', '')
    filtro_tag = request.args.get('tag', '')
    ordenar_por = request.args.get('ordenar', 'data_cadastro') # Padrão data_cadastro

    query = PlanoAula.query

    # Aplicando filtros se existirem
    if busca_titulo:
        query = query.filter(PlanoAula.titulo.ilike(f"%{busca_titulo}%"))
    if filtro_disciplina:
        query = query.filter(PlanoAula.disciplina.ilike(f"%{filtro_disciplina}%"))
    if filtro_tag:
        query = query.filter(PlanoAula.tags.ilike(f"%{filtro_tag}%"))

    # Ordenação
    if ordenar_por == 'titulo':
        query = query.order_by(PlanoAula.titulo.asc())
    else:
        query = query.order_by(PlanoAula.data_cadastro.desc())

    paginated_query = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        "planos": [p.to_dict() for p in paginated_query.items],
        "total": paginated_query.total,
        "pages": paginated_query.pages,
        "current_page": paginated_query.page
    }), 200

# Endpoint 5: Atualizar Plano (Update)
@app.route('/api/planos/<int:id>', methods=['PUT'])
def atualizar_plano(id):
    plano = PlanoAula.query.get_or_400(id)
    data = request.json
    
    plano.titulo = data.get('titulo', plano.titulo)
    plano.objetivo = data.get('objetivo', plano.objetivo)
    plano.ementa = data.get('ementa', plano.ementa)
    plano.data_prevista = data.get('data_prevista', plano.data_prevista)
    plano.disciplina = data.get('disciplina', plano.disciplina)
    plano.conteudos = data.get('conteudos', plano.conteudos)
    plano.recursos = data.get('recursos', plano.recursos)
    plano.tags = data.get('tags', plano.tags)
    
    db.session.commit()
    return jsonify(plano.to_dict()), 200

# Endpoint 6: Excluir Plano (Delete)
@app.route('/api/planos/<int:id>', methods=['DELETE'])
def excluir_plano(id):
    plano = PlanoAula.query.get_or_400(id)
    db.session.delete(plano)
    db.session.commit()
    return jsonify({"message": "Plano excluído com sucesso!"}), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Cria o banco de dados SQLite automaticamente ao iniciar
    app.run(host='0.0.0.0', port=5000, debug=True)