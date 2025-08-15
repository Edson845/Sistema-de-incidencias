const pool = require('../db.js');

async function getEstadisticas(req, res) {
  try {
    const [result] = await pool.query(`
      SELECT estado, COUNT(*) as total
      FROM ticket
      GROUP BY estado
    `);
    res.json(result);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
}

module.exports = { getEstadisticas };
