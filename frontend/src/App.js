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

  // Objeto de estilos reutilizáveis para evitar bagunça
  const styles = {
    input: {
      width: '100%',
      padding: '12px 16px',
      marginTop: '6px',
      borderRadius: '10px',
      border: '1px solid #e2e8f0',
      boxSizing: 'border-box',
      fontSize: '14px',
      color: '#1e293b',
      backgroundColor: '#ffffff',
      transition: 'all 0.2s ease',
      outline: 'none',
      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
    },
    label: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#475569',
      letterSpacing: '0.3px'
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '40px 20px', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif', color: '#0f172a' }}>
      <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
        
        {/* Header Minimalista e Sofisticado */}
        <header style={{ marginBottom: '35px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-0.8px', margin: 0, color: '#0f172a' }}>
              Plano<span style={{ color: '#4f46e5' }}>Intellect</span>
            </h1>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0 0', fontWeight: '500' }}>Desafio Técnico V-Lab • Gestão Pedagógica com LLM</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: '#e0e7ff', padding: '6px 12px', borderRadius: '20px', color: '#4f46e5', fontSize: '12px', fontWeight: '700' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%', display: 'inline-block' }}></span>
            Gemini Pro Ativo
          </div>
        </header>

        {/* Layout Principal */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: '35px', alignItems: 'start' }}>
          
          {/* Coluna do Formulário (Esquerda) */}
          <section style={{ 
            backgroundColor: '#ffffff', 
            padding: '30px', 
            borderRadius: '20px', 
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.03), 0 8px 10px -6px rgba(0, 0, 0, 0.03)'
          }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', marginBottom: '6px', letterSpacing: '-0.3px' }}>Criar Novo Plano</h2>
            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '25px' }}>Preencha os dados e use a inteligência artificial para otimizar o conteúdo.</p>
            
            <form onSubmit={salvarPlano}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={styles.label}>Título da Aula *</label>
                  <input type="text" placeholder="Ex: Roteamento OSPF" style={styles.input} value={titulo} onChange={e => setTitulo(e.target.value)} required />
                </div>
                <div>
                  <label style={styles.label}>Disciplina *</label>
                  <input type="text" placeholder="Ex: Redes de Computadores" style={styles.input} value={disciplina} onChange={e => setDisciplina(e.target.value)} required />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={styles.label}>Ementa / Resumo Técnico *</label>
                <textarea placeholder="Forneça uma breve descrição do foco da aula..." style={{ ...styles.input, height: '80px', resize: 'none' }} value={ementa} onChange={e => setEmenta(e.target.value)} required />
              </div>

              {/* Botão de IA - Premium / Destacado */}
              <button type="button" onClick={lidarSmartAssist} disabled={loadingIA} style={{ 
                background: loadingIA ? '#94a3b8' : 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', 
                color: '#ffffff', 
                padding: '14px', 
                border: 'none', 
                borderRadius: '12px', 
                cursor: 'pointer', 
                fontWeight: '600', 
                width: '100%', 
                fontSize: '14px', 
                marginBottom: '24px', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: '8px',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
                transition: 'transform 0.2s'
              }}>
                ✨ {loadingIA ? "Consultando Assistente Pedagógico..." : "Gerar Sugestões & Tags com IA"}
              </button>
              {erroIA && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '-16px', marginBottom: '16px', fontWeight: '500' }}>⚠️ {erroIA}</p>}

              <div style={{ marginBottom: '16px' }}>
                <label style={styles.label}>Objetivo Pedagógico *</label>
                <textarea placeholder="O que os alunos devem reter ao fim desta aula?" style={{ ...styles.input, height: '80px', resize: 'none' }} value={objetivo} onChange={e => setObjetivo(e.target.value)} required />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={styles.label}>Data Prevista *</label>
                <input type="date" style={styles.input} value={dataPrevista} onChange={e => setDataPrevista(e.target.value)} required />
              </div>

              {/* Seção Inteligente (Inputs Gerados pela IA possuem fundo sutilmente diferenciado) */}
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#4f46e5', letterSpacing: '0.5px', display: 'block', marginBottom: '12px' }}>✨ Outputs Recomendados via LLM</span>
                
                <div style={{ marginBottom: '12px' }}>
                  <label style={styles.label}>Conteúdos Complementares</label>
                  <textarea placeholder="Serão gerados automaticamente pela IA..." style={{ ...styles.input, height: '80px', resize: 'none', backgroundColor: '#ffffff' }} value={conteudos} readOnly />
                </div>

                <div>
                  <label style={styles.label}>Tags Automáticas</label>
                  <input type="text" placeholder="Tags recomendadas pela IA" style={{ ...styles.input, backgroundColor: '#ffffff' }} value={tags} readOnly />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={styles.label}>Recursos de Apoio Extras</label>
                <input type="text" placeholder="Ex: Laboratório de Práticas, Slides, Projetor" style={styles.input} value={recursos} onChange={e => setRecursos(e.target.value)} />
              </div>

              <button type="submit" style={{ backgroundColor: '#10b981', color: '#ffffff', padding: '14px', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '15px', width: '100%', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}>
                Confirmar e Salvar no Banco
              </button>
            </form>
          </section>

          {/* Coluna do Painel de Consulta (Direita) */}
          <section style={{ 
            backgroundColor: '#ffffff', 
            padding: '30px', 
            borderRadius: '20px', 
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.03), 0 8px 10px -6px rgba(0, 0, 0, 0.03)'
          }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', marginBottom: '6px', letterSpacing: '-0.3px' }}>Painel de Monitoramento</h2>
            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '25px' }}>Filtre, ordene e gerencie todos os planos pedagógicos salvos no SQLite.</p>
            
            {/* Bloco de Filtros Clean */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '25px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <input type="text" placeholder="🔍 Buscar por título..." style={{ ...styles.input, marginTop: 0, padding: '10px 14px' }} value={buscaTitulo} onChange={e => { setBuscaTitulo(e.target.value); setPaginaAtual(1); }} />
              <input type="text" placeholder="📁 Filtrar por disciplina..." style={{ ...styles.input, marginTop: 0, padding: '10px 14px' }} value={filtroDisciplina} onChange={e => { setFiltroDisciplina(e.target.value); setPaginaAtual(1); }} />
              <input type="text" placeholder="🏷️ Filtrar por tag..." style={{ ...styles.input, marginTop: 0, padding: '10px 14px' }} value={filtroTag} onChange={e => { setFiltroTag(e.target.value); setPaginaAtual(1); }} />
              <select style={{ ...styles.input, marginTop: 0, padding: '10px 14px', backgroundColor: '#fff', cursor: 'pointer' }} value={ordenarPor} onChange={e => setOrdenarPor(e.target.value)}>
                <option value="data_cadastro">📆 Ordenar: Cadastro</option>
                <option value="titulo">🔤 Ordenar: Alfabética</option>
              </select>
            </div>

            {/* Listagem em Grid de Duas Colunas Impecável */}
            <div style={{ display: 'grid', gridTemplateColumns: planos.length > 1 ? '1fr 1fr' : '1fr', gap: '16px' }}>
              {planos.length === 0 ? (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px 0', color: '#94a3b8' }}>
                  <p style={{ fontSize: '16px', fontWeight: '500', margin: 0 }}>Nenhum registro encontrado</p>
                  <p style={{ fontSize: '13px', margin: '4px 0 0 0' }}>Cadastre novas aulas ou altere os filtros acima.</p>
                </div>
              ) : (
                planos.map(plano => (
                  <div key={plano.id} style={{ 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '14px', 
                    padding: '18px', 
                    backgroundColor: '#ffffff', 
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)', 
                    display: 'flex', 
                    flexDirection: 'column',
                    position: 'relative',
                    transition: 'all 0.2s'
                  }}>
                    <div style={{ marginBottom: '14px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#4f46e5', backgroundColor: '#e0e7ff', padding: '4px 8px', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                        {plano.disciplina}
                      </span>
                      <h3 style={{ margin: '12px 0 6px 0', color: '#0f172a', fontSize: '16px', fontWeight: '700', letterSpacing: '-0.3px' }}>{plano.titulo}</h3>
                      <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>{plano.ementa}</p>
                    </div>

                    {/* Exibição Elegante das Tags */}
                    {plano.tags && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: 'auto', paddingTop: '10px' }}>
                        {plano.tags.split(',').map((tag, idx) => (
                          <span key={idx} style={{ backgroundColor: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' }}>
                            #{tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Botão de Excluir Minimalista no canto */}
                    <button onClick={() => excluirPlano(plano.id)} style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: 'transparent', color: '#94a3b8', border: 'none', cursor: 'pointer', fontSize: '12px', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#ef4444'} onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Paginação Estilizada */}
            {totalPaginas > 1 && (
              <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginTop: '25px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                <button disabled={paginaAtual === 1} onClick={() => setPaginaAtual(p => p - 1)} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer', backgroundColor: '#fff', fontSize: '13px', fontWeight: '500', color: paginaAtual === 1 ? '#94a3b8' : '#1e293b' }}>← Anterior</button>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Página {paginaAtual} de {totalPaginas}</span>
                <button disabled={paginaAtual === totalPaginas} onClick={() => setPaginaAtual(p => p + 1)} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer', backgroundColor: '#fff', fontSize: '13px', fontWeight: '500', color: paginaAtual === totalPaginas ? '#94a3b8' : '#1e293b' }}>Próxima →</button>
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}

export default App;