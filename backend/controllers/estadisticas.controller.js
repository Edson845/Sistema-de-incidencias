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
    const [ultimosTickets] = await pool.query('SELECT id, titulo, estado, fecha_creacion FROM tickets ORDER BY fecha_creacion DESC LIMIT 5');
    const [usuariosActivos] = await pool.query("SELECT COUNT(*) AS activos FROM usuarios WHERE estado = 'Activo'");
    const [resueltos] = await pool.query("SELECT COUNT(*) AS resueltos FROM tickets WHERE estado = 'Resuelto'");
    const [ticketsPorDia] = await pool.query(`
      SELECT DATE_FORMAT(fecha_creacion, '%d/%m/%Y') AS dia, COUNT(*) AS cantidad
      FROM tickets
      GROUP BY dia
      ORDER BY fecha_creacion ASC
    `);

    // Convierte el array a objeto { 'DD/MM/YYYY': cantidad }
    const ticketsPorDiaObj = {};
    ticketsPorDia.forEach(row => {
      ticketsPorDiaObj[row.dia] = row.cantidad;
    });

    res.json({
      ultimosTickets,
      usuariosActivos: usuariosActivos[0].activos,
      ticketsResueltos: resueltos[0].resueltos,
      ticketsPorDia: ticketsPorDiaObj
    });
    console.log('Respuesta enviada:', {
      ultimosTickets,
      usuariosActivos: usuariosActivos[0].activos,
      ticketsResueltos: resueltos[0].resueltos,
      ticketsPorDia: ticketsPorDiaObj
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener estadísticas generales', error: error.message });
  }
};
