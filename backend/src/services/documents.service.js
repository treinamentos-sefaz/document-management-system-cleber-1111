function toPublicDocument(document) {
  return {
    id: document.id,
    originalName: document.originalName,
    size: document.size,
    uploadedAt: document.uploadedAt,
    owner: document.owner
  };
}

function createDocumentsService(documentsRepository) {
  return {
    createDocument(file, owner) {
      const document = documentsRepository.create({
        id: file.filename,
        originalName: file.originalname,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        owner,
        storageName: file.filename,
        mimeType: file.mimetype
      });

      return toPublicDocument(document);
    },

    listDocuments(owner) {
      return documentsRepository
        .findByOwner(owner)
        .map(toPublicDocument);
    },

    getDocumentForDownload(id, owner) {
      const document = documentsRepository.findByIdAndOwner(id, owner);
      if (!document) {
        return null;
      }

      return {
        document: toPublicDocument(document),
        filePath: documentsRepository.getFilePath(document)
      };
    }
  };
}

module.exports = { createDocumentsService };