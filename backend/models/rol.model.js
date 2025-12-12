import pool from '../db.js';

export async function obtenerRolesModel() {
  const [rows] = await pool.query(`
    SELECT idrol, nombreRol 
    FROM rol 
    ORDER BY idrol
  `);
  return rows;
}
export async function obtenerRolesPorDniModel(dni) {
  const [rows] = await pool.query(
    `SELECT r.nombreRol
     FROM usuario u
     JOIN rolusuario ru ON u.dni = ru.dni
     JOIN rol r ON ru.idrol = r.idrol
     WHERE u.dni = ?`,
    [dni]
  );

  return rows || [];
}

export async function obtenerRolPorId(idRol) {
  const [rows] = await pool.query(
    `SELECT idrol, nombreRol FROM rol WHERE idrol = ?`,
    [idRol]
  );
  return rows;
}