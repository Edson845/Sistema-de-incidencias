import os
import sys
import joblib
from pathlib import Path
from sentence_transformers import SentenceTransformer
import numpy as np

# Agregar el directorio padre al path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.preprocessing import clean_text

class Predictor:
    def __init__(self, model_path, embedding_model_name="sentence-transformers/all-MiniLM-L6-v2"):
        """
        model_path: ruta al archivo .joblib que contiene (classifier, label_encoder)
        embedding_model_name: modelo transformer para convertir texto a embeddings
        """
        self.model_path = Path(model_path)
        self.classifier = None
        self.label_encoder = None
        
        print("Cargando modelo de embeddings...")
        self.embedder = SentenceTransformer(embedding_model_name)
        
        self._load_model()

    def _load_model(self):
        if not self.model_path.exists():
            raise FileNotFoundError(f"❌ No se encontró el modelo en: {self.model_path}")

        print(f"🔄 Cargando modelo desde {self.model_path}...")
        saved = joblib.load(self.model_path)

        self.classifier = saved.get("classifier", None)
        self.label_encoder = saved.get("label_encoder", None)

        if self.classifier is None:
            raise ValueError("❌ El archivo del modelo no contiene un 'classifier' válido.")

        if self.label_encoder is None:
            raise ValueError("❌ El archivo del modelo no contiene un 'label_encoder'.")

        print("✅ Modelo cargado correctamente.")

    def _get_embedding(self, text: str):
        """Convierte texto a embedding usando SentenceTransformer."""
        if not text:
            return None
        
        return self.embedder.encode([text])[0]

    def predict(self, text):
        """
        Retorna:
        {
            "categoria": "...",
            "confianza": 0.93
        }
        """
        if not text:
            return {"error": "Texto vacío"}

        # Limpieza avanzada
        processed = clean_text(text)
        if not processed:
            return {"error": "Texto inválido luego del preprocesamiento"}

        # Embedding
        embedding = self._get_embedding(processed)
        if embedding is None:
            return {"error": "Error generando embedding"}

        # Predicción de clase
        pred = self.classifier.predict([embedding])[0]

        # Confianza: distancia al hyperplano convertida a probabilidad
        try:
            decision = self.classifier.decision_function([embedding])

            if len(decision.shape) == 1:
                confidence = 1 / (1 + np.exp(-decision[0]))
            else:
                exp_scores = np.exp(decision[0])
                confidence = exp_scores.max() / exp_scores.sum()

        except Exception:
            confidence = None

        # Convertir índice → etiqueta
        categoria = self.label_encoder.inverse_transform([pred])[0]

        return {
            "categoria": categoria,
            "confianza": float(confidence) if confidence else None
        }
