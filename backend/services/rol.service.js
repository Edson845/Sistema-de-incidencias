import * as rol from '../models/rol.model.js';
export async function obtenerRolesService() {
  const roles = await rol.obtenerRolesModel();
  return roles || [];
}
export async function obtenerRolesUsuarioService(dni) {
  const roles = await rol.obtenerRolesPorDniModel(dni);

  // Normaliza a minúscula
  return roles.map(r => r.nombreRol.trim().toLowerCase());
}