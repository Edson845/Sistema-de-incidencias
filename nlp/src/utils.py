import json
import os

def load_data(file_path):
    """Carga los datos del archivo JSON."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"No se encontró el archivo {file_path}")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        raise ValueError(f"Error al leer el JSON: {e}")
        
    if not isinstance(data, list) or len(data) == 0:
        raise ValueError("El archivo JSON está vacío o no contiene una lista de incidencias.")
        
    return data

def extract_texts_labels(data):
    """Extrae descripciones y etiquetas de la lista de datos."""
    texts, labels = [], []
    for item in data:
        desc = (
            item.get('descripcion')
            or item.get('comentario')
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
            
    return texts, labels
