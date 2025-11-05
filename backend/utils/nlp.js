import natural from 'natural';
import sw from 'stopword';
import fs from 'fs';

const MODEL_PATH = './utils/nlp-model.json';
const DATA_PATH = './data/entrenamiento.json';
const tokenizer = new natural.WordTokenizer();

let classifier = new natural.BayesClassifier();

export function cargarModelo() {
  if (fs.existsSync(MODEL_PATH)) {
    natural.BayesClassifier.load(MODEL_PATH, null, (err, loaded) => {
      if (err) {
        console.error('⚠️ Error al cargar modelo NLP:', err);
        entrenarModelo(); // si falla, entrena uno nuevo
      } else {
        classifier = loaded;
        console.log('🧠 Modelo NLP cargado desde archivo');
      }
    });
  } else {
    console.log('📚 No hay modelo guardado, entrenando uno nuevo...');
    entrenarModelo();
  }
}

export function entrenarModelo() {
  try {
    if (!fs.existsSync(DATA_PATH)) {
      console.error('⚠️ Archivo de entrenamiento no encontrado:', DATA_PATH);
      return;
    }

    const data = fs.readFileSync(DATA_PATH, 'utf8');
    const ejemplos = JSON.parse(data);

    ejemplos.forEach(({ texto, nivel }) => {
      const palabras = tokenizer.tokenize(texto.toLowerCase());
      const palabrasFiltradas = sw.removeStopwords(palabras);
      const textoProcesado = palabrasFiltradas.join(' ');

      classifier.addDocument(textoProcesado, convertirNivelANumero(nivel));
    });

    classifier.train();
    classifier.save(MODEL_PATH, (err) => {
      if (err) console.error('❌ Error al guardar modelo NLP:', err);
      else console.log(`✅ Modelo NLP entrenado y guardado (${ejemplos.length} ejemplos).`);
    });
  } catch (error) {
    console.error('❌ Error al entrenar modelo NLP:', error);
  }
}

export function predecirPrioridad(descripcion) {
  if (!descripcion) return 3;
  const palabras = tokenizer.tokenize(descripcion.toLowerCase());
  const palabrasFiltradas = sw.removeStopwords(palabras);
  const textoProcesado = palabrasFiltradas.join(' ');

  const nivel = classifier.classify(textoProcesado);
  console.log(`🧠 Descripción analizada: "${descripcion}" → nivel ${nivel}`);
  return parseInt(nivel) || 3;
}

export function entrenarConNuevoEjemplo(descripcion, nivel) {
  if (!descripcion || !nivel) return;

  const palabras = tokenizer.tokenize(descripcion.toLowerCase());
  const palabrasFiltradas = sw.removeStopwords(palabras);
  const textoProcesado = palabrasFiltradas.join(' ');

  classifier.addDocument(textoProcesado, nivel.toString());
  classifier.train();
  classifier.save(MODEL_PATH, (err) => {
    if (err) console.error('❌ Error al guardar modelo:', err);
    else console.log(`🔄 Modelo actualizado con nuevo ejemplo (${nivel})`);
  });
}

function convertirNivelANumero(nivel) {
  switch (nivel.toLowerCase()) {
    case 'muy bajo': return '1';
    case 'bajo': return '2';
    case 'medio': return '3';
    case 'alto': return '4';
    case 'muy alto': return '5';
    default: return '3';
  }
}
