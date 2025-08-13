const pool = require('../db/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function login(req, res) {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    const usuario = rows[0];
    const esValido = await bcrypt.compare(password, usuario.password);
    if (!esValido) return res.status(401).json({ mensaje: 'Credenciales inválidas' });

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, rol: usuario.rol });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
}

module.exports = { login };
