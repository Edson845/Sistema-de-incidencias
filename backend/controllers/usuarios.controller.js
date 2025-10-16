import pool from '../db.js';
import bcrypt from 'bcrypt';

export async function getUsuario(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT dni, usuario, celular, nombres, apellidos, correo FROM usuario WHERE dni = ?',
      [req.params.id]
    );
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
}

export async function getUsuarios(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT dni, nombres, apellidos, correo, idCargo FROM usuario'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
}

export async function crearUsuario(req, res) {
  const { dni, usuario, password, nombres, apellidos, correo, idCargo } = req.body;
  try {
    const hashedPass = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO usuario (dni, usuario, password, nombres, apellidos, correo, idCargo) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [dni, usuario, hashedPass, nombres, apellidos, correo, idCargo]
    );
    res.json({ mensaje: 'Usuario creado' });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
}

export async function actualizarUsuario(req, res) {
  const { dni } = req.params;
  const { nombre, email, rol } = req.body;
  try {
    await pool.query(
      'UPDATE usuario SET nombres = ?, correo = ?, rol = ? WHERE dni = ?',
      [nombre, email, rol, dni]
    );
    res.json({ mensaje: 'Usuario actualizado' });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
}
