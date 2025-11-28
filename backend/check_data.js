import pool from './db.js';

async function checkData() {
    try {
        const [tickets] = await pool.query("SELECT * FROM ticket LIMIT 1");
        console.log("Ticket Data Sample:", tickets[0]);

        const [comentarios] = await pool.query("SELECT * FROM comentarios LIMIT 1");
        console.log("Comentarios Data Sample:", comentarios[0]);

        const [columns] = await pool.query("SHOW COLUMNS FROM ticket");
        console.log("Ticket Columns Full:", columns);
    } catch (e) {
        console.error(e);
    }
    process.exit();
}

checkData();
