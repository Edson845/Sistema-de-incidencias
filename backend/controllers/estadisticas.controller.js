import pool from '../db.js';

export const getResumen = async (req, res) => {
  try {
    const [tickets] = await pool.query('SELECT COUNT(*) AS totalTickets FROM tickets');
    const [resueltos] = await pool.query("SELECT COUNT(*) AS ticketsResueltos FROM tickets WHERE estado = 'Resuelto'");
    const [pendientes] = await pool.query("SELECT COUNT(*) AS ticketsPendientes FROM tickets WHERE estado = 'Pendiente'");
    const [usuarios] = await pool.query('SELECT COUNT(*) AS totalUsuarios FROM usuarios');

    res.json({
      totalTickets: tickets[0].totalTickets,
      ticketsResueltos: resueltos[0].ticketsResueltos,
      ticketsPendientes: pendientes[0].ticketsPendientes,
      totalUsuarios: usuarios[0].totalUsuarios
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener resumen', error: error.message });
  }
};

export const getTicketsPorEstado = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT estado, COUNT(*) AS cantidad FROM tickets GROUP BY estado');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener tickets por estado', error: error.message });
  }
};

export const getTicketsPorUsuario = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.nombre AS usuario, COUNT(t.id) AS cantidad
      FROM tickets t
      INNER JOIN usuarios u ON u.id = t.usuario_id
      GROUP BY u.nombre
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener tickets por usuario', error: error.message });
  }
};

export const getUsuariosPorRol = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT rol, COUNT(*) AS cantidad FROM usuarios GROUP BY rol');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios por rol', error: error.message });
  }
};
export const getEstadisticasGenerales = async (req, res) => {
  try {

    // 🟦 1. TOTAL DE TICKETS
    const [total] = await pool.query(`
      SELECT COUNT(*) AS total
      FROM ticket
    `);

    // 🟩 2. TICKETS NUEVOS (sin resolver)
    const [nuevos] = await pool.query(`
      SELECT COUNT(*) AS nuevos
      FROM ticket
      WHERE idEstado IN (1,2,3)
    `);

    // 🟧 3. TICKETS RESUELTOS HOY
    const [resueltosHoy] = await pool.query(`
      SELECT COUNT(*) AS resueltosHoy
      FROM historial
      WHERE estadoNuevo IN (4,5)
      AND DATE(fechaCreacion) = CURDATE()
    `);

    // 🟥 4. TIEMPO PROMEDIO DE RESOLUCIÓN
    const [promedioSolucion] = await pool.query(`
      SELECT 
        SEC_TO_TIME(
          AVG(TIMESTAMPDIFF(SECOND, h1.fechaCreacion, h2.fechaCreacion))
        ) AS promedio
      FROM historial h1
      JOIN historial h2 ON h1.idTicket = h2.idTicket
      WHERE h1.estadoNuevo = 1
      AND h2.estadoNuevo IN (4,5)
    `);

    // 🟪 5. PIE CHART → Tickets por estado
    const [porEstado] = await pool.query(`
      SELECT idEstado AS estado, COUNT(*) AS cantidad
      FROM ticket
      GROUP BY idEstado
      ORDER BY idEstado
    `);

    // 🟫 6. LINE CHART → Tickets creados por día (últimos 30 días)
    const [ticketsPorDiaRows] = await pool.query(`
      SELECT 
        DATE_FORMAT(fechaCreacion, '%d/%m/%Y') AS dia,
        COUNT(*) AS cantidad
      FROM ticket
      WHERE fechaCreacion >= CURDATE() - INTERVAL 30 DAY
      GROUP BY dia
      ORDER BY fechaCreacion ASC
    `);

    // Convertir array → objeto { '10/12/2025': 5 }
    const ticketsPorDia = {};
    ticketsPorDiaRows.forEach(row => {
      ticketsPorDia[row.dia] = row.cantidad;
    });

    // 🟦 RESPUESTA COMPLETA PARA EL DASHBOARD
    res.json({
      total: total[0].total,
      nuevos: nuevos[0].nuevos,
      resueltosHoy: resueltosHoy[0].resueltosHoy,
      promedioSolucion: promedioSolucion[0].promedio,
      porEstado,
      ticketsPorDia
    });

    console.log("📊 Estadísticas enviadas:", {
      total: total[0].total,
      nuevos: nuevos[0].nuevos,
      resueltosHoy: resueltosHoy[0].resueltosHoy,
      promedioSolucion: promedioSolucion[0].promedio,
      porEstado,
      ticketsPorDia
    });

  } catch (error) {

    console.error("❌ Error estadísticas:", error);

    res.status(500).json({
      message: "Error al obtener estadísticas generales",
      error: error.message
    });

  }
};
