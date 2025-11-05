import pool from '../db.js';
import { predecirPrioridad,entrenarConNuevoEjemplo } from '../utils/nlp.js';
export async function getTicketsUsuario(req, res) {
  try {
    const rolesUsuario = req.user?.rol || []; // array de roles
    const idUsuario = String(req.user?.dni || '');

    if (!rolesUsuario.length || !idUsuario) {
      return res.status(401).json({ mensaje: 'Usuario no autenticado o datos incompletos' });
    }

    // Determinar rol principal del usuario
    const rol = rolesUsuario[0].trim().toLowerCase(); // toma el primer rol

    let query = '';
    let params = [];

    if (rol === 'admin') {
      query = 'SELECT * FROM ticket';
    } else if (rol === 'tecnico') {
      query = `
        SELECT * FROM ticket 
        WHERE usuarioCrea = ? OR asignadoA = ?`;
      params = [idUsuario, idUsuario];
    } else {
      query = 'SELECT * FROM ticket WHERE usuarioCrea = ?';
      params = [idUsuario];
    }

    let rows;
    if (params.length > 0) {
      [rows] = await pool.query(query, params);
    } else {
      [rows] = await pool.query(query);
    }

    res.json(rows);
  } catch (error) {
    console.error('❌ Error en getTicketsUsuario:', error);
    res.status(500).json({ mensaje: error.message });
  }
}


export async function getTodosTickets(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM ticket');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
}

export const obtenerCategorias = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT idCategoria, nombreCategoria FROM categoria');
    res.json(rows);
  } catch (error) {
    console.error('❌ Error al obtener categorías:', error);
    res.status(500).json({ mensaje: 'Error al obtener categorías' });
  }
};
export const crearTicket = async (req, res) => {
  try {
    const { titulo, descripcion, idCategoria } = req.body;
    const usuarioCrea = req.user?.dni;

    if (!titulo || !descripcion || !idCategoria) {
      return res.status(400).json({ mensaje: 'Todos los campos obligatorios deben completarse' });
    }

    // 🧠 Predecir prioridad automáticamente
    const prioridad = predecirPrioridad(descripcion);

    // 📁 Archivos adjuntos
    const archivos = req.files && req.files.length > 0
      ? req.files.map((file) => file.filename)
      : [];
    const adjunto = archivos.length > 0 ? archivos.join(',') : null;

    // 💾 Guardar en la base de datos
    const [result] = await pool.query(
      `INSERT INTO ticket (
        tituloTicket,
        descTicket,
        usuarioCrea,
        fechaCreacion,
        idCategoria,
        idEstado,
        idPrioridad,
        adjunto
      ) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?)`,
      [titulo, descripcion, usuarioCrea, idCategoria, 1, prioridad, adjunto]
    );

    res.json({
      mensaje: '✅ Ticket creado correctamente',
      idTicket: result.insertId,
      prioridad,
      archivosGuardados: archivos
    });

  } catch (error) {
    console.error('❌ Error en crearTicket:', error);
    res.status(500).json({
      mensaje: 'Error al crear ticket',
      error: error.message
    });
  }
};

export async function actualizarTicket(req, res) {
  const { id } = req.params;
  const { titulo, descripcion, estado } = req.body;
  try {
    await pool.query(
      'UPDATE ticket SET tituloTicket = ?, descTicket = ?, idEstado = ? WHERE idTicket = ?',
      [titulo, descripcion, estado, id]
    );
    if (descripcion && prioridad) {
      entrenarConNuevoEjemplo(descripcion, prioridad);
    }
    res.json({ mensaje: 'Ticket actualizado' });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
}
