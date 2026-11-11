const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const storageDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dms-test-storage-'));
const previousStorageDir = process.env.STORAGE_DIR;
const previousMaxFileSize = process.env.MAX_FILE_SIZE_BYTES;
process.env.STORAGE_DIR = storageDir;
process.env.MAX_FILE_SIZE_BYTES = '16';
const app = require('../src/app');

test('API de documentos', async (t) => {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  t.after(async () => {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    fs.rmSync(storageDir, { recursive: true, force: true });
    if (previousStorageDir === undefined) {
      delete process.env.STORAGE_DIR;
    } else {
      process.env.STORAGE_DIR = previousStorageDir;
    }
    if (previousMaxFileSize === undefined) {
      delete process.env.MAX_FILE_SIZE_BYTES;
    } else {
      process.env.MAX_FILE_SIZE_BYTES = previousMaxFileSize;
    }
  });

  await t.test('exporta o app Express', () => {
    assert.equal(typeof app, 'function');
  });

  await t.test('exige o identificador do usuário antes de receber o arquivo', async () => {
    const response = await fetch(`${baseUrl}/upload`, { method: 'POST' });
    assert.equal(response.status, 400);
    assert.equal((await response.json()).error.code, 'USER_ID_REQUIRED');
  });

  let uploadedDocument;
  await t.test('envia arquivo e registra metadados públicos', async () => {
    const formData = new FormData();
    formData.set('file', new Blob(['conteudo']), 'relatorio.txt');

    const response = await fetch(`${baseUrl}/upload`, {
      method: 'POST',
      headers: { 'X-User-Id': 'usuario-1' },
      body: formData
    });
    uploadedDocument = await response.json();

    assert.equal(response.status, 201);
    assert.deepEqual(Object.keys(uploadedDocument).sort(), [
      'id', 'originalName', 'owner', 'size', 'uploadedAt'
    ]);
    assert.equal(uploadedDocument.originalName, 'relatorio.txt');
    assert.equal(uploadedDocument.owner, 'usuario-1');
    assert.equal(uploadedDocument.size, 8);
    assert.ok(Number.isNaN(Date.parse(uploadedDocument.uploadedAt)) === false);
    assert.equal(fs.readFileSync(path.join(storageDir, uploadedDocument.id), 'utf8'), 'conteudo');
  });

  await t.test('lista somente documentos do usuário e exige cabeçalho', async () => {
    const response = await fetch(`${baseUrl}/documents`, {
      headers: { 'X-User-Id': 'usuario-1' }
    });
    assert.equal(response.status, 200);
    assert.deepEqual((await response.json()).documents, [uploadedDocument]);

    const missingOwnerResponse = await fetch(`${baseUrl}/documents`);
    assert.equal(missingOwnerResponse.status, 400);

    const otherOwnerResponse = await fetch(`${baseUrl}/documents`, {
      headers: { 'X-User-Id': 'usuario-2' }
    });
    assert.deepEqual((await otherOwnerResponse.json()).documents, []);
  });

  await t.test('baixa somente para o proprietário', async () => {
    const downloadResponse = await fetch(
      `${baseUrl}/documents/${uploadedDocument.id}/download`,
      { headers: { 'X-User-Id': 'usuario-1' } }
    );
    assert.equal(downloadResponse.status, 200);
    assert.match(downloadResponse.headers.get('content-disposition'), /relatorio\.txt/);
    assert.equal(await downloadResponse.text(), 'conteudo');

    const forbiddenResponse = await fetch(
      `${baseUrl}/documents/${uploadedDocument.id}/download`,
      { headers: { 'X-User-Id': 'usuario-2' } }
    );
    assert.equal(forbiddenResponse.status, 404);
  });

  await t.test('retorna erros para arquivo ausente e arquivo acima do limite', async () => {
    const missingFileResponse = await fetch(`${baseUrl}/upload`, {
      method: 'POST',
      headers: { 'X-User-Id': 'usuario-1' }
    });
    assert.equal(missingFileResponse.status, 400);
    assert.equal((await missingFileResponse.json()).error.code, 'FILE_REQUIRED');

    const formData = new FormData();
    formData.set('file', new Blob(['este arquivo excede o limite']), 'grande.txt');
    const tooLargeResponse = await fetch(`${baseUrl}/upload`, {
      method: 'POST',
      headers: { 'X-User-Id': 'usuario-1' },
      body: formData
    });
    assert.equal(tooLargeResponse.status, 413);
    assert.equal((await tooLargeResponse.json()).error.code, 'FILE_TOO_LARGE');
  });
});
