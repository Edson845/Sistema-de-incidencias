const express = require('express');
const router = express.Router();
const { login } = require('../controllers/auth.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

router.post('/login', login);

// opcional: quién soy (útil para el front)
router.get('/me', verificarToken, (req, res) => {
  res.json({ id: req.user.id, rol: req.user.rol });
});

module.exports = router;
