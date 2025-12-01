// services/historial.service.js
import pool from '../db.js';
import { registrarHistorial } from './historial.service.js';
import { getIO } from "../socket.js";
import * as ticketModel from "../models/tickets.model.js";
import { obtenerPrioridad } from './nlp.service.js';

export async function getTodosTicketsService() {
  const [rows] = await ticketModel.obtenerTodosTicketsModel();
  return rows;
}
export async function getTicketsUsuarioService(rolesUsuario, idUsuario) {

  if (!rolesUsuario.length || !idUsuario) {
    throw new Error("Usuario no autenticado o datos incompletos");
  }

  const rol = rolesUsuario[0].trim().toLowerCase();

  const [rows] = await ticketModel.obtenerTicketsPorRol(rol, idUsuario);

  return rows;
}
export async function obtenerTicketsDetalladoService() {
  const [rows] = await ticketModel.obtenerTicketsDetalladoModel();
  return rows;
}
// Mapa de estados
const ESTADOS = {
  1: "Pendiente",
  2: "En revisión",
  3: "En proceso",
  4: "Resuelto por técnico",
  5: "Cerrado",
  6: "Rechazado",
  7: "Devuelto con observaciones"
};

export async function actualizarEstado({ idTicket, titulo, descripcion, estado, usuarioModifica }) {

  const campos = [];
  const valores = [];

  if (titulo !== undefined) {
    campos.push("tituloTicket = ?");
    valores.push(titulo);
  }

  if (descripcion !== undefined) {
    campos.push("descTicket = ?");
    valores.push(descripcion);
  }

  let estadoAntiguo = null;

  if (estado !== undefined) {
    campos.push("idEstado = ?");
    valores.push(estado);

    // obtener estado antiguo
    estadoAntiguo = await ticketModel.obtenerEstado(idTicket);
  }

  if (campos.length === 0) {
    throw new Error("No se enviaron campos para actualizar");
  }

  valores.push(idTicket);

  const query = `UPDATE ticket SET ${campos.join(", ")} WHERE idTicket = ?`;
  await pool.query(query, valores);

  // -----------------------------------
  // HISTORIAL MEJORADO
  // -----------------------------------
  if (estado !== undefined) {

    const estadoAntesTexto = ESTADOS[estadoAntiguo] || `Estado ${estadoAntiguo}`;
    const estadoNuevoTexto = ESTADOS[estado] || `Estado ${estado}`;

    // Reglas personalizadas (puedes añadir más)
    const reglasHistorial = {
      "3->4": "El técnico marcó el ticket como resuelto",
      "3->7": "El técnico devolvió el ticket con observaciones",
      "4->5": "El usuario calificó y cerró el ticket",
    };

    const clave = `${estadoAntiguo}->${estado}`;
    const accionGenerada = reglasHistorial[clave]
      ? reglasHistorial[clave]
      : `Cambio de estado: ${estadoAntesTexto} → ${estadoNuevoTexto}`;

    await registrarHistorial({
      idTicket,
      usuario: usuarioModifica,
      accion: accionGenerada,
      estadoAntiguo,
      estadoNuevo: estado,
      tipo: "Estado"
    });
  }

  // -----------------------------------
  // Emitir ticket actualizado
  // -----------------------------------
  const ticketActualizado = await ticketModel.obtenerTicketCompletoModel(idTicket);
  getIO().emit("ticket-actualizado", ticketActualizado);

  return ticketActualizado;
}

export async function obtenerEstado(idTicket){
  const [rows] = await pool.query(
    "SELECT idEstado FROM ticket WHERE idTicket = ?",
    [idTicket]
  );
  return rows[0]?.idEstado || null;
};

export async function obtenerCategoriasService() {
  return await ticketModel.getCategoriasModel();
}

export async function crearTicketService(req) {
  const { titulo, descripcion, idCategoria } = req.body;
  const usuarioCrea = req.user?.dni;

  if (!titulo || !descripcion || !idCategoria) {
    throw new Error("Todos los campos obligatorios deben completarse");
  }

  // Prioridad por NLP
  let idPrioridad = 3;
  try {
    idPrioridad = await obtenerPrioridad(descripcion);
  } catch (err) {
    console.error("⚠️ Error NLP:", err.message);
  }

  // Archivos
  const archivos = req.files?.length > 0
    ? req.files.map(f => f.filename)
    : [];

  const adjunto = archivos.length > 0 ? archivos.join(",") : null;

  // Insertar ticket
  const idInsertado = await ticketModel.insertarTicketModel({
    titulo,
    descripcion,
    usuarioCrea,
    idCategoria,
    idPrioridad,
    adjunto
  });

  // Registrar historial
  await registrarHistorial({
    idTicket: idInsertado,
    usuario: usuarioCrea,
    accion: "abrir ticket",
    estadoAntiguo: null,
    estadoNuevo: 1,
    tipo: "Estado"
  });

  // Obtener ticket completo
  const ticketCompleto = await ticketModel.obtenerTicketCompletoModel(idInsertado);

  // Enviar por socket
  const io = getIO();
  io.emit("nuevo-ticket", ticketCompleto);

  return {
    mensaje: "Ticket creado correctamente",
    idTicket: idInsertado,
    idPrioridad,
    archivosGuardados: archivos
  };
}
export async function getTicketsPorMesService() {
  const rows = await ticketModel.obtenerTicketsPorMesModel();

  // Convertir YYYY-MM a nombre del mes
  const resultado = rows.reduce((acc, row) => {
    const fecha = new Date(row.mes + '-01');
    const nombreMes = fecha.toLocaleString('es-ES', { month: 'long' });

    acc[nombreMes] = row.cantidad;
    return acc;
  }, {});

  return resultado;
}
export async function getEstadisticasGeneralesService() {
  const tickets = await ticketModel.obtenerTicketsEstadoYFechaModel();

  const estadoConteo = {};
  const diaConteo = {};
  let resueltosHoy = 0;

  const hoy = new Date().toISOString().split('T')[0];

  tickets.forEach(ticket => {
    const estado = ticket.idEstado;
    estadoConteo[estado] = (estadoConteo[estado] || 0) + 1;

    if (ticket.fechaCreacion) {
      const fechaStr =
        typeof ticket.fechaCreacion === 'string'
          ? ticket.fechaCreacion
          : ticket.fechaCreacion.toISOString
            ? ticket.fechaCreacion.toISOString()
            : String(ticket.fechaCreacion);

      const fechaDia = fechaStr.split('T')[0];
      diaConteo[fechaDia] = (diaConteo[fechaDia] || 0) + 1;

      // Estado 4 = Resuelto
      if (estado === 4 && fechaDia === hoy) {
        resueltosHoy++;
      }
    }
  });

  const porEstado = Object.keys(estadoConteo).map(key => ({
    estado: Number(key),
    cantidad: estadoConteo[key]
  }));

  return {
    porEstado,
    ticketsPorDia: diaConteo,
    resueltosHoy
  };
}
export async function asignarTicketConHerramientasService(idTicket, asignadoA, herramientas, usuarioModifica) {

  // Actualizar asignación + estado
  await ticketModel.actualizarAsignacionModel(idTicket, asignadoA);

  await registrarHistorial({
    idTicket,
    usuario: usuarioModifica,
    accion: 'asignar ticket',
    estadoAntiguo: 1,
    estadoNuevo: 2,
    tipo: 'Estado'
  });

  // Guardar herramientas
  if (herramientas?.length > 0) {
    for (const h of herramientas) {
      await ticketModel.insertarHerramientaModel(idTicket, h);
    }
  }

  // Ticket actualizado
  const ticket = await ticketModel.obtenerTicketCompletoModel(idTicket);

  // Emitir al socket
  const io = getIO();
  io.emit("ticket-actualizado", ticket);

  return ticket;
}
export async function obtenerTicketServicio(idTicket) {
  return await ticketModel.buscarTicketPorId(idTicket);
}

export async function asignarTicketConHerramientasServicio(idTicket, asignadoA, herramientas, usuarioModifica) {

  // Actualizar ticket
  await ticketModel.actualizarAsignacionTicket(idTicket, asignadoA);

  // Registrar historial
  await registrarHistorial({
    idTicket,
    usuario: usuarioModifica,
    accion: "asignar ticket",
    estadoAntiguo: 1,
    estadoNuevo: 2,
    tipo: "Estado"
  });

  // Registrar herramientas
  if (herramientas?.length > 0) {
    for (const h of herramientas) {
      await ticketModel.insertarHerramientaTicket(idTicket, h);
    }
  }

  // Obtener ticket actualizado
  const ticketActualizado = await ticketModel.buscarTicketPorId(idTicket);

  // Emitir actualización por socket
  if (ticketActualizado) {
    const io = getIO();
    io.emit("ticket-actualizado", ticketActualizado);
  }

  return { mensaje: "Asignación realizada correctamente" };
}
export async function calificarTicketServicio(params) {
  const {
    idTicket,
    rol,
    calificacion,
    comentario,
    observacionTecnico,
    adjunto,
    dniUsuario,
    resolvio
  } = params;

  // -------------------------
  // USUARIO CALIFICA
  // -------------------------
  if (rol === "usuario") {

    await ticketModel.actualizarCalificacion(idTicket, calificacion);

    await ticketModel.guardarComentario(
      dniUsuario,
      idTicket,
      comentario || "Sin comentario",
      adjunto,
      "calificacion"
    );

    await registrarHistorial({
      idTicket,
      usuario: dniUsuario,
      accion: "califidfdfsfsdfsdcar ticket",
      estadoAntiguo: 5,
      estadoNuevo: 6,
      tipo: "Estado"
    });

    const ticket = await ticketModel.obtenerTicketCompletoModel(idTicket);
    getIO().emit("ticket-actualizado", ticket);

    return { ok: true, mensaje: "Calificación registrada" };
  }

  // -------------------------
  // TÉCNICO AGREGA OBSERVACIÓN O RESUELVE
  // -------------------------
  if (rol === "tecnico") {

    const estadoAntiguo = await ticketModel.obtenerEstado(idTicket);
    const esResuelto = resolvio === true || resolvio === "true";

    const nuevoEstado = esResuelto ? 5 : 7;  // 5 = Resuelto, 7 = Observado

    await ticketModel.actualizarEstadoTecnico(idTicket, nuevoEstado);

    await ticketModel.guardarComentario(
      dniUsuario,
      idTicket,
      observacionTecnico || "Sin observación",
      adjunto,
      "observacion"
    );

    await registrarHistorial({
      idTicket,
      usuario: dniUsuario,
      accion: esResuelto ? "resolver ticket" : "agregar observación",
      estadoAntiguo,
      estadoNuevo: nuevoEstado,
      tipo: "Estado"
    });

    const ticket = await ticketModel.obtenerTicketCompletoModel(idTicket);
    getIO().emit("ticket-actualizado", ticket);

    return { ok: true, mensaje: esResuelto ? "Ticket resuelto" : "Observación registrada" };
  }

  throw new Error("Rol no válido");
}

export async function obtenerHistorialTicketServicio(idTicket) {
  const estado = await ticketModel.obtenerEstadoTicketModelo(idTicket);
  const comentarios = await ticketModel.obtenerComentariosTicketModelo(idTicket);

  return {
    estado,
    comentarios
  };
}
export async function obtenerHerramientasTicketServicio(idTicket) {
  const herramientas = await ticketModel.obtenerHerramientasTicketModelo(idTicket);
  return herramientas;
}
export async function obtenerEficienciaTecnicosServicio() {
  const lista = await ticketModel.obtenerEficienciaTecnicosModelo();
  return lista;
}
export async function agregarComentarioService(idTicket, comentario, dniUsuario, adjunto) {
  return ticketModel.guardarComentario(
    dniUsuario,
    idTicket,
    comentario,
    adjunto,
    "comentario"
  );
}
