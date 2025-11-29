import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { obtenerRolesUsuarioService } from '../services/rol.service.js';
dotenv.config();

export async function verificarToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(403).json({ mensaje: 'Token requerido' });
    }

    // Formato esperado: "Bearer <token>"
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(403).json({ mensaje: 'Token no proporcionado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // ejemplo: { dni, correo, rol: ['Admin'], iat, exp }

    next();
  } catch (error) {
    console.error('Error en verificarToken:', error);
    return res.status(401).json({ mensaje: 'Token inválido o expirado' });
  }
}


export function verificarRol(rolesPermitidos = []) {
  return async (req, res, next) => {
    try {
      const dni = req.user?.dni;

      if (!dni) {
        return res.status(400).json({ mensaje: 'DNI no encontrado en el token' });
      }

      // Convertir rolesPermitidos a array si viene como string
      const rolesArray = Array.isArray(rolesPermitidos)
        ? rolesPermitidos
        : [rolesPermitidos];

      // Normalizar roles permitidos
      const rolesPermitidosNormalizados = rolesArray.map(rol =>
        rol.trim().toLowerCase()
      );

      // Obtener roles reales del usuario desde el servicio
      const rolesUsuario = await obtenerRolesUsuarioService(dni);

      if (rolesUsuario.length === 0) {
        return res.status(404).json({ mensaje: 'Usuario sin roles asignados' });
      }

      // Verifica coincidencia
      const autorizado = rolesPermitidosNormalizados.some(rol =>
        rolesUsuario.includes(rol)
      );

      if (!autorizado) {
        return res.status(403).json({
          mensaje: `Acceso denegado. Se requiere uno de los roles: [${rolesPermitidos.join(', ')}]`
        });
      }

      next(); // ✅ Autorizado
    } catch (error) {
      console.error("Error en verificarRol:", error);
      res.status(500).json({ mensaje: "Error interno del servidor" });
    }
  };
}