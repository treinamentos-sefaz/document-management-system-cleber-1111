function createDocumentsController(documentsService) {
  function getOwner(req, res) {
    const owner = req.get('X-User-Id')?.trim();
    if (!owner) {
      res.status(400).json({
        error: {
          code: 'USER_ID_REQUIRED',
          message: 'Informe o usuário no cabeçalho X-User-Id.'
        }
      });
      return null;
    }

    return owner;
  }

  return {
    requireOwner(req, res, next) {
      if (getOwner(req, res)) {
        return next();
      }
    },

    upload(req, res, next) {
      const owner = getOwner(req, res);
      if (!owner) {
        return;
      }
      if (!req.file) {
        return res.status(400).json({
          error: {
            code: 'FILE_REQUIRED',
            message: 'Envie um arquivo para continuar.'
          }
        });
      }

      try {
        const document = documentsService.createDocument(req.file, owner);
        return res.status(201).json(document);
      } catch (error) {
        return next(error);
      }
    },

    list(req, res) {
      const owner = getOwner(req, res);
      if (!owner) {
        return;
      }

      return res.json({
        documents: documentsService.listDocuments(owner)
      });
    },

    download(req, res, next) {
      const owner = getOwner(req, res);
      if (!owner) {
        return;
      }

      const download = documentsService.getDocumentForDownload(
        req.params.id,
        owner
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