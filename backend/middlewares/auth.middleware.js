const {firmarToken} = require('../utils/jwt.js');
require('dotenv').config();

function verificarToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(403).json({ mensaje: 'Token requerido' });

  firmarToken.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ mensaje: 'Token inválido' });
    req.user = decoded;
    next();
  });
}

function esAdmin(req, res, next) {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ mensaje: 'Acceso denegado' });
  }
  next();
}

module.exports = { verificarToken, esAdmin };
