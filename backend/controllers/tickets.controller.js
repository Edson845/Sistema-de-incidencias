const pool = require('../db/db');

async function getTicketsUsuario(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM tickets WHERE usuario_id = ?', [req.user.id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
}

async function getTodosTickets(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM tickets');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
}

async function crearTicket(req, res) {
  const { titulo, descripcion } = req.body;
  try {
    await pool.query(
      'INSERT INTO tickets (titulo, descripcion, usuario_id, estado) VALUES (?, ?, ?, "pendiente")',
      [titulo, descripcion, req.user.id]
    );
    res.json({ mensaje: 'Ticket creado' });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
}

async function actualizarTicket(req, res) {
  const { id } = req.params;
  const { titulo, descripcion, estado } = req.body;
  try {
    await pool.query(
      'UPDATE tickets SET titulo = ?, descripcion = ?, estado = ? WHERE id = ?',
      [titulo, descripcion, estado, id]
    );
    res.json({ mensaje: 'Ticket actualizado' });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
}

module.exports = { getTicketsUsuario, getTodosTickets, crearTicket, actualizarTicket };
