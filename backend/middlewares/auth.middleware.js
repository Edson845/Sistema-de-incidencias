import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import pool from '../db.js';

dotenv.config();
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

// Middleware para verificar si el usuario es admin
export async function esAdmin(req, res, next) {
  try {
    const dni = req.user?.dni;
    if (!dni) return res.status(400).json({ mensaje: 'DNI no encontrado en el token' });

    const conn = await pool.getConnection();

    // Consulta para unir las tres tablas y obtener el rol
    const query = `
      SELECT r.nombreRol
      FROM usuario u
      JOIN rolusuario ru ON u.dni = ? AND u.dni = u.dni
      JOIN roles r ON ru.idrol = r.idrol
      WHERE u.dni = ?
    `;
    
    const rows = await conn.query(query, [dni, dni]);
    conn.release();

    if (rows.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario o rol no encontrado' });
    }

    // Verificamos si entre los roles está admin
    const esAdmin = rows.some(row => row.nombreRol.toLowerCase() === 'admin');
    if (!esAdmin) {
      return res.status(403).json({ mensaje: 'Acceso denegado: se requiere rol de administrador' });
    }

    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
}