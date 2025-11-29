import pool from "../db.js";
export async function actualizarEstado(idTicket, nuevoEstado){ 
  await pool.query(
    "UPDATE ticket SET idEstado = ? WHERE idTicket = ?",
    [nuevoEstado, idTicket]
  );
};

export async function registrarHistorial({
  idTicket,
  usuario,
  accion,
  estadoAntiguo = null,
  estadoNuevo = null,
  tipo = 'Estado'
}) {
  try {
    await pool.query(`
      INSERT INTO historial (
        idTicket,
        dni_usuarioModifica,
        accion,
        estadoAntiguo,
        estadoNuevo,
        tipo
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      idTicket,
      usuario,
      accion,
      estadoAntiguo,
      estadoNuevo,
      tipo
    ]);

    return true;

  } catch (error) {
    console.error("Error registrando historial:", error);
    return false;
  }
}

