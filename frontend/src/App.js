import React, { useState, useEffect } from 'react';

function App() {
  // Estados do Formulário
  const [titulo, setTitulo] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [ementa, setEmenta] = useState('');
  const [dataPrevista, setDataPrevista] = useState('');
  const [disciplina, setDisciplina] = useState('');
  const [conteudos, setConteudos] = useState('');
  const [topicos, setTopicos] = useState(''); // <-- NOVO ESTADO PARA OS TÓPICOS
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
      const tagTratada = filtroTag.replace('#', '').trim();
      const queryParams = new URLSearchParams({
        page: paginaAtual,
        titulo: buscaTitulo.trim(),
        disciplina: filtroDisciplina.trim(),
        tag: tagTratada,
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
      
      // Mapeia os retornos do backend para os estados do React
      setConteudos(data.conteudos || '');
      setTopicos(data.topicos || data.topicos_relacionados || ''); // <-- CAPTURA OS TÓPICOS DA API
      
      if (data.tags && Array.isArray(data.tags)) {
        setTags(data.tags.slice(0, 3).join(', ')); // Garante o limite de 3 tags sugeridas
      } else if (data.tags) {
        setTags(data.tags);
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
    // Inclui a propriedade de tópicos ao salvar se o seu banco aceitar, 
    // caso contrário ele apenas exibe na tela durante a geração.
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
    setDisciplina(''); setConteudos(''); setTopicos(''); setRecursos(''); setTags(''); setErroIA('');
  };

  const styles = {
    input: {
      width: '100%',
      padding: '12px 14px',
      marginTop: '6px',
      borderRadius: '10px',
      border: '1px solid #cbd5e1',
      boxSizing: 'border-box',
      fontSize: '14px',
      color: '#0f172a',
      backgroundColor: '#ffffff',
      outline: 'none',
      transition: 'all 0.2s ease',
    },
    label: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#475569'
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '40px 20px', fontFamily: '"Inter", system-ui, -apple-system, sans-serif', color: '#0f172a' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* Header Dashboard Premium */}
        <header style={{ marginBottom: '35px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '30px', fontWeight: '800', letterSpacing: '-0.025em', margin: 0, color: '#0f172a' }}>
              Plano<span style={{ color: '#4f46e5' }}>Intellect</span> <span style={{ color: '#94a3b8', fontWeight: '300' }}>| V-Lab</span>
            </h1>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0 0', fontWeight: '500' }}>Gerenciamento inteligente de planos pedagógicos com auxílio de LLM</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: '#e0e7ff', padding: '6px 14px', borderRadius: '20px', color: '#4f46e5', fontSize: '12px', fontWeight: '700' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%', display: 'inline-block' }}></span>
            Google Gemini Ativo
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: '35px', alignItems: 'start' }}>
          
          {/* Painel de Cadastro (Esquerda) */}
          <section style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '6px' }}>Novo Plano de Aula</h2>
            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>Preencha os campos abaixo e utilize a IA para enriquecer o conteúdo.</p>
            
            <form onSubmit={salvarPlano}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={styles.label}>Título da Aula *</label>
                  <input type="text" style={styles.input} value={titulo} onChange={e => setTitulo(e.target.value)} required />
                </div>
                <div>
                  <label style={styles.label}>Disciplina *</label>
                  <input type="text" style={styles.input} value={disciplina} onChange={e => setDisciplina(e.target.value)} required />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={styles.label}>Ementa / Resumo Técnico *</label>
                <textarea style={{ ...styles.input, height: '70px', resize: 'none' }} value={ementa} onChange={e => setEmenta(e.target.value)} required />
              </div>

              {/* Botão Assistente */}
              <button type="button" onClick={lidarSmartAssist} disabled={loadingIA} style={{ backgroundColor: loadingIA ? '#94a3b8' : '#4f46e5', color: '#ffffff', padding: '13px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', width: '100%', fontSize: '14px', marginBottom: '20px', display: 'flex', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 10px rgba(79, 70, 229, 0.15)', transition: 'all 0.2s' }}>
                {loadingIA ? "🪄 Processando Recomendações..." : "🪄 Gerar Insights com Google Gemini"}
              </button>
              {erroIA && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '-12px', marginBottom: '12px' }}>⚠️ {erroIA}</p>}

              <div style={{ marginBottom: '16px' }}>
                <label style={styles.label}>Objetivo Pedagógico *</label>
                <textarea style={{ ...styles.input, height: '70px', resize: 'none' }} value={objetivo} onChange={e => setObjetivo(e.target.value)} required />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={styles.label}>Data Prevista *</label>
                <input type="date" style={styles.input} value={dataPrevista} onChange={e => setDataPrevista(e.target.value)} required />
              </div>

              {/* Box da IA Destacada */}
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#4f46e5', display: 'block', marginBottom: '12px', letterSpacing: '0.05em' }}>✨ Retorno Automatizado LLM</span>
                
                <div style={{ marginBottom: '12px' }}>
                  <label style={styles.label}>Conteúdos Sugeridos (AI)</label>
                  <textarea style={{ ...styles.input, height: '75px', resize: 'none', backgroundColor: '#ffffff' }} value={conteudos} readOnly />
                </div>

                {/* NOVO CAMPO VISUAL PARA OS TÓPICOS RELACIONADOS */}
                <div style={{ marginBottom: '12px' }}>
                  <label style={styles.label}>Tópicos Relacionados (AI)</label>
                  <textarea style={{ ...styles.input, height: '75px', resize: 'none', backgroundColor: '#ffffff' }} value={topicos} readOnly placeholder="Tópicos paralelos sugeridos pela IA..." />
                </div>

                <div>
                  <label style={styles.label}>Tags Geradas (AI)</label>
                  <input type="text" style={{ ...styles.input, backgroundColor: '#ffffff' }} value={tags} readOnly placeholder="3 Tags automáticas" />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={styles.label}>Recursos de Apoio</label>
                <input type="text" style={styles.input} value={recursos} onChange={e => setRecursos(e.target.value)} placeholder="Ex: Datashow, Slides" />
              </div>

              <button type="submit" style={{ backgroundColor: '#10b981', color: '#ffffff', padding: '14px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '15px', width: '100%', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.15)' }}>
                Concluir e Salvar Plano
              </button>
            </form>
          </section>

          {/* Painel de Consulta (Direita) */}
          <section style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '6px' }}>Painel de Consulta</h2>
            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>Monitore e filtre dinamicamente as aulas salvas na base SQLite.</p>
            
            {/* Filtros Inteligentes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <input type="text" placeholder="🔍 Buscar por título..." style={{ ...styles.input, marginTop: 0, padding: '10px' }} value={buscaTitulo} onChange={e => { setBuscaTitulo(e.target.value); setPaginaAtual(1); }} />
              <input type="text" placeholder="📁 Filtrar por disciplina..." style={{ ...styles.input, marginTop: 0, padding: '10px' }} value={filtroDisciplina} onChange={e => { setFiltroDisciplina(e.target.value); setPaginaAtual(1); }} />
              <input type="text" placeholder="🏷️ Filtrar por tag..." style={{ ...styles.input, marginTop: 0, padding: '10px' }} value={filtroTag} onChange={e => { setFiltroTag(e.target.value); setPaginaAtual(1); }} />
              <select style={{ ...styles.input, marginTop: 0, padding: '10px', backgroundColor: '#fff', cursor: 'pointer' }} value={ordenarPor} onChange={e => setOrdenarPor(e.target.value)}>
                <option value="data_cadastro">📆 Data de Cadastro</option>
                <option value="titulo">🔤 Ordem Alfabética</option>
              </select>
            </div>

            {/* Listagem de Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {planos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                  <p style={{ fontSize: '15px', fontWeight: '500', margin: 0 }}>Nenhum plano pedagógico registrado.</p>
                  <p style={{ fontSize: '13px', margin: '4px 0 0 0' }}>Altere os filtros ou adicione uma nova aula à esquerda.</p>
                </div>
              ) : (
                planos.map(plano => (
                  <div key={plano.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px', position: 'relative', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#4f46e5', backgroundColor: '#e0e7ff', padding: '4px 8px', borderRadius: '6px' }}>
                      {plano.disciplina}
                    </span>
                    <h3 style={{ margin: '12px 0 6px 0', color: '#0f172a', fontSize: '16px', fontWeight: '700' }}>{plano.titulo}</h3>
                    <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>{plano.ementa}</p>
                    
                    {/* Renderização Limpa de Tags */}
                    {plano.tags && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {plano.tags.split(',').map((tag, idx) => {
                          const tagLimpa = tag.trim().replace('#', '');
                          return tagLimpa ? (
                            <span key={idx} style={{ backgroundColor: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' }}>
                              #{tagLimpa}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}

                    <button onClick={() => excluirPlano(plano.id)} style={{ backgroundColor: '#fff', color: '#ef4444', padding: '6px 12px', border: '1px solid #fee2e2', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', position: 'absolute', right: '18px', top: '18px', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.target.style.backgroundColor = '#ef4444'; e.target.style.color = '#fff'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = '#fff'; e.target.style.color = '#ef4444'; }}>
                      Remover
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Paginação */}
            {totalPaginas > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                <button disabled={paginaAtual === 1} onClick={() => setPaginaAtual(p => p - 1)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer', backgroundColor: '#fff', fontSize: '13px', fontWeight: '500' }}>← Anterior</button>
                <span style={{ fontSize: '13px', color: '#475569', fontWeight: '600' }}>{paginaAtual} de {totalPaginas}</span>
                <button disabled={paginaAtual === totalPaginas} onClick={() => setPaginaAtual(p => p + 1)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer', backgroundColor: '#fff', fontSize: '13px', fontWeight: '500' }}>Próxima →</button>
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}

export default App;