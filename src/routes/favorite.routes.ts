import { Router } from 'express';
import { addFavorite, listFavorites, removeFavorite } from '../controllers/favorite.controller.js';
import { authenticate } from '../middleware/authenticate.middleware.js';

export const favoriteRouter = Router();

favoriteRouter.get('/', authenticate, listFavorites);
// TODO 1, CODIFICACION EN VIVO
// Conecte la ruta que crea un favorito.
// Pista: ¿qué método HTTP se usa normalmente para crear un recurso?
favoriteRouter.____('/:channelId', authenticate, addFavorite);
favoriteRouter.delete('/:channelId', authenticate, removeFavorite);
