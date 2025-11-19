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
    //const { dni, usuario, password, nombres, celular, apellidos, correo, idRol,idCargo,idOficina,idDepartamento,idGerencia } = req.body;
    
    let { dni, usuario, password, nombres, celular, apellidos, correo, idRol, idCargo, idOficina, idDepartamento, idGerencia } = req.body;

    // ================================
    //   COMODINES
    // ================================
    const DEPARTAMENTO_VACIO = 45;
    const OFICINA_VACIA = 48;

    // ================================
    //   REGLA 1: Solo GERENCIA
    // ================================
    if (idGerencia && !idDepartamento && !idOficina) {
      idDepartamento = DEPARTAMENTO_VACIO;
      idOficina = OFICINA_VACIA;
      console.log("Solo gerencia recibido → asignando comodines.");
    }

    // ================================
    //   REGLA 2: Solo DEPARTAMENTO
    // ================================
    if (idDepartamento && !idOficina) {
      const [dep] = await pool.query(
        "SELECT idGerencia FROM departamento WHERE idDepartamento = ?",
        [idDepartamento]
      );

      if (dep.length > 0) {
        idGerencia = dep[0].idGerencia;
      }

      idOficina = OFICINA_VACIA;

      console.log("Solo departamento recibido → asignando gerencia y oficina vacía.");
    }

    // ================================
    //   REGLA 3: Solo OFICINA
    // ================================
    if (idOficina) {
      const [ofi] = await pool.query(
        `SELECT o.idDepartamento, d.idGerencia
         FROM oficina o
         INNER JOIN departamento d ON d.idDepartamento = o.idDepartamento
         WHERE o.idOficina = ?`,
        [idOficina]
      );

      if (ofi.length > 0) {
        idDepartamento = ofi[0].idDepartamento;
        idGerencia = ofi[0].idGerencia;
      }

      console.log("Solo oficina recibido → asignando departamento y gerencia.");
    }
    
    // Validación de datos obligatorios
    if (!dni || !usuario || !password || !nombres || !apellidos || !correo || !idRol || !idCargo || !idOficina || !idDepartamento || !idGerencia) {
      console.log('Faltan datos obligatorios:', { dni, usuario, nombres, apellidos, correo, idRol, idCargo, idOficina, idDepartamento, idGerencia });
      return res.status(400).json({ 
        mensaje: 'Faltan datos obligatorios',
        camposFaltantes: {
          dni: !dni,
          usuario: !usuario,
          password: !password,
          nombres: !nombres,
          apellidos: !apellidos,
          correo: !correo,
          idRol: !idRol,
          idCargo: !idCargo,
          idOficina: !idOficina,
          idDepartamento: !idDepartamento,
          idGerencia: !idGerencia
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
        `INSERT INTO usuario (dni, usuario, password, celular, nombres, apellidos, correo, idCargo, idOficina, idDepartamento, idGerencia)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [dni, usuario, hashedPass, celular || null, nombres, apellidos, correo, idCargo, idOficina, idDepartamento, idGerencia]
      );

      // Insertar rol de usuario
      await pool.query(
        'INSERT INTO rolusuario (dni, idrol) VALUES (?, ?)',
        [dni, idRol]
      );
      const correoRegex = /^[a-zA-Z0-9._%+-]+@munisanroman\.gob\.pe$/;
      const celularRegex = /^[0-9]{9}$/;

      if (!correoRegex.test(correo)) {
        return res.status(400).json({ mensaje: 'Correo inválido, debe terminar en @munisanroman.gob.pe' });
      }

      if (!celularRegex.test(celular)) {
        return res.status(400).json({ mensaje: 'El celular debe tener exactamente 9 dígitos numéricos' });
      }
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
export async function obtenerCargos(req, res) {
  try {
    const [rows] = await pool.query(`SELECT idCargo, nombreCargo FROM cargo ORDER BY idCargo`);
    res.status(200).json(rows || []);
  } catch (error) {
    console.error('Error al obtener cargos:', error);
    res.status(500).json({ mensaje: 'Error al obtener cargos' });
  }
}
export async function obtenerOficinas(req, res) {
  try {
    const [rows] = await pool.query(`SELECT idOficina, nombreOficina FROM oficina ORDER BY idOficina`);
    res.status(200).json(rows || []);
  } catch (error) {
    console.error('Error al obtener oficinas:', error);
    res.status(500).json({ mensaje: 'Error al obtener oficinas' });
  }
}
export async function obtenerDepartamentos(req, res) {
  try {
    const [rows] = await pool.query(`SELECT idDepartamento, nombreDepartamento FROM departamento ORDER BY idDepartamento`);
    res.status(200).json(rows || []);
  } catch (error) {
    console.error('Error al obtener departamentos:', error);
    res.status(500).json({ mensaje: 'Error al obtener departamentos' });
  }
}
export async function obtenerGerencias(req, res) {
  try {
    const [rows] = await pool.query(`SELECT idGerencia, nombreGerencia FROM gerencias ORDER BY idGerencia`);
    res.status(200).json(rows || []);
  } catch (error) {
    console.error('Error al obtener gerencias:', error);
    res.status(500).json({ mensaje: 'Error al obtener gerencias' });
  }
}

export async function eliminarUsuario(req, res) {
  const { id } = req.params;

  try {
    // Iniciamos transacción
    await pool.query('START TRANSACTION');

    try {
      // Verificamos si el usuario existe
      const [usuario] = await pool.query('SELECT * FROM usuario WHERE dni = ?', [id]);
      if (usuario.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({ mensaje: 'Usuario no encontrado' });
      }

      // Reasignamos tickets creados por este usuario al usuario genérico
      await pool.query(
        'UPDATE ticket SET usuarioCrea = ? WHERE usuarioCrea = ?',
        ['00000000', id]
      );

      // Eliminamos relaciones en rolusuario
      await pool.query('DELETE FROM rolusuario WHERE dni = ?', [id]);

      // Eliminamos el usuario original
      await pool.query('DELETE FROM usuario WHERE dni = ?', [id]);

      // Confirmamos transacción
      await pool.query('COMMIT');
      res.status(200).json({ mensaje: 'Usuario eliminado y tickets reasignados correctamente' });
    } catch (err) {
      await pool.query('ROLLBACK');
      throw err;
    }
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ mensaje: 'Error al eliminar usuario' });
  }
}


