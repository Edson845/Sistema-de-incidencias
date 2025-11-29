import express from 'express';
import { verificarToken } from '../middlewares/auth.middleware.js'; 
import { obtenerCargos, obtenerOficinas, obtenerDepartamentos, obtenerGerencias } from '../controllers/catalogos.controller.js';

const router = express.Router();

router.get('/cargos', verificarToken,obtenerCargos);
router.get('/oficinas', verificarToken,obtenerOficinas);
router.get('/departamentos', verificarToken,obtenerDepartamentos);
router.get('/gerencias', verificarToken,obtenerGerencias);
export default router;