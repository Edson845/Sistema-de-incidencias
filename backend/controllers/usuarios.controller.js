const pool = require('../db.js');
const bcrypt = require('bcrypt');

async function getUsuario(req, res) {
  try {
    const [rows] = await pool.query('SELECT id, nombre, email, rol FROM usuarios WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
}

async function getUsuarios(req, res) {
  try {
    const [rows] = await pool.query('SELECT id, nombre, email, rol FROM usuarios');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
}

async function crearUsuario(req, res) {
  const { dni, email, password, rol } = req.body;
  try {
    const hashedPass = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO usuarios (dni, email, password, rol) VALUES (?, ?, ?, ?)',
      [dni, email, hashedPass, rol]
    );
    res.json({ mensaje: 'Usuario creado' });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
}

async function actualizarUsuario(req, res) {
  const { id } = req.params;
  const { nombre, email, rol } = req.body;
  try {
    await pool.query(
      'UPDATE usuarios SET nombre = ?, email = ?, rol = ? WHERE id = ?',
      [nombre, email, rol, id]
    );
    res.json({ mensaje: 'Usuario actualizado' });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
}

module.exports = { getUsuario, getUsuarios, crearUsuario, actualizarUsuario };
