import re
import unicodedata
import spacy

# -----------------------------------------------------
# CARGA DEL MODELO DE SPACY (optimizando velocidad)
# -----------------------------------------------------
try:
    nlp = spacy.load("es_core_news_sm", disable=["parser", "ner"])
except OSError:
    from spacy.cli import download
    download("es_core_news_sm")
    nlp = spacy.load("es_core_news_sm", disable=["parser", "ner"])

nlp.max_length = 3000000  # Evita errores en textos grandes

# -----------------------------------------------------
# STOPWORDS: Optimizado + dominio
# -----------------------------------------------------
STOPWORDS = {
    # Comunes
    'de','la','que','el','en','y','a','los','del','se','las','por','un','para','con','no','una','su','al','lo',
    'como','más','pero','sus','le','ya','o','este','sí','porque','esta','entre','cuando','muy','sin','sobre',
    'también','me','hasta','hay','donde','quien','desde','todo','nos','durante','todos','uno','les','ni','contra',
    'otros','ese','eso','ante','ellos','e','esto','mí','antes','algunos','qué','unos','yo','otro','otras','otra',
    'él','tanto','esa','estos','mucho','quienes','nada','muchos','cual','poco','ella','estar','estas','algunas',
    'algo','nosotros','mi','mis','tú','te','ti','tu','tus','ellas','nosotras','vosotros','vosotras','os',
    'son','es','ser','fue','sea','eran','era','está','están',
    # Dominio TI / incidencias
    'incidencia','solicito','favor','hola','gracias','buenos','dias','tardes','estimados','cordial',
    'saludo','atentamente','requiero','necesito','apoyo','ayuda','urgente','reporte','ticket'
}

# -----------------------------------------------------
# ABREVIATURAS (expansión mejorada)
# -----------------------------------------------------
ABBREVIATIONS = {
    r'\bpc\b': 'computadora',
    r'\beq\b': 'equipo',
    r'\badm\b': 'administrador',
    r'\bsw\b': 'software',
    r'\bhw\b': 'hardware',
    r'\bnet\b': 'internet',
    r'\bapp\b': 'aplicacion',
    r'\bconf\b': 'configuracion',
    r'\bimg\b': 'imagen',
    r'\bdoc\b': 'documento',
    r'\bpantalla\b': 'monitor',
    r'\bmouse\b': 'raton',
    r'\bkeyboard\b': 'teclado',
    r'\bcam\b': 'camara',
    r'\bcctv\b': 'camaras seguridad',
    r'\bimp\b': 'impresora',
}

# -----------------------------------------------------
# FUNCIONES DE LIMPIEZA
# -----------------------------------------------------
def remove_accents(text: str) -> str:
    """Elimina tildes y caracteres raros."""
    return ''.join(
        c for c in unicodedata.normalize('NFD', text)
        if unicodedata.category(c) != 'Mn'
    )


def basic_clean(text: str) -> str:
    """Limpieza rápida: minúsculas, abreviaturas, acentos, ruido."""
    if not text:
        return ""

    text = text.lower()

    # Expandir abreviaturas (antes de quitar acentos)
    for pattern, repl in ABBREVIATIONS.items():
        text = re.sub(pattern, repl, text)

    text = remove_accents(text)

    # Mantener solo letras y espacios
    text = re.sub(r'[^a-z\s]', ' ', text)

    # Colapsar espacios múltiples
    text = re.sub(r'\s+', ' ', text).strip()

    return text


def clean_text(text: str) -> str:
    """Limpieza profunda, para predicción única."""
    text = basic_clean(text)

    if not text:
        return ""

    doc = nlp(text)

    tokens = [
        token.lemma_
        for token in doc
        if (
            token.lemma_ not in STOPWORDS 
            and len(token.lemma_) > 2
            and not token.is_stop
        )
    ]

    return " ".join(tokens)


def clean_texts_batch(texts, batch_size=1000):
    """
    Limpieza profunda en batch, optimizada para datasets grandes.
    """
    # Limpieza básica primero (rápido)
    cleaned_basic = [basic_clean(t) for t in texts]

    final_texts = []

    # Procesamiento rápido con spaCy
    for doc in nlp.pipe(cleaned_basic, batch_size=batch_size):
        tokens = [
            tok.lemma_
            for tok in doc
            if (
                tok.lemma_ not in STOPWORDS
                and len(tok.lemma_) > 2
                and not tok.is_stop
            )
        ]
        final_texts.append(" ".join(tokens))

    return final_texts


def minimal_preprocess(text):
    """Limpieza mínima: solo lowercase y espacios (para predicción)."""
    if not text:
        return ""
    return text.lower().strip()
