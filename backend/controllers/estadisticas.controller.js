const pool = require('../db.js');

async function getEstadisticas(req, res) {
  try {
    const [result] = await pool.query(`
      SELECT idEstado, COUNT(*) as total
      FROM ticket
      GROUP BY idEstado
    `);
    res.json(result);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
}

module.exports = { getEstadisticas };
