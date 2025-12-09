// models/ticket.model.js
import  pool  from "../db.js";

export async function obtenerEstado(idTicket) {
  const [rows] = await pool.query(
    "SELECT idEstado FROM ticket WHERE idTicket = ?",
    [idTicket]
  );
  return rows[0]?.idEstado ?? null;
}

export async function obtenerTicketCompletoModel(idTicket) {
  const [rows] = await pool.query(`
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

  return rows[0];
}
export async function obtenerTicketsDetalladoModel() {
  return await pool.query(`
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
}
export async function obtenerTicketsPorRol(rol, idUsuario) {
  const camposSelect = `
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
  `;

  let query = '';
  let params = [];

  // ADMIN
  if (rol === 'admin') {
    query = camposSelect;
  }

  // TECNICO
  else if (rol === 'tecnico') {
    query = `
      ${camposSelect}
      WHERE t.usuarioCrea = ? OR t.asignadoA = ?
    `;
    params = [idUsuario, idUsuario];
  }

  // USUARIO NORMAL
  else {
    query = `
      ${camposSelect}
      WHERE t.usuarioCrea = ?
    `;
    params = [idUsuario];
  }

  return pool.query(query, params);
}
export async function obtenerTodosTicketsModel() {
  return await pool.query('SELECT * FROM ticket ORDER BY fechaCreacion ASC');
}
export async function obtenerTicketsPorEstadoModel() {
  const [rows] = await pool.query(`
    SELECT 
      idEstado AS estado, 
      COUNT(*) AS cantidad
    FROM ticket
    GROUP BY idEstado
  `);
  return rows;
}
export async function obtenerTicketsPorMesModel() {
  const [rows] = await pool.query(`
    SELECT 
      DATE_FORMAT(fechaCreacion, '%Y-%m') as mes,
      COUNT(*) as cantidad
    FROM ticket
    WHERE fechaCreacion >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
    GROUP BY DATE_FORMAT(fechaCreacion, '%Y-%m')
    ORDER BY mes ASC
  `);

  return rows;
}
export async function obtenerTicketsEstadoYFechaModel() {
  const [rows] = await pool.query(`
    SELECT idEstado, fechaCreacion 
    FROM ticket
  `);
  return rows;
}
export async function getCategoriasModel() {
  const [rows] = await pool.query(
    'SELECT idCategoria, nombreCategoria FROM categoria'
  );
  return rows;
}
export async function insertarTicketModel(data) {
  const {
    titulo,
    descripcion,
    usuarioCrea,
    idCategoria,
    idPrioridad,
    adjunto
  } = data;

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
      1,
      idPrioridad,
      adjunto
    ]
  );

  return result.insertId;
}
export async function insertarHerramientaModel(idTicket, herramienta) {
  return pool.query(
    `INSERT INTO ticket_herramienta (idTicket, herramienta) VALUES (?, ?)`,
    [idTicket, herramienta]
  );
}
export async function actualizarAsignacionModel(idTicket, asignadoA) {
  return pool.query(
    `UPDATE ticket SET asignadoA = ?, idEstado = 2 WHERE idTicket = ?`,
    [asignadoA, idTicket]
  );
}
export async function actualizarCalificacion(idTicket, calificacion) {
  await pool.query(
    `UPDATE ticket SET calificacion = ?, idestado = 5 WHERE idTicket = ?`,
    [calificacion, idTicket]
  );
}
export async function actualizarEstadoTecnico(idTicket, nuevoEstado) {
    await pool.query(
      `UPDATE ticket SET idestado = ? WHERE idTicket = ?`,
      [nuevoEstado, idTicket]
    );
}

export async function guardarComentario(dni, idTicket, contenido, adjunto, tipo) {
  const [result] = await pool.query(
    `INSERT INTO comentarios (dni_usuarioComenta, idTicket, contenido, adjunto, tipo)
     VALUES (?, ?, ?, ?, ?)`,
    [dni, idTicket, contenido, adjunto, tipo]
  );
  return result; 
}

export async function buscarTicketPorId(idTicket) {
  // Obtener datos del ticket
  const [rows] = await pool.query(`
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

  const ticket = rows[0];

  // Obtener comentario del usuario y observación del técnico
  const [comentarios] = await pool.query(`
    SELECT contenido, tipo
    FROM comentarios
    WHERE idTicket = ?
      AND tipo IN ('calificacion', 'observacion')
  `, [idTicket]);

  const comentarioUsuario = comentarios.find(c => c.tipo === 'calificacion');
  const observacionTecnico = comentarios.find(c => c.tipo === 'observacion');

  return {
    ...ticket,
    comentario: comentarioUsuario?.contenido || null,
    observacionTecnico: observacionTecnico?.contenido || null
  };
}


export async function obtenerEstadoTicketModelo(idTicket) {
  const [rows] = await pool.query(
    `
      SELECT 
        e.idEstado,
        es.nombreEstado,
        e.fechaCreacion
      FROM ticket e
      LEFT JOIN estado es ON es.idEstado = e.idEstado
      WHERE e.idTicket = ?
    `,
    [idTicket]
  );
  return rows[0] || null;
}

export async function obtenerComentariosTicketModelo(idTicket) {
  const [rows] = await pool.query(
    `
      SELECT 
        c.idComentario,
        c.contenido,
        c.adjunto,
        c.tipo,
        c.fechaCreacion,

        u.nombres AS nombreUsuario,
        u.apellidos AS apellidoUsuario,

        COALESCE(
          (SELECT r.nombreRol 
           FROM rolusuario ru
           INNER JOIN rol r ON r.idRol = ru.idRol
           WHERE ru.dni = u.dni
           LIMIT 1
          ), 
          'Sin Rol'
        ) AS rolUsuario
      FROM comentarios c
      LEFT JOIN usuario u 
            ON u.dni = c.dni_usuarioComenta
      WHERE c.idTicket = ?
      ORDER BY c.fechaCreacion DESC
    `,
    [idTicket]
  );

  return rows;
}



export async function obtenerHerramientasTicketModelo(idTicket) {
  const [rows] = await pool.query(
    `
      SELECT 
        h.herramienta
      FROM ticket_herramienta h
      WHERE h.idTicket = ?
    `,
    [idTicket]
  );

  return rows;
}
export async function obtenerEficienciaTecnicosModelo() {
  const [rows] = await pool.query(`
    SELECT 
      u.dni,
      u.usuario,
      COUNT(t.idTicket) AS ticketsResueltos
    FROM usuario u
    INNER JOIN rolusuario ru ON ru.dni = u.dni
    INNER JOIN rol r ON r.idRol = ru.idRol
    LEFT JOIN ticket t 
      ON t.asignadoA = u.dni 
      AND t.idEstado IN (5)
      AND YEARWEEK(t.fechaCreacion, 1) = YEARWEEK(NOW(), 1)
    WHERE r.nombreRol = 'tecnico'
    GROUP BY u.dni, u.usuario
    ORDER BY ticketsResueltos DESC
  `);

  return rows;
}
export async function guardarObservacionTecnico(idTicket, observacion, archivo, usuarioModifica) {
  try {
    const query = `
      INSERT INTO comentarios (
        dni_usuarioComenta,
        idTicket,
        contenido,
        adjunto,
        tipo
      )
      VALUES (?, ?, ?, ?, 'observacion')
    `;

    await pool.query(query, [
      usuarioModifica,
      idTicket,
      observacion,
      archivo
    ]);

  } catch (error) {
    console.error("❌ Error en guardarObservacionTecnico (model):", error);
    throw error;
  }
}
export async function obtenerHistorialPorTicket(idTicket) {
  try {
    const sql = `
      -- Comentarios del ticket
      SELECT 
          c.fechaCreacion,
          c.tipo,
          c.contenido,

          u.nombres AS nombres,
          u.apellidos AS apellidos,

          COALESCE(r.nombreRol, 'Sin rol') AS nombreRol,

          c.adjunto
      FROM comentarios c
      LEFT JOIN usuario u ON u.dni = c.dni_usuarioComenta
      LEFT JOIN rolusuario ru ON ru.dni = u.dni
      LEFT JOIN rol r ON r.idRol = ru.idRol
      WHERE c.idTicket = ?

      UNION ALL

      -- Historial del estado del ticket
      SELECT 
          h.fechaCreacion,
          'estado' AS tipo,
          CONCAT(h.accion, ' | Estado nuevo: ', h.estadoNuevo) AS contenido,

          u2.nombres AS nombres,
          u2.apellidos AS apellidos,

          COALESCE(r2.nombreRol, 'Sistema') AS nombreRol,

          NULL AS adjunto
      FROM historial h
      LEFT JOIN usuario u2 ON u2.dni = h.dni_usuarioModifica
      LEFT JOIN rolusuario ru2 ON ru2.dni = u2.dni
      LEFT JOIN rol r2 ON r2.idRol = ru2.idRol
      WHERE h.idTicket = ?

      ORDER BY fechaCreacion DESC;
    `;

    const [rows] = await pool.query(sql, [idTicket, idTicket]);
    return rows;

  } catch (error) {
    console.error("❌ Error en obtenerHistorialPorTicket:", error);
    throw error;
  }
}

export async function obtenerComentarioPorId(idComentario) {
  const [rows] = await pool.query(
    `
      SELECT 
        c.idComentario,
        c.contenido,
        c.adjunto,
        c.tipo,
        c.fechaCreacion,
        u.nombres,
        u.apellidos,
        r.nombreRol
      FROM comentarios c
      LEFT JOIN usuario u ON c.dni_usuarioComenta = u.dni
      LEFT JOIN rolusuario ru ON ru.dni = u.dni
      LEFT JOIN rol r ON r.idRol = ru.idRol
      WHERE c.idComentario = ?
    `,
    [idComentario]
  );
  return rows[0];
}


