import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export const chatMunicipal = async (req, res) => {
  try {
    const { mensaje } = req.body;

    const respuesta = await axios.post(
      "https://api.deepseek.com/v1/chat/completions",
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content:
              "Eres un chatbot de soporte técnico municipal. Responde SOLO temas simples: impresoras, red, cables, configuraciones básicas. No inventes información del municipio."
          },
          { role: "user", content: mensaje }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`
        }
      }
    );

    const texto = respuesta.data?.choices?.[0]?.message?.content;

    res.json({ respuesta: texto || "No pude interpretar la consulta 😅" });

  } catch (error) {
    const errData = error?.response?.data || error?.message || "Error desconocido";

    console.error("❌ Error DeepSeek:", errData);

    res.status(500).json({
      respuesta: "Error al conectar con DeepSeek 😥",
      detalle: errData
    });
  }
};
