import { Router } from 'express';
import { listChannels } from '../controllers/channel.controller.js';

export const channelRouter = Router();

channelRouter.get('/', listChannels);
