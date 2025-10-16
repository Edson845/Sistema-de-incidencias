import express from 'express';
import { login } from '../controllers/auth.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/login', login);

// opcional: endpoint para verificar usuario logueado
router.get('/me', verificarToken, (req, res) => {
  res.json({ id: req.user.id, rol: req.user.rol });
});

export default router;
