import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from src.predict import Predictor

# ==============================
# ⚙️ CONFIGURACIÓN
# ==============================
BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, 'nlp_model.joblib')

# ==============================
# 🧠 CARGA DEL MODELO
# ==============================
predictor = Predictor(MODEL_PATH)

# ==============================
# 🌐 API FLASK
# ==============================
app = Flask(__name__)
CORS(app)  # Habilita CORS si tienes frontend

def success(data):
    """Formato estándar de respuesta exitosa."""
    return jsonify({"status": "success", "data": data}), 200

def error(message, code=400):
    """Formato estándar de error."""
    return jsonify({"status": "error", "message": message}), code


@app.route('/')
def home():
    return success({
        "mensaje": "API NLP de Prioridad de Incidencias lista (Mejorada v2)",
        "modelo_cargado": predictor.classifier is not None,
        "endpoints": {
            "POST /priorizar": "Clasifica la prioridad de una incidencia"
        }
    })


@app.route('/priorizar', methods=['POST'])
def priorizar():
    try:
        # Validar que el body sea JSON
        if not request.is_json:
            return error("El contenido debe ser JSON válido.", 415)

        data = request.get_json()

        # Extraer descripción
        descripcion = (
            data.get('descripcion') or 
            data.get('description') or 
            data.get('texto') or 
            ""
        ).strip()

        # Validaciones básicas
        if not descripcion:
            return error("Falta la descripción.", 400)

        # Evitar descripciones demasiado cortas
        if len(descripcion.split()) < 3:
            return error("La descripción es muy corta para poder clasificar.", 400)

        # Verificar modelo cargado
        if predictor.classifier is None:
            return error("El modelo NLP no está cargado.", 500)

        # Ejecutar predicción
        result = predictor.predict(descripcion)

        # Verificar si hay error
        if isinstance(result, dict) and 'error' in result:
            return error(result['error'], 400)

        # Extraer categoría del resultado
        if isinstance(result, dict):
            prioridad = result.get('categoria', result)
        else:
            prioridad = result

        return success({"prioridad": prioridad})

    except Exception as e:
        print("❌ Error en /priorizar:", e)
        return error(f"Error interno del servidor: {str(e)}", 500)


# ==============================
# 🚀 EJECUCIÓN
# ==============================
if __name__ == '__main__':
    print("🚀 Servidor Flask ejecutándose en http://localhost:5005")
    app.run(host='0.0.0.0', port=5005, debug=True)
