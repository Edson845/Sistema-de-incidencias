// backend/controllers/whatsapp.controller.js
import axios from 'axios';

export async function enviarMensaje(req, res) {
  const { numero, mensaje } = req.body;
  console.log("👉 Recibido:", req.body);
  if (!numero || !mensaje) {
    return res.status(400).json({ mensaje: 'Faltan parámetros' });
  }
    const numeroFormateado = numero.startsWith("51") ? numero : `51${numero}`;
  try {
    const response = await axios.post(
      "https://graph.facebook.com/v22.0/924830387377399/messages",
      {
        messaging_product: "whatsapp",
        to: numeroFormateado,               // <-- Se usa el número recibido
        type: "text",
        text: { body: mensaje }},
      {
        headers: {
          "Authorization": `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.status(200).json({
      mensaje: "Mensaje enviado exitosamente",
      resultado: response.data
    });

  } catch (error) {
    console.error("❌ Error al enviar mensaje:", error.response?.data || error.message);

    res.status(500).json({
      mensaje: "Error al enviar mensaje",
      detalles: error.response?.data || error.message
    });
  }
}
