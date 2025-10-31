import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import pool from '../db.js';

dotenv.config();

/**
 * 🧩 Middleware para verificar el token JWT
 * - Extrae el token del header Authorization.
 * - Lo verifica con JWT_SECRET.
 * - Añade los datos decodificados a req.user.
 */
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

/**
 * 🧠 Middleware para verificar rol
 * - Permite pasar un solo rol o un array de roles.
 * - Verifica si el usuario tiene alguno de los roles requeridos.
 */
export function verificarRol(rolesPermitidos) {
  return async (req, res, next) => {
    try {
      // Verifica que el token haya sido procesado antes
      const dni = req.user?.dni;
      if (!dni) {
        return res.status(400).json({ mensaje: 'DNI no encontrado en el token' });
      }

      // Normaliza el parámetro rolesPermitidos (puede ser string o array)
      const rolesArray = Array.isArray(rolesPermitidos)
        ? rolesPermitidos
        : [rolesPermitidos];

      // 🔍 Consulta los roles del usuario en la BD
      const [rows] = await pool.query(
        `SELECT r.nombreRol
         FROM usuario u
         JOIN rolusuario ru ON u.dni = ru.dni
         JOIN rol r ON ru.idrol = r.idrol
         WHERE u.dni = ?`,
        [dni]
      );

      if (!rows || rows.length === 0) {
        return res.status(404).json({ mensaje: 'Usuario o rol no encontrado' });
      }

      // Normaliza los nombres de roles
      const rolesUsuario = rows.map(r => r.nombreRol.trim().toLowerCase());

      // Comprueba si el usuario tiene alguno de los roles permitidos
      const tieneRol = rolesArray.some(rol =>
        rolesUsuario.includes(rol.trim().toLowerCase())
      );

      if (!tieneRol) {
        return res
          .status(403)
          .json({ mensaje: `Acceso denegado: se requiere uno de los roles [${rolesArray.join(', ')}]` });
      }

      next(); // ✅ Usuario autorizado
    } catch (error) {
      console.error('Error en verificarRol:', error);
      return res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
  };
}
