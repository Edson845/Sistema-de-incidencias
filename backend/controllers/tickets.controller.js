import pool from '../db.js';

export async function getTicketsUsuario(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM ticket WHERE usuarioCrea = ?', [req.user.id]);
    res.json(rows);
  } catch (error) {
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

export async function crearTicket(req, res) {
  const { tituloTicket, descTicket, asignadoA, usuarioCrea, idCategoria, idEstado, idPrioridad, adjunto } = req.body;
  try {
    await pool.query(
      'INSERT INTO ticket (tituloTicket, descTicket, asignadoA, usuarioCrea, idCategoria, idEstado, idPrioridad, adjunto) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [tituloTicket, descTicket, asignadoA, usuarioCrea, idCategoria, idEstado, idPrioridad, adjunto]
    );
    res.json({ mensaje: 'Ticket Creado' });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
}

export async function actualizarTicket(req, res) {
  const { id } = req.params;
  const { titulo, descripcion, estado } = req.body;
  try {
    await pool.query(
      'UPDATE ticket SET tituloTicket = ?, descTicket = ?, idEstado = ? WHERE idTicket = ?',
      [titulo, descripcion, estado, id]
    );
    res.json({ mensaje: 'Ticket actualizado' });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
}
