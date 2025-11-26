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
    const [rows] = await pool.query('SELECT * FROM ticket ORDER BY fechaCreacion ASC');
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

    // 🔥 PRIORIDAD POR NLP
    let idPrioridad = 3;
    try {
      idPrioridad = await obtenerPrioridad(descripcion);
      console.log("🎯 Prioridad NLP:", idPrioridad);
    } catch (err) {
      console.error("⚠️ Error NLP:", err.message);
    }

    // 🔥 ARCHIVOS
    const archivos = req.files?.length > 0
      ? req.files.map(file => file.filename)
      : [];
    const adjunto = archivos.length > 0 ? archivos.join(',') : null;

    // 🔥 INSERT
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
        idPrioridad,
        adjunto
      ]
    );

    const idInsertado = result.insertId;
    // 🔥 REGISTRAR HISTORIAL inicial
    const [historial] = await pool.query(`
        INSERT INTO historial (
          idTicket,
          dni_usuarioModifica,
          accion,
          estadoAntiguo,
          estadoNuevo,
          tipo
        ) VALUES (?, ?, 'abrir ticket', NULL, 1, 'Estado')
      `, [
      idInsertado, usuarioCrea, 1
    ]);
    // 🔥 Obtener ticket COMPLETO con joins
    const [ticketCompleto] = await pool.query(`
      SELECT 
        t.idTicket,
        t.tituloTicket,
        t.descTicket,
        t.fechaCreacion,
        t.usuarioCrea,
        t.idCategoria,
        c.nombreCategoria,
        t.idEstado,
        e.nombreEstado,
        t.idPrioridad,
        p.nombrePrioridad,
        t.adjunto
      FROM ticket t
      LEFT JOIN categoria c ON t.idCategoria = c.idCategoria
      LEFT JOIN estado e ON t.idEstado = e.idEstado
      LEFT JOIN prioridad p ON t.idPrioridad = p.idPrioridad
      WHERE t.idTicket = ?
    `, [idInsertado]);

    // 🔥 ENVIAR AL SOCKET SIN ERROR
    const io = getIO(); // <--- AQUÍ ES FUNDAMENTAL
    io.emit("nuevo-ticket", ticketCompleto[0]);

    // 🔥 RESPUESTA
    res.json({
      mensaje: "✅ Ticket creado correctamente",
      idTicket: idInsertado,
      idPrioridad,
      archivosGuardados: archivos
    });

  } catch (error) {
    console.error("❌ Error en crearTicket:", error);
    res.status(500).json({
      mensaje: "Error al crear ticket",
      error: error.message
    });
  }
};

export async function actualizarTicket(req, res) {
  const { id } = req.params;
  const { titulo, descripcion, estado } = req.body;

  try {
    // -----------------------------
    // Construir consulta dinámica
    // -----------------------------
    const campos = [];
    const valores = [];

    if (titulo !== undefined) {
      campos.push("tituloTicket = ?");
      valores.push(titulo);
    }

    if (descripcion !== undefined) {
      campos.push("descTicket = ?");
      valores.push(descripcion);
    }

    if (estado !== undefined) {
      campos.push("idEstado = ?");
      valores.push(estado);
    }

    // Si no hay nada que actualizar
    if (campos.length === 0) {
      return res.status(400).json({ mensaje: "No se enviaron campos para actualizar" });
    }

    // Añadir el id al final (para el WHERE)
    valores.push(id);

    const query = `UPDATE ticket SET ${campos.join(", ")} WHERE idTicket = ?`;

    // Ejecutar query
    await pool.query(query, valores);

    // 🔥 OBTENER TICKET COMPLETO ACTUALIZADO con todos los JOINs
    const [ticketActualizado] = await pool.query(`
      SELECT 
        t.*,
        u.nombres AS nombreUsuario,
        u.apellidos AS apellidoUsuario,
        ut.nombres AS nombreTecnico,
        ut.apellidos AS apellidoTecnico,
        c.nombreCategoria,
        p.nombrePrioridad,
        e.nombreEstado
      FROM ticket t
      LEFT JOIN usuario u ON t.usuarioCrea = u.dni
      LEFT JOIN usuario ut ON t.asignadoA = ut.dni
      LEFT JOIN categoria c ON t.idCategoria = c.idCategoria
      LEFT JOIN prioridad p ON t.idPrioridad = p.idPrioridad
      LEFT JOIN estado e ON t.idEstado = e.idEstado
      WHERE t.idTicket = ?
    `, [id]);

    // 🔥 EMITIR EVENTO POR SOCKET SIEMPRE (no solo cuando cambia estado)
    if (ticketActualizado && ticketActualizado.length > 0) {
      const io = getIO();
      io.emit('ticket-actualizado', ticketActualizado[0]);
      console.log('✅ Socket emitido: ticket-actualizado', ticketActualizado[0].idTicket);
    }

    res.json({ mensaje: 'Ticket actualizado correctamente' });

  } catch (error) {
    console.error("❌ Error al actualizar ticket:", error);
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
    const [tickets] = await pool.query('SELECT idEstado, fechaCreacion FROM ticket');

    // Conteo dinámico por estado
    const estadoConteo = {};
    const diaConteo = {};
    let resueltosHoy = 0;
    const hoy = new Date().toISOString().split('T')[0];

    tickets.forEach(ticket => {
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

        // Resueltos hoy → en tu BD estado 4 = Resuelto
        if (estado === 4 && fechaDia === hoy) {
          resueltosHoy++;
        }
      }
    });

    // Convertir objeto dinámico a array
    const porEstado = Object.keys(estadoConteo).map(key => ({
      estado: Number(key),
      cantidad: estadoConteo[key]
    }));

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
    u.usuario AS usuario,
    u.celular AS celular
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

    // 🔥 OBTENER TICKET COMPLETO ACTUALIZADO
    const [ticketActualizado] = await pool.query(`
      SELECT 
        t.*,
        u.nombres AS nombreUsuario,
        u.apellidos AS apellidoUsuario,
        ut.nombres AS nombreTecnico,
        ut.apellidos AS apellidoTecnico,
        c.nombreCategoria,
        p.nombrePrioridad,
        e.nombreEstado
      FROM ticket t
      LEFT JOIN usuario u ON t.usuarioCrea = u.dni
      LEFT JOIN usuario ut ON t.asignadoA = ut.dni
      LEFT JOIN categoria c ON t.idCategoria = c.idCategoria
      LEFT JOIN prioridad p ON t.idPrioridad = p.idPrioridad
      LEFT JOIN estado e ON t.idEstado = e.idEstado
      WHERE t.idTicket = ?
    `, [id]);

    // 🔥 EMITIR EVENTO POR SOCKET
    if (ticketActualizado && ticketActualizado.length > 0) {
      const io = getIO();
      io.emit('ticket-actualizado', ticketActualizado[0]);
      console.log('✅ Socket emitido: ticket asignado', ticketActualizado[0].idTicket);
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

export async function calificarTicket(req, res) {
  try {
    const { idTicket } = req.params;
    const { rol, calificacion, comentario, observacionTecnico } = req.body;
    const dniUsuario = req.user?.dni;
    let resolvio = req.body.resolvio;
    
  
    // 📎 ARCHIVOS
    const archivos = req.files?.length > 0
      ? req.files.map(f => f.filename)
      : [];

    const adjunto = archivos.length > 0 ? archivos.join(",") : null;

    console.log("📩 Datos recibidos:", req.body);
    console.log("📎 Adjuntos:", archivos);

    if (!rol) {
      return res.status(400).json({ mensaje: "El rol es requerido" });
    }

    // -------------------------
    // USUARIO CALIFICA
    // -------------------------
    if (rol === "usuario") {

      if (!calificacion) {
        return res.status(400).json({ mensaje: "La calificación es requerida" });
      }

      await pool.query(
        `UPDATE ticket SET calificacion = ?, idestado = 5 WHERE idTicket = ?`,
        [calificacion, idTicket]
      );

      await pool.query(
        `INSERT INTO comentarios (dni_usuarioComenta, idTicket, contenido, adjunto, tipo)
         VALUES (?, ?, ?, ?, 'comentario')`,
        [dniUsuario, idTicket, comentario || "Sin comentario", adjunto]
      );

      // 🔥 EMITIR SOCKET PARA CALIFICACIÓN
      const [ticketCalificado] = await pool.query(`
        SELECT 
          t.*,
          u.nombres AS nombreUsuario,
          u.apellidos AS apellidoUsuario,
          ut.nombres AS nombreTecnico,
          ut.apellidos AS apellidoTecnico,
          c.nombreCategoria,
          p.nombrePrioridad,
          e.nombreEstado
        FROM ticket t
        LEFT JOIN usuario u ON t.usuarioCrea = u.dni
        LEFT JOIN usuario ut ON t.asignadoA = ut.dni
        LEFT JOIN categoria c ON t.idCategoria = c.idCategoria
        LEFT JOIN prioridad p ON t.idPrioridad = p.idPrioridad
        LEFT JOIN estado e ON t.idEstado = e.idEstado
        WHERE t.idTicket = ?
      `, [idTicket]);

      if (ticketCalificado && ticketCalificado.length > 0) {
        const io = getIO();
        io.emit('ticket-actualizado', ticketCalificado[0]);
        console.log('✅ Socket emitido: ticket calificado', ticketCalificado[0].idTicket);
      }

      return res.json({ ok: true, mensaje: "Calificación registrada" });
    }

    // -------------------------
    // TÉCNICO AGREGA OBSERVACIÓN
    // -------------------------
    let nuevoEstado;
    if (rol === "tecnico") {
        nuevoEstado = resolvio ? 4 : 7;
      await pool.query(
        `UPDATE ticket SET idestado = ? WHERE idTicket = ?`,
        [nuevoEstado, idTicket]
      );

      // 🔥 EMITIR SOCKET PARA OBSERVACIÓN TÉCNICA
      const [ticketObservado] = await pool.query(`
        SELECT 
          t.*,
          u.nombres AS nombreUsuario,
          u.apellidos AS apellidoUsuario,
          ut.nombres AS nombreTecnico,
          ut.apellidos AS apellidoTecnico,
          c.nombreCategoria,
          p.nombrePrioridad,
          e.nombreEstado
        FROM ticket t
        LEFT JOIN usuario u ON t.usuarioCrea = u.dni
        LEFT JOIN usuario ut ON t.asignadoA = ut.dni
        LEFT JOIN categoria c ON t.idCategoria = c.idCategoria
        LEFT JOIN prioridad p ON t.idPrioridad = p.idPrioridad
        LEFT JOIN estado e ON t.idEstado = e.idEstado
        WHERE t.idTicket = ?
      `, [idTicket]);

      if (ticketObservado && ticketObservado.length > 0) {
        const io = getIO();
        io.emit('ticket-actualizado', ticketObservado[0]);
        console.log('✅ Socket emitido: observación técnica', ticketObservado[0].idTicket);
      }

      await pool.query(
        `INSERT INTO comentarios 
          (dni_usuarioComenta, idTicket, contenido, adjunto, tipo)
         VALUES (?, ?, ?, ?, 'observacion')`,
        [dniUsuario, idTicket, observacionTecnico || "Sin observación", adjunto]
      );

      return res.json({ ok: true, mensaje: "Observación registrada" });
    }

    return res.status(400).json({ mensaje: "Rol no válido" });

  } catch (error) {
    console.error("❌ Error en calificarTicket:", error);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
}

export async function getHistorialTicket(req, res) {
  try {
    const { id } = req.params;

    // Obtener comentarios y observaciones del ticket
    const [estado] = await pool.query(
      `
      SELECT 
        e.idEstado,
        es.nombreEstado,
        e.fechaCreacion
      FROM ticket e
      LEFT JOIN estado es ON es.idEstado = e.idEstado
      WHERE e.idTicket = ?
    `, [id]
    );
    const [comentarios] = await pool.query(
      `
      SELECT 
        c.idComentario,
        c.contenido,
        c.adjunto,
        c.tipo,
        u.nombres,
        u.apellidos,
        r.nombreRol
      FROM comentarios c
      LEFT JOIN usuario u ON c.dni_usuarioComenta = u.dni
      LEFT JOIN rolusuario ru ON ru.dni = u.dni
      LEFT JOIN rol r ON r.idRol = ru.idRol
      WHERE c.idTicket = ?
      `,
      [id]
    );

    res.json({
      estado: estado[0] ?? null,
      comentarios: comentarios ?? []
    });

  } catch (error) {
    console.error("❌ Error en getHistorialTicket:", error);
    res.status(500).json({ mensaje: "Error al obtener historial del ticket" });
  }
}
export async function getHerramientasTicket(req, res) {
  try {
    const { id } = req.params;

    // Obtener herramientas del ticket
    const [herramientas] = await pool.query(
      `
      SELECT 
        h.herramienta
      FROM ticket_herramienta h
      WHERE h.idTicket = ?
      `,
      [id]
    );

    res.json(herramientas);
  } catch (error) {
    console.error("❌ Error en getHerramientasTicket:", error);
    res.status(500).json({ mensaje: "Error al obtener herramientas del ticket" });
  }
}
