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
    console.log("📦 Datos recibidos:", req.body); // depura

    const { titulo, descripcion, idCategoria,tipo, nivel } = req.body;
    const usuarioCrea = req.user?.dni;
    if (!descripcion) {
      return res.status(400).json({ mensaje: "La descripción es obligatoria" });
    }

    const [result] = await pool.query(
      `INSERT INTO ticket (tituloTicket, descTicket, usuarioCrea, fechaCreacion, idCategoria, idPrioridad)
       VALUES (?, ?, ?, NOW(), ?, ?)`,
      [titulo, descripcion, usuarioCrea, idCategoria, 1]
    );
    res.json({ mensaje: "✅ Ticket creado correctamente", idTicket: result.insertId });
  } catch (error) {
    console.error("❌ Error en crearTicket:", error);
    res.status(500).json({ mensaje: "Error al crear ticket", error: error.message });
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
    res.json({ mensaje: 'Ticket actualizado' });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
}
