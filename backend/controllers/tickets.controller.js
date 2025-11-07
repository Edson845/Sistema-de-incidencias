import pool from '../db.js';
import { getIO } from '../socket.js';
import { obtenerPrioridad } from '../services/nlp.service.js';

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
      return res.status(400).json({
        mensaje: 'Todos los campos obligatorios deben completarse'
      });
    }

    // ✅ PRIORIDAD POR NLP
    let idPrioridad = 3;

    try {
      idPrioridad = await obtenerPrioridad(descripcion); // ✅ AQUÍ FALTABA el await
      console.log("🎯 Prioridad NLP:", idPrioridad);
    } catch (err) {
      console.error("⚠️ Error al predecir prioridad:", err.message);
    }

    // ✅ ARCHIVOS ADJUNTOS
    const archivos = req.files && req.files.length > 0
      ? req.files.map((file) => file.filename)
      : [];

    const adjunto = archivos.length > 0 ? archivos.join(',') : null;

    // ✅ INSERT EN LA BD
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

      [
        titulo,
        descripcion,
        usuarioCrea,
        idCategoria,
        1,          // estado inicial
        idPrioridad,  // prioridad del NLP
        adjunto
      ]
    );

    // ✅ Construir el objeto del ticket para sockets
    const ticketEmitido = {
      idTicket: result.insertId,
      titulo,
      descripcion,
      usuarioCrea,
      idPrioridad,
      adjunto
    };

    // ✅ Emitir al socket SIN ERROR
    const io = getIO();
    io.emit('nuevo-ticket', ticketEmitido);

    res.json({
      mensaje: '✅ Ticket creado correctamente',
      idTicket: result.insertId,
      idPrioridad,
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

    const io = getIO();
    io.emit('ticket-actualizado', {
      idTicket: id,
      estado
    });

    res.json({ mensaje: 'Ticket actualizado' });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
}


// Nuevos endpoints para estadísticas
export async function getTicketsPorEstado(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT idEstado as estado, COUNT(*) as cantidad
      FROM ticket
      GROUP BY idEstado
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener tickets por estado:', error);
    res.status(500).json({ mensaje: error.message });
  }
}

export async function getTicketsPorMes(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        DATE_FORMAT(fechaCreacion, '%Y-%m') as mes,
        COUNT(*) as cantidad
      FROM ticket
      WHERE fechaCreacion >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(fechaCreacion, '%Y-%m')
      ORDER BY mes ASC
    `);

    const resultado = rows.reduce((acc, row) => {
      const fecha = new Date(row.mes + '-01');
      const nombreMes = fecha.toLocaleString('es-ES', { month: 'long' });
      acc[nombreMes] = row.cantidad;
      return acc;
    }, {});

    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener tickets por mes:', error);
    res.status(500).json({ mensaje: error.message });
  }
}

export async function getEstadisticasGenerales(req, res) {
  try {
    // 1. Obtener todos los tickets
    const [tickets] = await pool.query('SELECT idEstado, fechaCreacion FROM ticket');
    
    console.log('Tickets obtenidos:', tickets); // Debug
    
    // 2. Procesar estadísticas
    const estadoConteo = {
      0: 0, // Cerrados
      1: 0, // Nuevos
      2: 0  // En Proceso
    };
    
    const mesConteo = {};
    let resueltosHoy = 0;
    const hoy = new Date().toISOString().split('T')[0];
    
    tickets.forEach(ticket => {
      // Contar por estado
      const estado = ticket.idEstado;
      estadoConteo[estado] = (estadoConteo[estado] || 0) + 1;
      
      // Contar por mes
      if (ticket.fechaCreacion) {
        const fecha = new Date(ticket.fechaCreacion);
        const nombreMes = fecha.toLocaleString('es-ES', { month: 'long' });
        mesConteo[nombreMes] = (mesConteo[nombreMes] || 0) + 1;
      }
      
      // Contar resueltos hoy
      if (estado === 0 && ticket.fechaCreacion?.split('T')[0] === hoy) {
        resueltosHoy++;
      }
    });

    // 3. Formatear resultados
    const porEstado = [
      { estado: 1, cantidad: estadoConteo[1] || 0 }, // Nuevos
      { estado: 2, cantidad: estadoConteo[2] || 0 }, // En Proceso
      { estado: 0, cantidad: estadoConteo[0] || 0 }  // Cerrados
    ];

    console.log('Estadísticas procesadas:', { porEstado, ticketsPorMes: mesConteo, resueltosHoy }); // Debug

    res.json({
      porEstado,
      ticketsPorMes: mesConteo,
      resueltosHoy
    });
  } catch (error) {
    console.error('Error al obtener estadísticas generales:', error);
    res.status(500).json({ mensaje: error.message });
  }
}
