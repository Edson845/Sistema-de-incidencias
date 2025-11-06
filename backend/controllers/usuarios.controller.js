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
  try {
    console.log('Datos recibidos:', req.body);
    const { dni, usuario, password, nombres, celular, apellidos, correo, idRol } = req.body;

    // Validación de datos obligatorios
    if (!dni || !usuario || !password || !nombres || !apellidos || !correo || !idRol) {
      console.log('Faltan datos obligatorios:', { dni, usuario, nombres, apellidos, correo, idRol });
      return res.status(400).json({ 
        mensaje: 'Faltan datos obligatorios',
        camposFaltantes: {
          dni: !dni,
          usuario: !usuario,
          password: !password,
          nombres: !nombres,
          apellidos: !apellidos,
          correo: !correo,
          idRol: !idRol
        }
      });
    }

    // Verificar si el usuario ya existe
    const [existe] = await pool.query('SELECT dni FROM usuario WHERE dni = ?', [dni]);
    if (existe.length > 0) {
      console.log('Usuario ya existe:', dni);
      return res.status(409).json({ mensaje: 'El usuario ya existe' });
    }

    // Verificar si el rol existe
    const [rolExiste] = await pool.query('SELECT idrol FROM rol WHERE idrol = ?', [idRol]);
    if (rolExiste.length === 0) {
      return res.status(400).json({ 
        mensaje: 'El rol seleccionado no existe',
        detalles: `No se encontró el rol con ID ${idRol}`
      });
    }

    // Hashear contraseña
    const hashedPass = await bcrypt.hash(password, 10);
    console.log('Password hasheado correctamente');

    // Iniciar transacción
    await pool.query('START TRANSACTION');

    try {
      // Insertar usuario
      await pool.query(
        `INSERT INTO usuario (dni, usuario, password, celular, nombres, apellidos, correo)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [dni, usuario, hashedPass, celular || null, nombres, apellidos, correo]
      );

      // Insertar rol de usuario
      await pool.query(
        'INSERT INTO rolusuario (dni, idrol) VALUES (?, ?)',
        [dni, idRol]
      );

      // Confirmar transacción
      await pool.query('COMMIT');
      console.log('Usuario creado y rol asignado correctamente');
      
      res.status(201).json({ mensaje: 'Usuario creado exitosamente' });
    } catch (err) {
      // Revertir cambios si algo falla
      await pool.query('ROLLBACK');
      throw err;
    }
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ 
      mensaje: 'Error al crear usuario',
      detalles: error.message,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState
    });
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

export async function obtenerRoles(req, res) {
  try {
    const [rows] = await pool.query(`SELECT idrol, nombreRol FROM rol ORDER BY idrol`);
    res.status(200).json(rows || []);
  } catch (error) {
    console.error('Error al obtener roles:', error);
    res.status(500).json({ mensaje: 'Error al obtener roles' });
  }
}

export async function eliminarUsuario(req, res) {
  const { id } = req.params;

  try {
    // Iniciamos una transacción para asegurar la consistencia
    await pool.query('START TRANSACTION');

    try {
      // Primero eliminamos las referencias en la tabla rolusuario
      await pool.query('DELETE FROM rolusuario WHERE dni = ?', [id]);
      
      // Luego eliminamos el usuario
      const [result] = await pool.query('DELETE FROM usuario WHERE dni = ?', [id]);
      
      if (result.affectedRows === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({ mensaje: 'Usuario no encontrado' });
      }

      // Si todo sale bien, confirmamos los cambios
      await pool.query('COMMIT');
      res.status(200).json({ mensaje: 'Usuario eliminado correctamente' });
    } catch (err) {
      // Si hay algún error, revertimos los cambios
      await pool.query('ROLLBACK');
      throw err;
    }
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ mensaje: 'Error al eliminar usuario' });
  }
}
