import pool from "../db.js";
export async function obtenerUsuarioPorDniModelo(dni) {
  const [rows] = await pool.query(
    `SELECT dni, usuario, celular, nombres, apellidos, correo, idCargo 
     FROM usuario 
     WHERE dni = ?`,
    [dni]
  );

  return rows;
}
export async function obtenerTecnicosModel() {
  const [rows] = await pool.query(`
    SELECT 
      u.dni AS dni,
      u.nombres AS nombres,
      u.apellidos AS apellidos,
      u.usuario AS usuario,
      u.celular AS celular
    FROM usuario u
    INNER JOIN rolusuario ru ON ru.dni = u.dni
    INNER JOIN rol r ON r.idRol = ru.idRol
    WHERE r.nombreRol = 'tecnico'
  `);

  return rows;
}
export async function obtenerTodosLosUsuariosModelo() {
  const [rows] = await pool.query(
    `SELECT dni, usuario, nombres, apellidos, correo, idCargo 
     FROM usuario`
  );
  return rows;
}
export async function insertarUsuarioModelo(datos) {
  const {
    dni, usuario, password, celular,
    nombres, apellidos, correo,
    idCargo, idOficina, idDepartamento, idGerencia
  } = datos;

  await pool.query(
    `INSERT INTO usuario 
      (dni, usuario, password, celular, nombres, apellidos, correo, idCargo, idOficina, idDepartamento, idGerencia)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      dni, usuario, password, celular,
      nombres, apellidos, correo,
      idCargo, idOficina, idDepartamento, idGerencia
    ]
  );
}

export async function insertarRolUsuarioModelo(dni, idRol) {
  await pool.query(
    `INSERT INTO rolusuario (dni, idrol) VALUES (?, ?)`,
    [dni, idRol]
  );
}

export async function buscarUsuarioPorDNI(dni) {
  const [rows] = await pool.query(`SELECT dni FROM usuario WHERE dni = ?`, [dni]);
  return rows;
}
export async function obtenerTodosDatosUsuario(dni) {
  const [rows] = await pool.query("SELECT * FROM usuario WHERE dni = ?", [dni]);
  return rows;
}

export async function buscarRolPorId(idRol) {
  const [rows] = await pool.query(`SELECT idrol FROM rol WHERE idrol = ?`, [idRol]);
  return rows;
}

export async function obtenerGerenciaPorDepartamento(idDepartamento) {
  const [rows] = await pool.query(
    `SELECT idGerencia FROM departamento WHERE idDepartamento = ?`,
    [idDepartamento]
  );
  return rows;
}

export async function obtenerInfoDesdeOficina(idOficina) {
  const [rows] = await pool.query(
    `SELECT o.idDepartamento, d.idGerencia
     FROM oficina o
     INNER JOIN departamento d ON d.idDepartamento = o.idDepartamento
     WHERE o.idOficina = ?`,
    [idOficina]
  );
  return rows;
}
export async function actualizarAvatarModelo(avatarUrl, dni) {
  return await pool.query(
    `UPDATE usuario SET avatar = ? WHERE dni = ?`,
    [avatarUrl, dni]
  );
}


export async function reasignarTicketsAUsuarioGenerico(dni) {
  await pool.query(
    "UPDATE ticket SET usuarioCrea = ? WHERE usuarioCrea = ?",
    ["00000000", dni]
  );
}

export async function eliminarRolesDeUsuario(dni) {
  await pool.query("DELETE FROM rolusuario WHERE dni = ?", [dni]);
}

export async function eliminarUsuarioModel(dni) {
  await pool.query("DELETE FROM usuario WHERE dni = ?", [dni]);
}

export async function empezarTransaccion() {
  await pool.query("START TRANSACTION");
}
export async function confirmarTransaccion() {
  await pool.query("COMMIT");
}
export async function cancelarTransaccion() {
  await pool.query("ROLLBACK");
}
export async function actualizarPerfilModelo(dni, { usuario, correo, celular }) {
  return await pool.query(
    `
    UPDATE usuario 
    SET usuario = ?, correo = ?, celular = ?
    WHERE dni = ?
    `,
    [usuario, correo, celular, dni]
  );
}
export async function actualizarUsuarioModelo(dni, campos, valores) {
  const query = `
    UPDATE usuario 
    SET ${campos.join(', ')} 
    WHERE dni = ?
  `;
  valores.push(dni);
  return await pool.query(query, valores);
}
export async function obtenerPerfilModelo(dni) {
  return await pool.query(
    `SELECT 
        u.dni,
        u.usuario,
        u.celular,
        u.nombres,
        u.apellidos,
        u.correo,
        u.idCargo,
        u.avatar,
        c.nombreCargo,
        o.nombreOficina
     FROM usuario u
     LEFT JOIN cargo c ON u.idCargo = c.idCargo
     LEFT JOIN oficina o ON u.idOficina = o.idOficina
     WHERE u.dni = ?`,
    [dni]
  );
}

export async function obtenerPasswordUsuario(dni) {
  const [rows] = await pool.query(
    `SELECT password FROM usuario WHERE dni = ?`,
    [dni]
  );
  return rows.length > 0 ? rows[0].password : null;
}

export async function actualizarPasswordModelo(dni, nuevaPassword) {
  return await pool.query(
    `UPDATE usuario SET password = ? WHERE dni = ?`,
    [nuevaPassword, dni]
  );
}