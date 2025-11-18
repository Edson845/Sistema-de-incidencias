// backend/services/whatsapp.service.js
import axios from 'axios';

const PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const TOKEN = process.env.WHATSAPP_TOKEN;

const WHATSAPP_API_URL = `https://graph.facebook.com/v17.0/${PHONE_ID}/messages`;

export async function enviarWhatsApp(numero, mensaje) {
  try {
    const response = await axios.post(
      WHATSAPP_API_URL,
      {
        messaging_product: "whatsapp",
        to: numero,
        text: { body: mensaje }
      },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error enviando WhatsApp:", error.response?.data || error.message);
    throw error;
  }
}
