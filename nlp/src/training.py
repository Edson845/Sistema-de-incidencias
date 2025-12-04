import sys
import os
import joblib
import numpy as np
from sklearn.svm import LinearSVC
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, f1_score
from sklearn.preprocessing import LabelEncoder
from imblearn.over_sampling import RandomOverSampler
from sentence_transformers import SentenceTransformer

# --- PROYECTO ---
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from src.utils import load_data, extract_texts_labels
from src.preprocessing import clean_texts_batch

# --- CONFIG ---
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DATA_PATH = os.path.join(BASE_DIR, "incidencias_120000.json")
MODEL_PATH = os.path.join(BASE_DIR, "nlp_model.joblib")
EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

def train_model():
    print("📌 Cargando datos...")
    try:
        data = load_data(DATA_PATH)
        texts, labels = extract_texts_labels(data)
    except Exception as e:
        print(f"❌ Error al cargar datos: {e}")
        return

    print(f"✔ Datos cargados: {len(texts)} registros.")

    print("📌 Preprocesando textos...")
    clean_texts = clean_texts_batch(texts)

    # Eliminar entradas vacías
    valid = [(t, l) for t, l in zip(clean_texts, labels) if t.strip()]
    if not valid:
        print("❌ Error: No quedaron datos válidos tras preprocesar.")
        return

    clean_texts, labels = zip(*valid)
    print(f"✔ Textos válidos: {len(clean_texts)}")

    # ============================================================
    #   GENERAR EMBEDDINGS
    # ============================================================
    print(f"📌 Generando embeddings con {EMBEDDING_MODEL_NAME}...")
    embedder = SentenceTransformer(EMBEDDING_MODEL_NAME)
    X_embeddings = embedder.encode(clean_texts, show_progress_bar=True)
    
    # Codificar etiquetas
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(labels)
    
    print(f"✔ Embeddings generados. Shape: {X_embeddings.shape}")

    # ============================================================
    #   SPLIT
    # ============================================================
    print("📌 Dividiendo datos Train/Test...")
    X_train, X_test, y_train, y_test = train_test_split(
        X_embeddings, y_encoded,
        test_size=0.10,
        stratify=y_encoded,
        random_state=42
    )

    # ============================================================
    #   OVERSAMPLING
    # ============================================================
    print("📌 Aplicando RandomOverSampler...")
    sampler = RandomOverSampler(random_state=42)
    X_train_res, y_train_res = sampler.fit_resample(X_train, y_train)

    # ============================================================
    #   ENTRENAMIENTO (LinearSVC)
    # ============================================================
    print("📌 Entrenando LinearSVC...")
    clf = LinearSVC(
        C=0.7,
        tol=1e-5,
        max_iter=6000,
        class_weight="balanced",
        random_state=42
    )
    clf.fit(X_train_res, y_train_res)

    # ============================================================
    #   EVALUACIÓN
    # ============================================================
    print("📌 Evaluando modelo...")
    y_pred = clf.predict(X_test)

    # Decodificar etiquetas para reporte
    y_test_decoded = label_encoder.inverse_transform(y_test)
    y_pred_decoded = label_encoder.inverse_transform(y_pred)

    acc = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred, average="weighted")

    print("\n📊 Clasification Report:")
    print(classification_report(y_test_decoded, y_pred_decoded))

    print("\n📊 Matriz de Confusión:")
    print(confusion_matrix(y_test_decoded, y_pred_decoded))

    print(f"\n✔ Accuracy Final: {acc:.4f}")
    print(f"✔ F1-Weighted: {f1:.4f}")

    # ============================================================
    #   GUARDAR MODELO
    # ============================================================
    print(f"💾 Guardando modelo en {MODEL_PATH}...")
    
    # Guardamos un diccionario con el clasificador y el encoder
    model_data = {
        "classifier": clf,
        "label_encoder": label_encoder
    }
    joblib.dump(model_data, MODEL_PATH)

    print("\n🎉 ¡Entrenamiento finalizado con éxito!")

if __name__ == "__main__":
    train_model()
