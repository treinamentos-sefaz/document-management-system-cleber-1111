import { useState } from 'react';
import { downloadDocument } from '../services/documentsApi';

export default function DownloadButton({ owner, document }) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  async function handleDownload() {
    if (downloading) return;
    setDownloading(true);
    setError('');
    try {
      const blob = await downloadDocument(owner, document.id);
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.originalName;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="download-action">
      <button className="button button-outline" type="button" onClick={handleDownload} disabled={downloading} aria-label={`Baixar ${document.originalName}`}>
        {downloading ? 'Baixando...' : 'Baixar'}
      </button>
      {error && <p className="feedback error" role="alert">{error}</p>}
    </div>
  );
}