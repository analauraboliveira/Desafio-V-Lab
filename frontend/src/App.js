import React, { useState, useEffect } from 'react';

function App() {
  // Estados do Formulário
  const [titulo, setTitulo] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [ementa, setEmenta] = useState('');
  const [dataPrevista, setDataPrevista] = useState('');
  const [disciplina, setDisciplina] = useState('');
  const [conteudos, setConteudos] = useState('');
  const [recursos, setRecursos] = useState('');
  const [tags, setTags] = useState('');

  // Estados de Controle do Sistema
  const [planos, setPlanos] = useState([]);
  const [loadingIA, setLoadingIA] = useState(false);
  const [erroIA, setErroIA] = useState('');
  
  // Estados de Filtro, Busca e Paginação
  const [buscaTitulo, setBuscaTitulo] = useState('');
  const [filtroDisciplina, setFiltroDisciplina] = useState('');
  const [filtroTag, setFiltroTag] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('data_cadastro');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  // URL base da API do Flask
  const API_URL = 'http://localhost:5000/api';

  // Carregar planos de aula sempre que um filtro ou página mudar
  useEffect(() => {
    carregarPlanos();
  }, [paginaAtual, buscaTitulo, filtroDisciplina, filtroTag, ordenarPor]);

  const carregarPlanos = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: paginaAtual,
        titulo: buscaTitulo,
        disciplina: filtroDisciplina,
        tag: filtroTag,
        ordenar: ordenarPor
      });
      const response = await fetch(`${API_URL}/planos?${queryParams}`);
      const data = await response.json();
      setPlanos(data.planos || []);
      setTotalPaginas(data.pages || 1);
    } catch (error) {
      console.error("Erro ao buscar planos de aula:", error);
    }
  };

  // Funcionalidade Smart Assist (Chamada à IA)
  const lidarSmartAssist = async () => {
    if (!titulo || !disciplina) {
      alert("Por favor, preencha o Título da Aula e a Disciplina antes de usar a IA.");
      return;
    }

    setLoadingIA(true);
    setErroIA('');

    try {
      const response = await fetch(`${API_URL}/ai/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, disciplina, ementa })
      });

      if (!response.ok) throw new Error("A API de IA falhou ao responder.");

      const data = await response.json();
      
      // Preenchimento automático dos campos com a resposta da IA
      setConteudos(data.conteudos || '');
      if (data.tags && Array.isArray(data.tags)) {
        setTags(data.tags.join(', '));
      }
    } catch (error) {
      setErroIA("Ocorreu um erro ou a IA demorou demais para responder. Tente novamente.");
    } finally {
      setLoadingIA(false);
    }
  };

  // Submeter o formulário de cadastro (CRUD)
  const salvarPlano = async (e) => {
    e.preventDefault();
    if (!titulo || !objetivo || !ementa || !dataPrevista || !disciplina) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const novoPlano = { titulo, objetivo, ementa, data_prevista: dataPrevista, disciplina, conteudos, recursos, tags };

    try {
      const response = await fetch(`${API_URL}/planos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoPlano)
      });

      if (response.ok) {
        alert("Plano de Aula cadastrado com sucesso!");
        limparFormulario();
        carregarPlanos();
      }
    } catch (error) {
      console.error("Erro ao salvar plano:", error);
    }
  };

  // Excluir um plano de aula (CRUD)
  const excluirPlano = async (id) => {
    if (!window.confirm("Deseja realmente excluir este plano de aula?")) return;

    try {
      const response = await fetch(`${API_URL}/planos/${id}`, { method: 'DELETE' });
      if (response.ok) {
        carregarPlanos();
      }
    } catch (error) {
      console.error("Erro ao excluir plano:", error);
    }
  };

  const limparFormulario = () => {
    setTitulo('');
    setObjetivo('');
    setEmenta('');
    setDataPrevista('');
    setDisciplina('');
    setConteudos('');
    setRecursos('');
    setTags('');
    setErroIA('');
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto', padding: '20px', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <header style={{ borderBottom: '2px solid #ddd', paddingBottom: '10px', marginBottom: '20px' }}>
        <h1 style={{ color: '#333' }}>Sistema de Gerenciamento de Planos de Aula</h1>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        
        {/* Seção do Formulário */}
        <section style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2>Cadastrar Plano de Aula</h2>
          <form onSubmit={salvarPlano}>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>Título da Aula *</label>
              <input type="text" style={{ width: '97%', padding: '8px', marginTop: '5px' }} value={titulo} onChange={e => setTitulo(e.target.value)} required />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>Disciplina *</label>
              <input type="text" style={{ width: '97%', padding: '8px', marginTop: '5px' }} value={disciplina} onChange={e => setDisciplina(e.target.value)} required />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>Ementa / Resumo *</label>
              <textarea style={{ width: '97%', padding: '8px', marginTop: '5px', height: '60px' }} value={ementa} onChange={e => setEmenta(e.target.value)} required />
            </div>

            {/* Botão do Smart Assist (IA) */}
            <div style={{ marginBottom: '20px', marginTop: '15px' }}>
              <button type="button" onClick={lidarSmartAssist} disabled={loadingIA} style={{ backgroundColor: '#4F46E5', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>
                {loadingIA ? "🪄 IA pensando... Aguarde" : "🪄 Gerar Recomendações com IA"}
              </button>
              {erroIA && <p style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>{erroIA}</p>}
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>Objetivo da Aula *</label>
              <textarea style={{ width: '97%', padding: '8px', marginTop: '5px', height: '60px' }} value={objetivo} onChange={e => setObjetivo(e.target.value)} required />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>Data Prevista *</label>
              <input type="date" style={{ width: '97%', padding: '8px', marginTop: '5px' }} value={dataPrevista} onChange={e => setDataPrevista(e.target.value)} required />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>Conteúdos Complementares (Preenchido por IA)</label>
              <textarea style={{ width: '97%', padding: '8px', marginTop: '5px', height: '80px', backgroundColor: '#f3f4f6' }} value={conteudos} onChange={e => setConteudos(e.target.value)} />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>Tags Recomendadas (Preenchido por IA)</label>
              <input type="text" style={{ width: '97%', padding: '8px', marginTop: '5px', backgroundColor: '#f3f4f6' }} value={tags} onChange={e => setTags(e.target.value)} placeholder="Ex: IA, Python, Algoritmos" />
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>Recursos de Apoio</label>
              <input type="text" style={{ width: '97%', padding: '8px', marginTop: '5px' }} value={recursos} onChange={e => setRecursos(e.target.value)} placeholder="Ex: Projetor, Slides, Quadro" />
            </div>

            <button type="submit" style={{ backgroundColor: '#10B981', color: 'white', padding: '12px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', width: '100%', marginTop: '10px' }}>
              Salvar Plano de Aula
            </button>
          </form>
        </section>

        {/* Seção da Listagem e Filtros */}
        <section style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2>Consulta de Planos</h2>
          
          {/* Painel de Filtros e Busca */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px', padding: '10px', backgroundColor: '#f3f4f6', borderRadius: '5px' }}>
            <input type="text" placeholder="Buscar por Título..." style={{ padding: '6px' }} value={buscaTitulo} onChange={e => { setBuscaTitulo(e.target.value); setPaginaAtual(1); }} />
            <input type="text" placeholder="Filtrar por Disciplina..." style={{ padding: '6px' }} value={filtroDisciplina} onChange={e => { setFiltroDisciplina(e.target.value); setPaginaAtual(1); }} />
            <input type="text" placeholder="Filtrar por Tag..." style={{ padding: '6px' }} value={filtroTag} onChange={e => { setFiltroTag(e.target.value); setPaginaAtual(1); }} />
            
            <select style={{ padding: '6px' }} value={ordenarPor} onChange={e => setOrdenarPor(e.target.value)}>
              <option value="data_cadastro">Ordenar por: Data de Cadastro</option>
              <option value="titulo">Ordenar por: Título</option>
            </select>
          </div>

          {/* Cards da Listagem */}
          <div>
            {planos.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666' }}>Nenhum plano de aula encontrado.</p>
            ) : (
              planos.map(plano => (
                <div key={plano.id} style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '15px', marginBottom: '15px', position: 'relative', backgroundColor: '#fff' }}>
                  <h3 style={{ margin: '0 0 5px 0', color: '#1F2937' }}>{plano.titulo}</h3>
                  <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#4B5563' }}><strong>Disciplina:</strong> {plano.disciplina} | <strong>Data Prevista:</strong> {plano.data_prevista}</p>
                  <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#6B7280' }}>{plano.ementa}</p>
                  
                  {plano.tags && (
                    <div style={{ marginBottom: '10px' }}>
                      {plano.tags.split(',').map((tag, idx) => (
                        <span key={idx} style={{ backgroundColor: '#E0E7FF', color: '#4338CA', padding: '3px 8px', borderRadius: '12px', fontSize: '12px', marginRight: '5px', fontWeight: 'bold' }}>
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  <button onClick={() => excluirPlano(plano.id)} style={{ backgroundColor: '#EF4444', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', position: 'absolute', right: '15px', top: '15px' }}>
                    Excluir
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Paginação */}
          {totalPaginas > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
              <button disabled={paginaAtual === 1} onClick={() => setPaginaAtual(p => p - 1)} style={{ padding: '5px 10px', cursor: 'pointer' }}>Anterior</button>
              <span>Página {paginaAtual} de {totalPaginas}</span>
              <button disabled={paginaAtual === totalPaginas} onClick={() => setPaginaAtual(p => p + 1)} style={{ padding: '5px 10px', cursor: 'pointer' }}>Próxima</button>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

export default App;