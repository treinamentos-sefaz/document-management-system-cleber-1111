const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { createDocumentsRepository } = require('../src/repositories/documents.repository');

test('resolve caminho somente para nome interno UUID', () => {
  const storageDir = path.resolve('/tmp/dms-storage-test');
  const repository = createDocumentsRepository(storageDir);
  const storageName = 'ee6d7685-d40f-4f62-b0f7-728baf05d389';

  assert.equal(
    repository.getFilePath({ storageName }),
    path.join(storageDir, storageName)
  );
  assert.throws(
    () => repository.getFilePath({ storageName: '../outside.txt' }),
    /Nome interno de armazenamento inválido/
  );
});
