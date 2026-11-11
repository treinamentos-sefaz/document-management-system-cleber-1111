function createDocumentsController(documentsService) {
  return {
    requireOwner(req, res, next) {
      const owner = req.get('X-User-Id')?.trim();
      if (!owner) {
        return res.status(400).json({
          error: {
            code: 'USER_ID_REQUIRED',
            message: 'Informe o usuário no cabeçalho X-User-Id.'
          }
        });
      }

      if (owner.length > 128) {
        return res.status(400).json({
          error: {
            code: 'INVALID_USER_ID',
            message: 'O identificador do usuário excede o tamanho permitido.'
          }
        });
      }

      req.owner = owner;
      return next();
    },

    upload(req, res, next) {
      if (!req.file) {
        return res.status(400).json({
          error: {
            code: 'FILE_REQUIRED',
            message: 'Envie um arquivo para continuar.'
          }
        });
      }

      try {
        const document = documentsService.createDocument(req.file, req.owner);
        return res.status(201).json(document);
      } catch (error) {
        return next(error);
      }
    },

    list(req, res) {
      return res.json({
        documents: documentsService.listDocuments(req.owner)
      });
    },

    download(req, res, next) {
      const download = documentsService.getDocumentForDownload(
        req.params.id,
        req.owner
      );
      if (!download) {
        return res.status(404).json({
          error: {
            code: 'DOCUMENT_NOT_FOUND',
            message: 'Documento não encontrado.'
          }
        });
      }

      return res.download(
        download.filePath,
        download.document.originalName,
        (error) => {
          if (error) {
            next(error);
          }
        }
      );
    }
  };
}

module.exports = { createDocumentsController };