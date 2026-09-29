import { model, Schema } from 'mongoose';

export const reportReasons = [
  'STREAM_DOES_NOT_LOAD',
  'WRONG_CHANNEL',
  'AUDIO_PROBLEM',
  'VIDEO_PROBLEM',
  'OTHER'
] as const;

export const reportStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED'] as const;

const reportSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    channelId: { type: Schema.Types.ObjectId, ref: 'Channel', required: true },
    reason: { type: String, enum: reportReasons, required: true },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    // TODO v4.5 8:
    // Guarda las URL de todas las evidencias del Report.
    // Objetivo: permitir más de una imagen por reporte.
    // Resultado esperado: evidenceUrls será un arreglo de rutas públicas.
    evidenceUrls: { type: [String], default: [] },
    status: { type: String, enum: reportStatuses, required: true, default: 'OPEN' }
  },
  { timestamps: true }
);

export const Report = model('Report', reportSchema);
