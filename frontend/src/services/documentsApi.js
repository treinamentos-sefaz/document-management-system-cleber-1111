async function request(path, owner, options = {}) {
  let response;
  try {
    response = await fetch(`/api${path}`, {
      ...options,
      headers: { ...options.headers, 'X-User-Id': owner }
    });
  } catch {
    throw new Error('Não foi possível conectar ao servidor.');
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error?.message || 'Não foi possível concluir a operação.');
  }

  return response;
}

export async function listDocuments(owner) {
  const response = await request('/documents', owner);
  return (await response.json()).documents;
}

export async function uploadDocument(owner, file) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await request('/upload', owner, {
    method: 'POST',
    body: formData
  });
  return response.json();
}

export async function downloadDocument(owner, id) {
  const response = await request(`/documents/${encodeURIComponent(id)}/download`, owner);
  return response.blob();
}