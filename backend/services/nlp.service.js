// src/services/nlp.service.js
import axios from 'axios';

const NLP_API_URL = 'http://localhost:5005/priorizar';

// Mapa de prioridad textual a numérica
const prioridadNumerica = {
  'muy baja': 1,
  'baja': 2,
  'media': 3,
  'alta': 4,
  'muy alta': 5
};

export async function obtenerPrioridad(descripcion) {
  try {
    const response = await axios.post(NLP_API_URL, { descripcion });
    const prioridadTexto = response.data.prioridad?.toLowerCase().trim();

    // Convierte el texto a número usando el mapa
    const valorNumerico = prioridadNumerica[prioridadTexto] || 3; // valor por defecto: media

    return valorNumerico;

  } catch (error) {
    console.error('❌ Error al conectar con NLP API:', error.message);
    return 3; // prioridad media por defecto si falla la API
  }
}
