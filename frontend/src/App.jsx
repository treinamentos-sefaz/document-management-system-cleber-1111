import { useEffect, useState } from 'react';
import UploadComponent from './components/UploadComponent';
import DocumentList from './components/DocumentList';
import { listDocuments } from './services/documentsApi';
import './styles.css';

function DocumentWorkspace({ owner }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    listDocuments(owner)
      .then((result) => {
        if (active) setDocuments(result);
      })
      .catch((failure) => {
        if (active) setError(failure.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [owner, revision]);

  return (
    <>
      <UploadComponent owner={owner} onUploaded={() => setRevision((value) => value + 1)} />
      <DocumentList documents={documents} owner={owner} loading={loading} error={error} onRetry={() => setRevision((value) => value + 1)} />
    </>
  );
}

export default function App() {
  const [userInput, setUserInput] = useState('');
  const [owner, setOwner] = useState('');

  function selectOwner(event) {
    event.preventDefault();
    const nextOwner = userInput.trim();
    if (nextOwner) setOwner(nextOwner);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand"><span className="brand-mark">D</span><span>DMS</span></div>
          <span className="topbar-label">Gestão de documentos</span>
        </div>
      </header>
      <main className="main-content">
        <div className="page-heading">
          <div>
            <p className="eyebrow">ÁREA DE TRABALHO</p>
            <h1>Documentos</h1>
            <p className="subtitle">Seus arquivos, organizados em um só lugar.</p>
          </div>
          {owner && <div className="current-user"><span className="status-dot" />Usuário: <strong>{owner}</strong></div>}
        </div>
        <section className="user-section" aria-labelledby="user-heading">
          <div>
            <h2 id="user-heading">Identificação</h2>
            <p>Selecione o usuário para acessar seus documentos.</p>
          </div>
          <form className="user-form" onSubmit={selectOwner}>
            <label htmlFor="user-id">Identificador do usuário</label>
            <div className="input-row">
              <input id="user-id" value={userInput} onChange={(event) => setUserInput(event.target.value)} placeholder="Ex.: usuario-1" required />
              <button type="submit" className="button button-dark">Acessar</button>
            </div>
          </form>
        </section>
        {owner ? <DocumentWorkspace key={owner} owner={owner} /> : (
          <div className="welcome-state">Informe seu usuário para acessar seus documentos.</div>
        )}
      </main>
      <footer className="footer">DMS <span> / </span> Gestão de documentos</footer>
    </div>
  );
}
