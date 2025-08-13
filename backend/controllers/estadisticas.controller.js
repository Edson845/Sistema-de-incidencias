const pool = require('../db/db');

async function getEstadisticas(req, res) {
  try {
    const [result] = await pool.query(`
      SELECT estado, COUNT(*) as total
      FROM tickets
      GROUP BY estado
    `);
    res.json(result);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
}

module.exports = { getEstadisticas };
