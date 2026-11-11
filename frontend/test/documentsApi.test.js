import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { downloadDocument, listDocuments, uploadDocument } from '../src/services/documentsApi.js';

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

test('lista documentos com o identificador do usuário', async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/api/documents');
    assert.equal(options.headers['X-User-Id'], 'usuario');
    return Response.json({ documents: [{ id: '1' }] });
  };
  assert.deepEqual(await listDocuments('usuario'), [{ id: '1' }]);
});

test('envia arquivo usando multipart', async () => {
  const file = new File(['conteudo'], 'teste.txt');
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/api/upload');
    assert.equal(options.method, 'POST');
    assert.equal(options.headers['X-User-Id'], 'usuario');
    assert.equal(options.body.get('file'), file);
    return Response.json({ id: '1' }, { status: 201 });
  };
  assert.deepEqual(await uploadDocument('usuario', file), { id: '1' });
});

test('baixa conteúdo binário e codifica o identificador', async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/api/documents/a%2Fb/download');
    assert.equal(options.headers['X-User-Id'], 'usuario');
    return new Response('conteudo');
  };
  assert.equal(await (await downloadDocument('usuario', 'a/b')).text(), 'conteudo');
});

test('apresenta a mensagem de erro da API', async () => {
  globalThis.fetch = async () => Response.json({ error: { message: 'Arquivo inválido.' } }, { status: 400 });
  await assert.rejects(listDocuments('usuario'), { message: 'Arquivo inválido.' });
});

test('apresenta uma mensagem para falhas de conexão', async () => {
  globalThis.fetch = async () => { throw new TypeError('Failed to fetch'); };
  await assert.rejects(listDocuments('usuario'), { message: 'Não foi possível conectar ao servidor.' });
});