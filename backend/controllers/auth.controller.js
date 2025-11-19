import pool from '../db.js';
import { firmarToken } from '../utils/jwt.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

export async function login(req, res) {
  const { identificador, password } = req.body;

  try {
    console.log('JWT_SECRET:', process.env.JWT_SECRET);

    // Buscar por correo o usuario (que también es su usuario)
    const [rows] = await pool.query(
      `SELECT * FROM usuario 
       WHERE correo = ? 
          OR usuario = ?`,
      [identificador, identificador]
    );

    if (rows.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const usuario = rows[0];

    // Validar contraseña
    const esValido = await bcrypt.compare(password, usuario.password);
    if (!esValido) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    // Obtener roles del usuario
    const [rolesRows] = await pool.query(`
      SELECT r.nombreRol
      FROM rolusuario ru
      JOIN rol r ON ru.idrol = r.idrol
      WHERE ru.dni = ?
    `, [usuario.dni]);

    const roles = rolesRows.map(r => r.nombreRol);

    // Generar token
    const token = firmarToken(
      { 
        dni: usuario.dni,
        nombre: usuario.nombres || usuario.apellidos || 'Usuario',
        correo: usuario.correo,
        rol: roles,
        roles
      },
      process.env.JWT_SECRET,
      '8h'
    );

    res.json({ token, roles });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: error.message });
  }
}
