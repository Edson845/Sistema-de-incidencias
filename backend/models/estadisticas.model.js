import pool from '../db.js';

/**
 * Obtiene el total de tickets
 * @returns {Promise<number>} Total de tickets
 */
export async function obtenerTotalTickets() {
    const [rows] = await pool.query('SELECT COUNT(*) AS total FROM ticket');
    return rows[0].total;
}

/**
 * Obtiene el total de tickets resueltos
 * @returns {Promise<number>} Total de tickets resueltos
 */
export async function obtenerTicketsResueltos() {
    const [rows] = await pool.query(
        "SELECT COUNT(*) AS ticketsResueltos FROM tickets WHERE estado = 'Resuelto'"
    );
    return rows[0].ticketsResueltos;
}

/**
 * Obtiene el total de tickets pendientes
 * @returns {Promise<number>} Total de tickets pendientes
 */
export async function obtenerTicketsPendientes() {
    const [rows] = await pool.query(
        "SELECT COUNT(*) AS ticketsPendientes FROM tickets WHERE estado = 'Pendiente'"
    );
    return rows[0].ticketsPendientes;
}

/**
 * Obtiene el total de usuarios
 * @returns {Promise<number>} Total de usuarios
 */
export async function obtenerTotalUsuarios() {
    const [rows] = await pool.query('SELECT COUNT(*) AS totalUsuarios FROM usuarios');
    return rows[0].totalUsuarios;
}

/**
 * Obtiene la distribución de tickets por estado
 * @returns {Promise<Array>} Array con estado y cantidad
 */
export async function obtenerTicketsPorEstado() {
    const [rows] = await pool.query(
        'SELECT estado, COUNT(*) AS cantidad FROM tickets GROUP BY estado'
    );
    return rows;
}

/**
 * Obtiene la distribución de tickets por usuario
 * @returns {Promise<Array>} Array con usuario y cantidad
 */
export async function obtenerTicketsPorUsuario() {
    const [rows] = await pool.query(`
    SELECT u.nombre AS usuario, COUNT(t.id) AS cantidad
    FROM tickets t
    INNER JOIN usuarios u ON u.id = t.usuario_id
    GROUP BY u.nombre
  `);
    return rows;
}

/**
 * Obtiene la distribución de usuarios por rol
 * @returns {Promise<Array>} Array con rol y cantidad
 */
export async function obtenerUsuariosPorRol() {
    const [rows] = await pool.query(
        'SELECT rol, COUNT(*) AS cantidad FROM usuarios GROUP BY rol'
    );
    return rows;
}

/**
 * Obtiene el total de tickets nuevos (pendientes, en revisión, en proceso)
 * @returns {Promise<number>} Total de tickets nuevos
 */
export async function obtenerTicketsNuevos() {
    const [rows] = await pool.query(`
    SELECT COUNT(*) AS nuevos
    FROM ticket
    WHERE idEstado IN (1,2,3)
  `);
    return rows[0].nuevos;
}

/**
 * Obtiene el total de tickets resueltos hoy
 * @returns {Promise<number>} Total de tickets resueltos hoy
 */
export async function obtenerTicketsResueltosHoy() {
    const [rows] = await pool.query(`
    SELECT COUNT(*) AS resueltosHoy
    FROM historial
    WHERE estadoNuevo IN (5)
    AND DATE(fechaCreacion) = CURDATE()
  `);
    return rows[0].resueltosHoy;
}

/**
 * Obtiene el tiempo promedio de resolución de tickets
 * @returns {Promise<string>} Tiempo promedio en formato TIME
 */
export async function obtenerPromedioResolucion() {
    const [rows] = await pool.query(`
    SELECT 
      SEC_TO_TIME(
        AVG(TIMESTAMPDIFF(SECOND, h1.fechaCreacion, h2.fechaCreacion))
      ) AS promedio
    FROM historial h1
    JOIN historial h2 ON h1.idTicket = h2.idTicket
    WHERE h1.estadoNuevo = 1
    AND h2.estadoNuevo IN (5)
  `);
    return rows[0].promedio;
}

/**
 * Obtiene tickets por estado con IDs para el dashboard
 * @returns {Promise<Array>} Array con idEstado y cantidad
 */
export async function obtenerTicketsPorEstadoDetallado() {
    const [rows] = await pool.query(`
    SELECT idEstado AS estado, COUNT(*) AS cantidad
    FROM ticket
    GROUP BY idEstado
    ORDER BY idEstado
  `);
    return rows;
}

/**
 * Obtiene tickets creados por día en los últimos 30 días
 * @returns {Promise<Array>} Array con dia y cantidad
 */
export async function obtenerTicketsPorDia() {
    const [rows] = await pool.query(`
    SELECT 
      DATE_FORMAT(fechaCreacion, '%d/%m/%Y') AS dia,
      COUNT(*) AS cantidad
    FROM ticket
    WHERE fechaCreacion >= CURDATE() - INTERVAL 30 DAY
    GROUP BY dia
    ORDER BY fechaCreacion ASC
  `);
    return rows;
}
