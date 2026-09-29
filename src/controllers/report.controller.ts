import { unlink } from 'node:fs/promises';
import path from 'node:path';
import type { RequestHandler } from 'express';
import { isValidObjectId } from 'mongoose';
import { Channel } from '../models/channel.model.js';
import { Report, reportReasons, reportStatuses } from '../models/report.model.js';
import { reportUploadsDirectory } from '../middleware/upload.js';
import { AppError } from '../utils/app-error.js';

function getUserId(request: Parameters<RequestHandler>[0]): string {
  if (!request.auth) throw new AppError(401, 'UNAUTHORIZED', 'Authentication is required');
  return request.auth.userId;
}

function readRequiredText(value: unknown, code: string, message: string): string {
  if (typeof value !== 'string' || !value.trim()) throw new AppError(400, code, message);
  return value.trim();
}

async function removeUploadedEvidence(files: Express.Multer.File[]): Promise<void> {
  await Promise.all(files.map((file) => unlink(file.path).catch(() => undefined)));
}

async function removeEvidenceUrls(evidenceUrls: string[]): Promise<void> {
  await Promise.all(evidenceUrls.map((evidenceUrl) => {
    const filePath = path.join(reportUploadsDirectory, path.basename(evidenceUrl));
    return unlink(filePath).catch(() => undefined);
  }));
}

function getReportId(value: unknown): string {
  if (typeof value !== 'string' || !isValidObjectId(value)) {
    throw new AppError(400, 'INVALID_REPORT_ID', 'Report id is invalid');
  }
  return value;
}

function getReportReason(value: unknown): string {
  const reason = readRequiredText(value, 'INVALID_REPORT_REASON', 'Report reason is invalid');
  if (!reportReasons.includes(reason as (typeof reportReasons)[number])) {
    throw new AppError(400, 'INVALID_REPORT_REASON', 'Report reason is invalid');
  }
  return reason;
}

function getReportStatus(value: unknown): string {
  const status = readRequiredText(value, 'INVALID_REPORT_STATUS', 'Report status is invalid');
  if (!reportStatuses.includes(status as (typeof reportStatuses)[number])) {
    throw new AppError(400, 'INVALID_REPORT_STATUS', 'Report status is invalid');
  }
  return status;
}

export const createReport: RequestHandler = async (request, response) => {
  // TODO v4.5 9:
  // Convierte los archivos recibidos por Multer en rutas públicas.
  // Objetivo: guardar todas las evidencias en el Report.
  // Resultado esperado: evidenceUrls tendrá una ruta por cada archivo.
  const files = Array.isArray(request.files) ? request.files : [];

  try {
    const userId = getUserId(request);
    const channelId = readRequiredText(request.body.channelId, 'INVALID_CHANNEL_ID', 'Channel id is invalid');
    if (!isValidObjectId(channelId)) throw new AppError(400, 'INVALID_CHANNEL_ID', 'Channel id is invalid');

    const reason = getReportReason(request.body.reason);

    const description = readRequiredText(request.body.description, 'INVALID_REPORT_DESCRIPTION', 'Description is required');
    if (description.length > 1000) {
      throw new AppError(400, 'INVALID_REPORT_DESCRIPTION', 'Description must be 1000 characters or fewer');
    }

    const channel = await Channel.findOne({ _id: channelId, isActive: true });
    if (!channel) throw new AppError(404, 'CHANNEL_NOT_FOUND', 'Channel was not found');

    // TODO v4.5 2:
    // Completa la propiedad de Multer que contiene el nombre final del archivo.
    // Objetivo: construir la URL que se almacenará dentro del Report.
    // Resultado esperado: evidenceUrl tendrá una ruta como /uploads/reports/archivo.png.
    const evidenceUrls = files.map((file) => `/uploads/reports/${file.filename}`);

    // TODO v4.5 3:
    // Completa el método del Model utilizado para crear un nuevo Report.
    // Objetivo: persistir los datos del reporte y la referencia de la evidencia.
    // Resultado esperado: MongoDB contendrá un nuevo Report con status OPEN.
    const report = await Report.create({
      userId,
      channelId,
      reason,
      description,
      evidenceUrls
    });

    response.status(201).json({ report });
  } catch (error) {
    await removeUploadedEvidence(files);
    throw error;
  }
};

export const listReports: RequestHandler = async (request, response) => {
  // TODO v4.5 6:
  // Completa el método de Mongoose utilizado para consultar los Reports del usuario.
  // Objetivo: recuperar los reportes existentes del usuario autenticado.
  // Resultado esperado: GET /api/reports devolverá los Reports ordenados por fecha.
  const reports = await Report.find({ userId: getUserId(request) })
    .populate('channelId', 'name')
    .sort('-createdAt');

  response.json({ reports });
};

// TODO v4.5 12:
// Actualiza los campos editables de un Report del usuario autenticado.
// Objetivo: conservar la propiedad del Report durante la modificación.
// Resultado esperado: la respuesta incluirá el Report actualizado.
export const updateReport: RequestHandler = async (request, response) => {
  const reportId = getReportId(request.params.id);
  const reason = getReportReason(request.body.reason);
  const description = readRequiredText(request.body.description, 'INVALID_REPORT_DESCRIPTION', 'Description is required');
  if (description.length > 1000) {
    throw new AppError(400, 'INVALID_REPORT_DESCRIPTION', 'Description must be 1000 characters or fewer');
  }
  const status = getReportStatus(request.body.status);

  const report = await Report.findOneAndUpdate(
    { _id: reportId, userId: getUserId(request) },
    { reason, description, status },
    { new: true, runValidators: true }
  );
  if (!report) throw new AppError(404, 'REPORT_NOT_FOUND', 'Report was not found');

  response.json({ report });
};

// TODO v4.5 15:
// Elimina un Report propio y las evidencias almacenadas localmente.
// Objetivo: mantener sincronizados MongoDB y el sistema de archivos.
// Resultado esperado: el Report y sus archivos dejarán de existir.
export const deleteReport: RequestHandler = async (request, response) => {
  const reportId = getReportId(request.params.id);
  const report = await Report.findOneAndDelete({ _id: reportId, userId: getUserId(request) });
  if (!report) throw new AppError(404, 'REPORT_NOT_FOUND', 'Report was not found');

  await removeEvidenceUrls(report.evidenceUrls);
  response.status(204).send();
};
