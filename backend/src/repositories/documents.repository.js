const path = require('node:path');

function createDocumentsRepository(storageDir) {
  const documents = new Map();

  return {
    create(document) {
      documents.set(document.id, document);
      return document;
    },

    findByOwner(owner) {
      return [...documents.values()]
        .filter((document) => document.owner === owner)
        .sort((first, second) => second.uploadedAt.localeCompare(first.uploadedAt));
    },

    findByIdAndOwner(id, owner) {
      const document = documents.get(id);
      return document?.owner === owner ? document : null;
    },

    getFilePath(document) {
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(document.storageName)) {
        throw new Error('Nome interno de armazenamento inválido.');
      }

      const filePath = path.resolve(storageDir, document.storageName);
      const relativePath = path.relative(storageDir, filePath);
      if (relativePath.startsWith(`..${path.sep}`) || relativePath === '..' || path.isAbsolute(relativePath)) {
        throw new Error('Caminho de armazenamento fora do diretório permitido.');
      }

      return filePath;
    }
  };
}

module.exports = { createDocumentsRepository };