import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import pool from '../db.js';

dotenv.config();

// Middleware para verificar token
export async function verificarToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(403).json({ mensaje: 'Token requerido' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // req.user debe traer al menos el DNI
    next();
  } catch (err) {
    return res.status(401).json({ mensaje: 'Token inválido o expirado' });
  }
}

// Middleware genérico para verificar roles
export function verificarRol(rolesPermitidos) {
  return async (req, res, next) => {
    try {
      const dni = req.user?.dni;
      if (!dni) return res.status(400).json({ mensaje: 'DNI no encontrado en el token' });

      const conn = await pool.getConnection();
      const query = `
        SELECT r.nombreRol
        FROM usuario u
        JOIN rolusuario ru ON u.dni = ru.dni
        JOIN rol r ON ru.idrol = r.idrol
        WHERE u.dni = ?
      `;
      const [rows] = await conn.query(query, [dni]);
      conn.release();
      const rolesArray = Array.isArray(rolesPermitidos) ? rolesPermitidos : [rolesPermitidos];
      if (!rows || rows.length === 0) {
        return res.status(404).json({ mensaje: 'Usuario o rol no encontrado' });
      }

      const tieneRol = rows.some(
        row => row.nombreRol && rolesArray.some(rol => row.nombreRol.trim().toLowerCase() === rol.toLowerCase())
      );

      if (!tieneRol) {
        return res.status(403).json({ mensaje: `Acceso denegado: se requiere uno de los [${rolesArray.join(', ')}]` });
      }

      next(); // usuario tiene el rol correcto
    } catch (err) {
      console.error('Error en verificarRol:', err);
      return res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
     
  };
  
}
