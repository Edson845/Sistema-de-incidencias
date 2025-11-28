import pool from './db.js';

async function migrate() {
    try {
        console.log("Adding fechaCierre column to ticket table...");
        await pool.query("ALTER TABLE ticket ADD COLUMN fechaCierre DATETIME NULL DEFAULT NULL");
        console.log("Column added successfully.");
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log("Column already exists.");
        } else {
            console.error("Error adding column:", e);
        }
    }
    process.exit();
}

migrate();
