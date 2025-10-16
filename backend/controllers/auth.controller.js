import pool from '../db.js';
import { firmarToken } from '../utils/jwt.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

export async function login(req, res) {
  const { correo, password } = req.body;

  try {
    console.log('JWT_SECRET:', process.env.JWT_SECRET);

    const [rows] = await pool.query('SELECT * FROM usuario WHERE correo = ?', [correo]);
    if (rows.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const usuario = rows[0];
    const esValido = await bcrypt.compare(password, usuario.password);
    if (!esValido) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    const token = firmarToken(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET,
      '8h'
    );

    res.json({ token, rol: usuario.rol });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: error.message });
  }
}
