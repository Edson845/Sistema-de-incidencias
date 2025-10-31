import pool from '../db.js';
import bcrypt from 'bcrypt';

export async function getUsuario(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT dni, usuario, celular, nombres, apellidos, correo, idCargo 
       FROM usuario 
       WHERE dni = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ mensaje: 'Error al obtener usuario' });
  }
}

export async function getUsuarios(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT dni, usuario, nombres, apellidos, correo, idCargo 
       FROM usuario`
    );

    // Siempre devolver un array (no null)
    res.status(200).json(rows || []);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ mensaje: 'Error al obtener usuarios' });
  }
}

export async function crearUsuario(req, res) {
  const { dni, usuario, password, nombres, apellidos, correo, idCargo } = req.body;

  if (!dni || !usuario || !password || !nombres || !apellidos || !correo) {
    return res.status(400).json({ mensaje: 'Faltan datos obligatorios' });
  }

  try {
    // Verificar si el usuario ya existe
    const [existe] = await pool.query('SELECT dni FROM usuario WHERE dni = ?', [dni]);
    if (existe.length > 0) {
      return res.status(409).json({ mensaje: 'El usuario ya existe' });
    }

    const hashedPass = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO usuario (dni, usuario, password, nombres, apellidos, correo, idCargo)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [dni, usuario, hashedPass, nombres, apellidos, correo, idCargo || null]
    );

    res.status(201).json({ mensaje: 'Usuario creado exitosamente' });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ mensaje: 'Error al crear usuario' });
  }
}

export async function actualizarUsuario(req, res) {
  const { id } = req.params; // antes usabas req.params.dni
  const { nombres, apellidos, correo, idCargo, password } = req.body;

  try {
    // Verificar si el usuario existe
    const [rows] = await pool.query('SELECT dni FROM usuario WHERE dni = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    let query = `UPDATE usuario SET `;
    const valores = [];
    const campos = [];

    if (nombres) { campos.push('nombres = ?'); valores.push(nombres); }
    if (apellidos) { campos.push('apellidos = ?'); valores.push(apellidos); }
    if (correo) { campos.push('correo = ?'); valores.push(correo); }
    if (idCargo) { campos.push('idCargo = ?'); valores.push(idCargo); }

    // Si se envía un nuevo password, lo encripta
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      campos.push('password = ?');
      valores.push(hashed);
    }

    // Si no hay campos para actualizar
    if (campos.length === 0) {
      return res.status(400).json({ mensaje: 'No hay campos para actualizar' });
    }

    query += campos.join(', ') + ' WHERE dni = ?';
    valores.push(id);

    await pool.query(query, valores);

    res.status(200).json({ mensaje: 'Usuario actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ mensaje: 'Error al actualizar usuario' });
  }
}