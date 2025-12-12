import pool from '../db.js';

/**
 * Busca un usuario por su identificador (correo o usuario)
 * @param {string} identificador - Correo o nombre de usuario
 * @returns {Promise<Array>} Array con el usuario encontrado
 */
export async function buscarUsuarioPorIdentificador(identificador) {
    const [rows] = await pool.query(
        `SELECT * FROM usuario 
     WHERE correo = ? 
        OR usuario = ?`,
        [identificador, identificador]
    );
    return rows;
}

/**
 * Obtiene los roles de un usuario dado su DNI
 * @param {string} dni - DNI del usuario
 * @returns {Promise<Array>} Array con los roles del usuario
 */
export async function obtenerRolesUsuario(dni) {
    const [rows] = await pool.query(`
    SELECT r.nombreRol
    FROM rolusuario ru
    JOIN rol r ON ru.idrol = r.idrol
    WHERE ru.dni = ?
  `, [dni]);
    return rows;
}
