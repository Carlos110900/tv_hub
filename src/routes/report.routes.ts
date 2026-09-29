import { Router } from 'express';
import { createReport, deleteReport, listReports, updateReport } from '../controllers/report.controller.js';
import { authenticate } from '../middleware/authenticate.middleware.js';
import { upload } from '../middleware/upload.js';

export const reportRouter = Router();

reportRouter.get('/', authenticate, listReports);
// TODO v4.5 1:
// Completa el método de Multer utilizado para recibir una sola evidencia.
// Objetivo: procesar la imagen antes de ejecutar createReport.
// Resultado esperado: el Controller podrá acceder al archivo mediante request.file.
reportRouter.post(
  '/',
  authenticate,
  // TODO v4.5 7:
  // Recibe hasta cinco imágenes de evidencia en una misma petición.
  // Objetivo: permitir múltiples archivos con el mismo campo.
  // Resultado esperado: createReport recibirá request.files.
  upload.array('evidence', 5),
  createReport
);

// TODO v4.5 11:
// Agrega una ruta autenticada para actualizar un Report propio.
// Objetivo: modificar reason, description y status.
// Resultado esperado: PATCH devolverá el Report actualizado.
reportRouter.patch('/:id', authenticate, updateReport);

// TODO v4.5 14:
// Agrega una ruta autenticada para eliminar un Report propio.
// Objetivo: quitar el documento y sus evidencias locales.
// Resultado esperado: DELETE responderá correctamente al terminar.
reportRouter.delete('/:id', authenticate, deleteReport);
