import jwt from 'jsonwebtoken';

// 🔐 Función para firmar un token
export function firmarToken(payload, secret = process.env.JWT_SECRET, expiresIn = '8h') {
  if (!secret) {
    throw new Error('JWT_SECRET no está definido en las variables de entorno');
  }
  return jwt.sign(payload, secret, { expiresIn });
}

// 🔎 Función opcional para verificar un token
export function verificarTokenJWT(token, secret = process.env.JWT_SECRET) {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
}
