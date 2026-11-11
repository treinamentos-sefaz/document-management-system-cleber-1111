const express = require('express');
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const multer = require('multer');

function createDocumentsRouter({
  documentsController,
  storageDir,
  maxFileSizeBytes
}) {
  fs.mkdirSync(storageDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, callback) => callback(null, storageDir),
    filename: (req, file, callback) => callback(null, randomUUID())
  });
  const upload = multer({
    storage,
    limits: { fileSize: maxFileSizeBytes }
  });
  const router = express.Router();

  router.post(
    '/upload',
    documentsController.requireOwner,
    upload.single('file'),
    documentsController.upload
  );
  router.get('/documents', documentsController.list);
  router.get('/documents/:id/download', documentsController.download);

  return router;
}

module.exports = { createDocumentsRouter };