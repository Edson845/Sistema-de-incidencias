import { obtenerRolesService } from '../services/rol.service.js';

export async function obtenerRoles(req, res) {
  try {
    const roles = await obtenerRolesService();
    res.status(200).json(roles);
  } catch (error) {
    console.error('Error al obtener roles:', error);
    res.status(500).json({ mensaje: 'Error al obtener roles' });
  }
}