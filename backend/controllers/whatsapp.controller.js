// backend/controllers/whatsapp.controller.js
import { enviarWhatsApp } from '../services/whatsapp.service.js';

export async function enviarMensaje(req, res) {
  const { numero, mensaje } = req.body;
  console.log("👉 Recibido:", req.body);
  if (!numero || !mensaje) {
    return res.status(400).json({ mensaje: 'Faltan parámetros' });
  }

  try {
    const resultado = await enviarWhatsApp(numero, mensaje);
    res.status(200).json({ mensaje: 'Mensaje enviado', resultado });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al enviar mensaje', detalles: error.message });
  }
}
