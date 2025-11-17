// backend/routes/whatsapp.routes.js
import { Router } from 'express';
import { enviarMensaje } from '../controllers/whatsapp.controller.js';

const router = Router();

router.post('/', enviarMensaje);

export default router;
