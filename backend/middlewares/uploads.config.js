import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Carpeta donde se guardarán los archivos
const uploadDir = path.resolve('uploads/tickets');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

// Filtro de tipos permitidos
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const ok = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  if (ok) return cb(null, true);
  cb(new Error('Solo se permiten archivos .jpg, .jpeg, .png o .pdf'));
};

// Límite de tamaño
const limits = { fileSize: 10 * 1024 * 1024 }; // 10MB

// Exportar multer
export const upload = multer({ storage, fileFilter, limits });
export const uploadDirPath = uploadDir; // opcional si quieres usar la ruta en otro lado
