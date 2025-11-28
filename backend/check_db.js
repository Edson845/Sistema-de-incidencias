import pool from './db.js';

async function check() {
    try {
        const [cols] = await pool.query("SHOW COLUMNS FROM ticket");
        console.log("Ticket Columns:", cols.map(c => c.Field));

        const [cols2] = await pool.query("SHOW COLUMNS FROM comentarios");
        console.log("Comentarios Columns:", cols2.map(c => c.Field));
    } catch (e) {
        console.error(e);
    }
    process.exit();
}

check();
