const jwt = require('jsonwebtoken');

function firmarToken(payload, secret = process.env.JWT_SECRET, expiresIn = '8h') {
  if (!secret) {
    throw new Error('JWT_SECRET no está definido en las variables de entorno');
  }

  return jwt.sign(payload, secret, { expiresIn });
}

module.exports = { firmarToken };
