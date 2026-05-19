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
    <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', padding: '30px 20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* Título Principal com a palavra Planos em Roxo Destacado */}
        <header style={{ marginBottom: '25px', paddingLeft: '10px' }}>
          <h1 style={{ color: '#111827', fontSize: '28px', fontWeight: '700', letterSpacing: '-0.5px' }}>
            Sistema de Gerenciamento de <span style={{ color: '#4f46e5' }}>Planos de Aula</span>
          </h1>
        </header>

        {/* Grid Principal dividido exatamente como o mockup */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '25px', alignItems: 'start' }}>
          
          {/* Formulário com o fundo degradê sutil do mockup */}
          <section style={{ 
            background: 'linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)', 
            padding: '25px', 
            borderRadius: '12px', 
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' 
          }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '20px' }}>Cadastrar Plano de Aula</h2>
            
            <form onSubmit={salvarPlano}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Título da Aula *</label>
                <input type="text" placeholder="Título de Aula" style={{ width: '100%', padding: '10px 12px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '14px' }} value={titulo} onChange={e => setTitulo(e.target.value)} required />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Disciplina *</label>
                <input type="text" placeholder="Disciplina" style={{ width: '100%', padding: '10px 12px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '14px' }} value={disciplina} onChange={e => setDisciplina(e.target.value)} required />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Ementa / Resumo *</label>
                <textarea placeholder="Ementa/ Resumo" style={{ width: '100%', padding: '10px 12px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', height: '70px', boxSizing: 'border-box', resize: 'none', fontSize: '14px' }} value={ementa} onChange={e => setEmenta(e.target.value)} required />
              </div>

              {/* Botão de IA Roxo Mesclado */}
              <button type="button" onClick={lidarSmartAssist} disabled={loadingIA} style={{ backgroundColor: loadingIA ? '#9ca3af' : '#818cf8', color: '#ffffff', padding: '10px 14px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', width: '100%', fontSize: '13px', marginBottom: '18px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                ✨ {loadingIA ? "Gerando..." : "Gerar Recomendações com IA"}
              </button>
              {erroIA && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '-10px', marginBottom: '10px' }}>{erroIA}</p>}

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Objetivo da Aula *</label>
                <textarea placeholder="Objetivo da Aula" style={{ width: '100%', padding: '10px 12px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', height: '70px', boxSizing: 'border-box', resize: 'none', fontSize: '14px' }} value={objetivo} onChange={e => setObjetivo(e.target.value)} required />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Data Prevista *</label>
                <input type="date" style={{ width: '100%', padding: '10px 12px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '14px' }} value={dataPrevista} onChange={e => setDataPrevista(e.target.value)} required />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Conteúdos Complementares (Preenchido por IA)</label>
                <textarea placeholder="Conteúdos Complementares (Preenchido por IA)" style={{ width: '100%', padding: '10px 12px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', height: '70px', boxSizing: 'border-box', backgroundColor: '#ffffff', color: '#4b5563', fontSize: '14px' }} value={conteudos} readOnly />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Tags Recomendadas (Preenchido por IA)</label>
                <input type="text" placeholder="Ex: IA, Python, Algoritmos" style={{ width: '100%', padding: '10px 12px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', backgroundColor: '#ffffff', color: '#4b5563', fontSize: '14px' }} value={tags} readOnly />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Recursos de Apoio</label>
                <input type="text" placeholder="Ex: Projetor, Slides, Quadro" style={{ width: '100%', padding: '10px 12px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '14px' }} value={recursos} onChange={e => setREcursos(e.target.value)} />
              </div>

              {/* Botão Verde de Salvar do mockup */}
              <button type="submit" style={{ backgroundColor: '#059669', color: '#ffffff', padding: '12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', width: '100%' }}>
                Salvar Plano de Aula
              </button>
            </form>
          </section>

          {/* Painel de Consulta à Direita */}
          <section style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '20px' }}>Consulta de Planos</h2>
            
            {/* Linha de Filtros Compacta e Alinhada */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              <input type="text" placeholder="Buscar por Título..." style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', width: '100%', boxSizing: 'border-box' }} value={buscaTitulo} onChange={e => { setBuscaTitulo(e.target.value); setPaginaAtual(1); }} />
              <input type="text" placeholder="Filtrar por Disciplina..." style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', width: '100%', boxSizing: 'border-box' }} value={filtroDisciplina} onChange={e => { setFiltroDisciplina(e.target.value); setPaginaAtual(1); }} />
              <input type="text" placeholder="Filtrar por Tag..." style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', width: '100%', boxSizing: 'border-box' }} value={filtroTag} onChange={e => { setFiltroTag(e.target.value); setPaginaAtual(1); }} />
              <select style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#fff', width: '100%', boxSizing: 'border-box' }} value={ordenarPor} onChange={e => setOrdenarPor(e.target.value)}>
                <option value="data_cadastro">Ordenar por: Data de Cadastro</option>
                <option value="titulo">Ordenar por: Ordem Alfabética</option>
              </select>
            </div>

            {/* Renderização em Grid/Cards flutuantes como na imagem da maquete */}
            <div style={{ display: 'grid', gridTemplateColumns: planos.length > 1 ? '1fr 1fr' : '1fr', gap: '15px' }}>
              {planos.length === 0 ? (
                <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#6b7280', fontSize: '14px', padding: '30px 0' }}>Nenhum plano de aula encontrado.</p>
              ) : (
                planos.map(plano => (
                  <div key={plano.id} style={{ 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '12px', 
                    padding: '16px', 
                    backgroundColor: '#fff', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'between',
                    position: 'relative'
                  }}>
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: '600', color: '#4b5563', backgroundColor: '#e5e7eb', padding: '3px 8px', borderRadius: '4px' }}>
                        {plano.disciplina}
                      </span>
                      <h3 style={{ margin: '10px 0 6px 0', color: '#111827', fontSize: '15px', fontWeight: '700' }}>{plano.titulo}</h3>
                      <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#4b5563', lineHeight: '1.4' }}>{plano.ementa}</p>
                    </div>

                    {plano.tags && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: 'auto' }}>
                        {plano.tags.split(',').map((tag, idx) => (
                          <span key={idx} style={{ backgroundColor: '#f3f4f6', color: '#1f2937', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '500' }}>
                            #{tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    <button onClick={() => excluirPlano(plano.id)} style={{ position: 'absolute', bottom: '12px', right: '12px', backgroundColor: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                      Remover
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Navegação da Paginação */}
            {totalPaginas > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '20px', borderTop: '1px solid #e5e7eb', paddingTop: '15px' }}>
                <button disabled={paginaAtual === 1} onClick={() => setPaginaAtual(p => p - 1)} style={{ padding: '5px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', cursor: 'pointer', backgroundColor: '#fff', fontSize: '12px' }}>Anterior</button>
                <span style={{ fontSize: '12px', color: '#4b5563' }}>{paginaAtual} de {totalPaginas}</span>
                <button disabled={paginaAtual === totalPaginas} onClick={() => setPaginaAtual(p => p + 1)} style={{ padding: '5px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', cursor: 'pointer', backgroundColor: '#fff', fontSize: '12px' }}>Próxima</button>
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}

export default App;