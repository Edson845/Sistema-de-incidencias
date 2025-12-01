import * as ticketService from '../services/tickets.service.js';
import { obtenerTicketsPorEstadoModel } from "../models/tickets.model.js";
import { registrarHistorial } from '../services/historial.service.js';


export async function getTodosTickets(req, res) {
  try {
    const rows = await ticketService.getTodosTicketsService();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
}
export async function getTicketsUsuario(req, res) {
  try {
    const rolesUsuario = req.user?.rol || [];
    const idUsuario = String(req.user?.dni || '');

    const tickets = await ticketService.getTicketsUsuarioService(rolesUsuario, idUsuario);

    res.json(tickets);

  } catch (error) {
    console.error("❌ Error en getTicketsUsuario:", error);
    res.status(500).json({ mensaje: error.message });
  }
}

export async function obtenerTicketsDetallado(req, res) {
  try {
    const tickets = await ticketService.obtenerTicketsDetalladoService();
    res.json(tickets);
  } catch (error) {
    console.error("Error al obtener tickets detallado:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
}

export const obtenerCategorias = async (req, res) => {
  try {
    const categorias = await ticketService.obtenerCategoriasService();
    res.json(categorias);
  } catch (error) {
    console.error('❌ Error al obtener categorías:', error);
    res.status(500).json({ mensaje: 'Error al obtener categorías' });
  }
};

export const crearTicket = async (req, res) => {
  try {
    const respuesta = await ticketService.crearTicketService(req);
    res.json(respuesta);
  } catch (error) {
    console.error("❌ Error en crearTicket:", error);
    res.status(400).json({ mensaje: error.message });
  }
};

export async function actualizarEstado(req, res) {
  const { id } = req.params;
  const { titulo, descripcion, estado } = req.body;
  const usuarioModifica = req.user?.dni;

  try {
    await ticketService.actualizarEstado({
      idTicket: id,
      titulo,
      descripcion,
      estado,
      usuarioModifica
    });

    return res.json({ mensaje: "Ticket actualizado correctamente" });

  } catch (error) {
    console.error("❌ Error en actualizarEstado:", error);
    res.status(500).json({ mensaje: error.message });
  }
}

// Nuevos endpoints para estadísticas

export async function getTicketsPorEstado(req, res) {
  try {
    const rows = await obtenerTicketsPorEstadoModel();
    res.json(rows);
  } catch (error) {
    console.error("❌ Error al obtener tickets por estado:", error);
    res.status(500).json({ mensaje: error.message });
  }
}


export async function getTicketsPorMes(req, res) {
  try {
    const resultado = await getTicketsPorMesService();
    res.json(resultado);
  } catch (error) {
    console.error('❌ Error al obtener tickets por mes:', error);
    res.status(500).json({ mensaje: error.message });
  }
}

export async function getEstadisticasGenerales(req, res) {
  try {
    const data = await ticketService.getEstadisticasGeneralesService();
    res.json(data);
  } catch (error) {
    console.error("❌ Error en getEstadisticasGenerales:", error);
    res.status(500).json({ mensaje: error.message });
  }
}

export async function asignarTicketConHerramientas(req, res) {
  try {
    const { id } = req.params;
    const { asignadoA, herramientas } = req.body;
    const usuarioModifica = req.user?.dni;

    await ticketService.asignarTicketConHerramientasService(id, asignadoA, herramientas, usuarioModifica);

    res.json({ mensaje: 'Asignación realizada correctamente' });

  } catch (err) {
    console.error("❌ Error en asignarTicketConHerramientas:", err);
    res.status(500).json({ mensaje: 'Error al asignar ticket' });
  }
}

export async function getTicketPorId(req, res) {
  try {
    const ticket = await ticketService.obtenerTicketServicio(req.params.id);

    if (!ticket) {
      return res.status(404).json({ mensaje: "Ticket no encontrado" });
    }

    res.json(ticket);

  } catch (error) {
    console.error("❌ Error en obtenerTicketPorId:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
}


export async function calificarTicket(req, res) {
  try {
    const { idTicket } = req.params;
    const { rol, calificacion, comentario, observacionTecnico } = req.body;
    const dniUsuario = req.user?.dni;
    const resolvio = req.body.resolvio;

    const archivos = req.files?.length > 0
      ? req.files.map(f => f.filename)
      : [];

    const adjunto = archivos.length > 0 ? archivos.join(",") : null;
    
    const resultado = await ticketService.calificarTicketServicio({
      idTicket,
      rol,
      calificacion,
      comentario,
      observacionTecnico,
      adjunto,
      dniUsuario,
      resolvio
    }); 

    res.json(resultado);

  } catch (error) {
    console.error("❌ Error en calificarTicket:", error);
    res.status(500).json({ mensaje: error.message });
  }
}

export async function obtenerHistorialTicket(req, res) {
  try {
    const { id } = req.params;

    const historial = await ticketService.obtenerHistorialTicketServicio(id);

    return res.json(historial);

  } catch (error) {
    console.error("❌ Error en obtenerHistorialTicket:", error);
    return res.status(500).json({ mensaje: "Error al obtener historial del ticket" });
  }
}


export async function obtenerHerramientasTicket(req, res) {
  try {
    const { id } = req.params;

    const herramientas = await ticketService.obtenerHerramientasTicketServicio(id);

    return res.json(herramientas);

  } catch (error) {
    console.error("❌ Error en obtenerHerramientasTicket:", error);
    return res.status(500).json({ mensaje: "Error al obtener herramientas del ticket" });
  }
}

export async function obtenerEficienciaTecnicos(req, res) {
  try {
    const resultado = await ticketService.obtenerEficienciaTecnicosServicio();
    return res.json(resultado);

  } catch (error) {
    console.error("❌ Error al obtener eficiencia de técnicos:", error);
    return res.status(500).json({
      mensaje: "Error al obtener estadísticas de técnicos",
    });
  }
}

export async function agregarComentario(req, res) {
  try {
    const idTicket = req.params.idTicket;
    const comentario = req.body.comentario;
    const dniUsuario = req.user?.dni; // debe venir del middleware
    const adjunto = req.file?.filename || null;
    // VALIDACIONES
    if (!idTicket) {
      return res.status(400).json({ ok: false, msg: "idTicket no recibido" });
    }

    if (!dniUsuario) {
      return res.status(400).json({ ok: false, msg: "dniUsuario no recibido" });
    }

    if (!comentario || comentario.trim() === "") {
      return res.status(400).json({ ok: false, msg: "Comentario vacío" });
    }

    await ticketService.agregarComentarioService(
      idTicket,
      comentario,
      dniUsuario,
      adjunto
    );

    res.json({ ok: true, msg: "Comentario guardado" });

  } catch (error) {
    console.error("Error en agregarComentario:", error);
    res.status(500).json({ ok: false, msg: error.message });
  }
}
