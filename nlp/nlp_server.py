import json
import os
import joblib
from flask import Flask, request, jsonify
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split

# ==============================
# ⚙️ CONFIGURACIÓN
# ==============================
BASE_DIR = os.path.dirname(__file__)
DATA_PATH = os.path.join(BASE_DIR, 'incidencias_120000.json')  # Archivo JSON
MODEL_PATH = os.path.join(BASE_DIR, 'nlp_model.joblib')        # Modelo entrenado

# ==============================
# 📂 CARGA Y VALIDACIÓN DE DATOS
# ==============================
print("Cargando datos desde:", DATA_PATH)

try:
    with open(DATA_PATH, encoding='utf-8') as f:
        data = json.load(f)
except FileNotFoundError:
    raise FileNotFoundError(f"No se encontró el archivo {DATA_PATH}")
except json.JSONDecodeError as e:
    raise ValueError(f"Error al leer el JSON: {e}")

if not isinstance(data, list) or len(data) == 0:
    raise ValueError("El archivo JSON está vacío o no contiene una lista de incidencias.")

print(f"Total de registros cargados: {len(data)}")

# ==============================
# 🧹 PREPROCESAMIENTO AUTOMÁTICO
# ==============================
texts, labels = [], []

for item in data:
    desc = (
        item.get('descripcion')
        or item.get('description')
        or item.get('texto')
        or item.get('detalle')
        or item.get('desc')
    )

    prio = (
        item.get('prioridad')
        or item.get('priority')
        or item.get('nivel')
        or item.get('valor')
        or item.get('categoria')
    )

    if desc and prio:
        texts.append(str(desc))
        labels.append(str(prio))

print(f"Datos válidos: {len(texts)} descripciones y {len(labels)} etiquetas")

if not texts or not labels:
    raise ValueError("No se cargaron datos válidos. Revisa las claves del JSON (descripcion/prioridad/nivel).")

# ==============================
# 🤖 ENTRENAMIENTO DEL MODELO
# ==============================
print("Entrenando modelo NLP...")

X_train, X_test, y_train, y_test = train_test_split(
    texts, labels, test_size=0.1, random_state=42
)

pipeline = Pipeline([
    ('tfidf', TfidfVectorizer(max_features=3000, ngram_range=(1, 2))),
    ('clf', LogisticRegression(max_iter=300, solver='lbfgs', multi_class='auto'))
])

pipeline.fit(X_train, y_train)

# Guardar modelo
joblib.dump(pipeline, MODEL_PATH)
print(f"Modelo entrenado y guardado en: {MODEL_PATH}")

# ==============================
# 🌐 API FLASK
# ==============================
app = Flask(__name__)

@app.route('/')
def home():
    return jsonify({
        "mensaje": "API NLP de Prioridad de Incidencias lista",
        "endpoints": {
            "POST /priorizar": "Clasifica la prioridad de una descripción"
        }
    }), 200

@app.route('/priorizar', methods=['POST'])
def priorizar():
    try:
        data = request.get_json()
        descripcion = data.get('descripcion') or data.get('description')

        if not descripcion:
            return jsonify({'error': 'Falta la descripción'}), 400

        modelo = joblib.load(MODEL_PATH)
        pred = modelo.predict([descripcion])[0]

        return jsonify({'prioridad': pred}), 200

    except Exception as e:
        print("Error en /priorizar:", e)
        return jsonify({'error': str(e)}), 500


# ==============================
# 🚀 EJECUCIÓN
# ==============================
if __name__ == '__main__':
    print("Servidor Flask ejecutándose en http://localhost:5005")
    app.run(host='0.0.0.0', port=5005, debug=True)
