import pool from '../db.js';
import { getIO } from '../socket.js';
import { obtenerPrioridad } from '../services/nlp.service.js';
export const obtenerTicketsDetallado = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        t.idTicket,
        t.tituloTicket,
        t.descTicket,
        DATE(t.fechaCreacion) AS fechaCreacion,

        c.nombreCategoria,
        p.nombrePrioridad,
        e.nombreEstado,

        u.nombres AS nombreUsuario,
        u.apellidos AS apellidoUsuario,

        o.nombreOficina
      FROM ticket t
      LEFT JOIN categoria c ON t.idCategoria = c.idCategoria
      LEFT JOIN prioridad p ON t.idPrioridad = p.idPrioridad
      LEFT JOIN estado e ON t.idEstado = e.idEstado
      LEFT JOIN usuario u ON t.usuarioCrea = u.dni
      LEFT JOIN oficina o ON u.idOficina = o.idOficina
    `);

    res.json(rows);

  } catch (error) {
    console.error("Error al obtener tickets detallado:", error);
    res.status(500).json({ message: "Error en el servidor", error });
  }
};



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

    // JOIN común para todos
    const camposSelect = `
      SELECT 
        t.*,

        -- Usuario que creó el ticket
        u.nombres AS nombreUsuario,
        u.apellidos AS apellidoUsuario,

        -- Técnico asignado
        ut.nombres AS nombreTecnico,
        ut.apellidos AS apellidoTecnico,

        -- Categoría
        c.nombreCategoria,

        -- Prioridad
        p.nombrePrioridad
      FROM ticket t
      LEFT JOIN usuario u ON t.usuarioCrea = u.dni
      LEFT JOIN usuario ut ON t.asignadoA = ut.dni
      LEFT JOIN categoria c ON t.idCategoria = c.idCategoria
      LEFT JOIN prioridad p ON t.idPrioridad = p.idPrioridad
    `;

    if (rol === 'admin') {
      query = camposSelect;
    }

    else if (rol === 'tecnico') {
      query = `
        ${camposSelect}
        WHERE t.usuarioCrea = ? OR t.asignadoA = ?
      `;
      params = [idUsuario, idUsuario];
    }

    else {
      query = `
        ${camposSelect}
        WHERE t.usuarioCrea = ?
      `;
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
    
    // 2. Procesar estadísticas
    const estadoConteo = { 0: 0, 1: 0, 2: 0 };
    const diaConteo = {};
    let resueltosHoy = 0;
    const hoy = new Date().toISOString().split('T')[0];
    
    tickets.forEach(ticket => {
      // Contar por estado
      const estado = ticket.idEstado;
      estadoConteo[estado] = (estadoConteo[estado] || 0) + 1;
    
      // Contar por día
      if (ticket.fechaCreacion) {
        const fechaStr = typeof ticket.fechaCreacion === 'string'
          ? ticket.fechaCreacion
          : ticket.fechaCreacion.toISOString
            ? ticket.fechaCreacion.toISOString()
            : String(ticket.fechaCreacion);
        const fechaDia = fechaStr.split('T')[0];
        diaConteo[fechaDia] = (diaConteo[fechaDia] || 0) + 1;
    
        // Contar resueltos hoy
        if (estado === 0 && fechaDia === hoy) {
          resueltosHoy++;
        }
      }
    });

    // 3. Formatear resultados
    const porEstado = [
      { estado: 1, cantidad: estadoConteo[1] || 0 },
      { estado: 2, cantidad: estadoConteo[2] || 0 },
      { estado: 0, cantidad: estadoConteo[0] || 0 }
    ];

    res.json({
      porEstado,
      ticketsPorDia: diaConteo,
      resueltosHoy
    });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
}
export async function getTecnicos(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT 
    u.dni AS dni,
    u.nombres AS nombres,
    u.apellidos AS apellidos,
    u.usuario AS usuario
    FROM usuario u
    INNER JOIN rolusuario ru ON ru.dni = u.dni
    INNER JOIN rol r ON r.idRol = ru.idRol
    WHERE r.nombreRol = 'tecnico'
    `);

    res.json(rows);
  } catch (error) {
    console.error('❌ Error al obtener técnicos:', error);
    res.status(500).json({ mensaje: error.message });
  }
}
export async function asignarTicketConHerramientas(req, res) {
  try {
    const { id } = req.params;
    const { asignadoA, herramientas } = req.body;

    // Guardar asignación del técnico
    await pool.query(
      `UPDATE ticket SET asignadoA = ?, idEstado = 2 WHERE idTicket = ?`,
      [asignadoA, id]
    );

    // Guardar herramientas (si hay)
    if (herramientas && herramientas.length > 0) {
      for (const herramienta of herramientas) {
        await pool.query(
          `INSERT INTO ticket_herramienta (idTicket, herramienta) VALUES (?, ?)`,
          [id, herramienta]
        );
      }
    }

    res.json({ mensaje: 'Asignación realizada correctamente' });

  } catch (err) {
    console.error("Error en asignarTicketConHerramientas:", err);
    res.status(500).json({ mensaje: 'Error al asignar ticket' });
  }
}
export async function getTicketPorId(req, res) {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `
      SELECT 
        t.*,
        u.nombres AS nombreUsuario,
        u.apellidos AS apellidoUsuario,
        ut.nombres AS nombreTecnico,
        ut.apellidos AS apellidoTecnico,
        c.nombreCategoria,
        p.nombrePrioridad
      FROM ticket t
      LEFT JOIN usuario u ON t.usuarioCrea = u.dni
      LEFT JOIN usuario ut ON t.asignadoA = ut.dni
      LEFT JOIN categoria c ON t.idCategoria = c.idCategoria
      LEFT JOIN prioridad p ON t.idPrioridad = p.idPrioridad
      WHERE t.idTicket = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ mensaje: 'Ticket no encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('❌ Error en getTicketPorId:', error);
    res.status(500).json({ mensaje: 'Error al obtener el ticket', error: error.message });
  }
}

