import { useRef, useState } from 'react';
import { uploadDocument } from '../services/documentsApi';

export default function UploadComponent({ owner, onUploaded }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    if (!file || uploading) return;
    setUploading(true);
    setError('');
    setMessage('');
    try {
      await uploadDocument(owner, file);
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
      setMessage('Documento enviado com sucesso.');
      onUploaded();
    } catch (failure) {
      setError(failure.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="upload-section" aria-labelledby="upload-heading">
      <div className="section-intro">
        <p className="section-number">01 / ENVIO</p>
        <h2 id="upload-heading">Adicionar documento</h2>
        <p>Escolha um arquivo para guardar na sua área.</p>
      </div>
      <form className="upload-form" onSubmit={handleSubmit}>
        <label className="file-label" htmlFor="document-file">Arquivo</label>
        <input ref={inputRef} id="document-file" type="file" required disabled={uploading} onChange={(event) => { setFile(event.target.files[0] || null); setError(''); setMessage(''); }} />
        <button type="submit" className="button button-accent" disabled={!file || uploading}>{uploading ? 'Enviando...' : 'Enviar documento'}</button>
        {error && <p className="feedback error" role="alert">{error}</p>}
        {message && <p className="feedback success" role="status">{message}</p>}
      </form>
    </section>
  );
}