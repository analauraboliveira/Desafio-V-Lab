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

  // Estados de Controle
  const [planos, setPlanos] = useState([]);
  const [loadingIA, setLoadingIA] = useState(false);
  const [erroIA, setErroIA] = useState('');
  
  // Filtros e Paginação
  const [buscaTitulo, setBuscaTitulo] = useState('');
  const [filtroDisciplina, setFiltroDisciplina] = useState('');
  const [filtroTag, setFiltroTag] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('data_cadastro');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const API_URL = 'http://localhost:5000/api';

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
      if (!response.ok) throw new Error("Falha na API");
      const data = await response.json();
      setConteudos(data.conteudos || '');
      if (data.tags && Array.isArray(data.tags)) {
        setTags(data.tags.join(', '));
      }
    } catch (error) {
      setErroIA("A IA demorou a responder. Tente novamente.");
    } finally {
      setLoadingIA(false);
    }
  };

  const salvarPlano = async (e) => {
    e.preventDefault();
    if (!titulo || !objetivo || !ementa || !dataPrevista || !disciplina) {
      alert("Preencha todos os campos obrigatórios.");
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
        limparFormulario();
        carregarPlanos();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const excluirPlano = async (id) => {
    if (!window.confirm("Deseja excluir este plano?")) return;
    try {
      const response = await fetch(`${API_URL}/planos/${id}`, { method: 'DELETE' });
      if (response.ok) carregarPlanos();
    } catch (error) {
      console.error(error);
    }
  };

  const limparFormulario = () => {
    setTitulo(''); setObjetivo(''); setEmenta(''); setDataPrevista('');
    setDisciplina(''); setConteudos(''); setRecursos(''); setTags(''); setErroIA('');
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '40px 20px', fontFamily: '"Inter", system-ui, sans-serif' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        
        {/* Header Elegante */}
        <header style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h1 style={{ color: '#0f172a', fontSize: '32px', fontWeight: '800', letterSpacing: '-0.025em', margin: '0 0 8px 0' }}>
            PlanoIntellect <span style={{ color: '#4f46e5', fontWeight: '400' }}>| V-Lab</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '16px', margin: 0 }}>Gerenciamento inteligente de planos pedagógicos com auxílio de LLM</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '32px', alignItems: 'start' }}>
          
          {/* Formulário Modernizado */}
          <section style={{ backgroundColor: '#ffffff', padding: '28px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>Novo Plano de Aula</h2>
            
            <form onSubmit={salvarPlano}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Título da Aula *</label>
                  <input type="text" style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} value={titulo} onChange={e => setTitulo(e.target.value)} required />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Disciplina *</label>
                  <input type="text" style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} value={disciplina} onChange={e => setDisciplina(e.target.value)} required />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Ementa / Resumo Técnico *</label>
                <textarea style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '8px', border: '1px solid #cbd5e1', height: '64px', boxSizing: 'border-box', resize: 'none' }} value={ementa} onChange={e => setEmenta(e.target.value)} required />
              </div>

              {/* Botão Smart Assist Estilizado */}
              <button type="button" onClick={lidarSmartAssist} disabled={loadingIA} style={{ backgroundColor: loadingIA ? '#94a3b8' : '#4f46e5', color: '#ffffff', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', width: '100%', transition: 'all 0.2s', marginBottom: '20px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                {loadingIA ? "🪄 Processando Recomendações..." : "🪄 Gerar Insights com Google Gemini"}
              </button>
              {erroIA && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '-12px', marginBottom: '12px' }}>{erroIA}</p>}

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Objetivo Pedagógico *</label>
                <textarea style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '8px', border: '1px solid #cbd5e1', height: '64px', boxSizing: 'border-box', resize: 'none' }} value={objetivo} onChange={e => setObjetivo(e.target.value)} required />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Data Prevista *</label>
                <input type="date" style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} value={dataPrevista} onChange={e => setDataPrevista(e.target.value)} required />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Conteúdos Sugeridos (AI)</label>
                <textarea style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', height: '80px', boxSizing: 'border-box', color: '#334155' }} value={conteudos} onChange={e => setConteudos(e.target.value)} readOnly />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Tags Geradas (AI)</label>
                  <input type="text" style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', boxSizing: 'border-box', color: '#334155' }} value={tags} onChange={e => setTags(e.target.value)} readOnly placeholder="Tags Automáticas" />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Recursos de Apoio</label>
                  <input type="text" style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} value={recursos} onChange={e => setRecursos(e.target.value)} placeholder="Ex: Datashow, Slides" />
                </div>
              </div>

              <button type="submit" style={{ backgroundColor: '#10b981', color: '#ffffff', padding: '14px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '15px', width: '100%' }}>
                Concluir e Salvar Plano
              </button>
            </form>
          </section>

          {/* Listagem Modernizada */}
          <section style={{ backgroundColor: '#ffffff', padding: '28px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>Painel de Consulta</h2>
            
            {/* Filtros */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
              <input type="text" placeholder="🔍 Buscar por título..." style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} value={buscaTitulo} onChange={e => { setBuscaTitulo(e.target.value); setPaginaAtual(1); }} />
              <input type="text" placeholder="📁 Filtrar por disciplina..." style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} value={filtroDisciplina} onChange={e => { setFiltroDisciplina(e.target.value); setPaginaAtual(1); }} />
              <input type="text" placeholder="🏷️ Filtrar por tag..." style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} value={filtroTag} onChange={e => { setFiltroTag(e.target.value); setPaginaAtual(1); }} />
              <select style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#fff' }} value={ordenarPor} onChange={e => setOrdenarPor(e.target.value)}>
                <option value="data_cadastro">Data de Cadastro</option>
                <option value="titulo">Ordem Alfabética</option>
              </select>
            </div>

            {/* Listagem Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {planos.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '14px', padding: '40px 0' }}>Nenhum plano pedagógico registrado.</p>
              ) : (
                planos.map(plano => (
                  <div key={plano.id} style={{ border: '1px solid #f1f5f9', borderRadius: '12px', padding: '18px', position: 'relative', backgroundColor: '#fff', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.01)' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#4f46e5', backgroundColor: '#f5f3ff', padding: '4px 8px', borderRadius: '6px' }}>{plano.disciplina}</span>
                    <h3 style={{ margin: '10px 0 6px 0', color: '#0f172a', fontSize: '16px', fontWeight: '700' }}>{plano.titulo}</h3>
                    <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>{plano.ementa}</p>
                    
                    {plano.tags && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '4px' }}>
                        {plano.tags.split(',').map((tag, idx) => (
                          <span key={idx} style={{ backgroundColor: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' }}>
                            #{tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    <button onClick={() => excluirPlano(plano.id)} style={{ backgroundColor: '#fff', color: '#ef4444', padding: '6px 12px', border: '1px solid #fee2e2', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', position: 'absolute', right: '18px', top: '18px' }}>
                      Remover
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Paginação */}
            {totalPaginas > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <button disabled={paginaAtual === 1} onClick={() => setPaginaAtual(p => p - 1)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer', backgroundColor: '#fff', fontSize: '13px' }}>Anterior</button>
                <span style={{ fontSize: '13px', color: '#475569', fontWeight: '500' }}>{paginaAtual} de {totalPaginas}</span>
                <button disabled={paginaAtual === totalPaginas} onClick={() => setPaginaAtual(p => p + 1)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer', backgroundColor: '#fff', fontSize: '13px' }}>Próxima</button>
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}

export default App;