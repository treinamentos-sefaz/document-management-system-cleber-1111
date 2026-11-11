import DownloadButton from './DownloadButton';

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' });
const sizeFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${sizeFormatter.format(bytes / 1024)} KB`;
  return `${sizeFormatter.format(bytes / (1024 * 1024))} MB`;
}

export default function DocumentList({ documents, owner, loading, error, onRetry }) {
  return (
    <section className="documents-section" aria-labelledby="documents-heading">
      <div className="list-heading">
        <div>
          <p className="section-number">02 / ARQUIVOS</p>
          <h2 id="documents-heading">Seus documentos</h2>
        </div>
        {!loading && !error && <span className="document-count">{documents.length} {documents.length === 1 ? 'documento' : 'documentos'}</span>}
      </div>
      {loading ? <p className="list-state" role="status">Carregando documentos...</p> : error ? (
        <div className="list-state" role="alert"><p className="error">{error}</p><button className="button button-outline" type="button" onClick={onRetry}>Tentar novamente</button></div>
      ) : documents.length === 0 ? (
        <p className="list-state">Nenhum documento encontrado para este usuário.</p>
      ) : (
        <div className="document-list">
          <div className="list-labels" aria-hidden="true"><span>DOCUMENTO</span><span>DATA DE ENVIO</span><span>TAMANHO</span><span /></div>
          {documents.map((document) => (
            <div className="document-row" key={document.id}>
              <div className="document-name"><span className="file-mark" aria-hidden="true">DOC</span><strong title={document.originalName}>{document.originalName}</strong></div>
              <span className="document-meta">{dateFormatter.format(new Date(document.uploadedAt))}</span>
              <span className="document-meta">{formatSize(document.size)}</span>
              <DownloadButton owner={owner} document={document} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}