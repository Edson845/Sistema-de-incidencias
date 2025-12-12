import * as authService from '../services/auth.service.js';

export async function login(req, res) {
  const { identificador, password } = req.body;

  try {
    const resultado = await authService.loginService(identificador, password);

    if (resultado.error) {
      return res.status(resultado.codigo).json({ mensaje: resultado.mensaje });
    }

    return res.json({ token: resultado.token, roles: resultado.roles });

  } catch (error) {
    console.error('❌ Error en login:', error);
    return res.status(500).json({ mensaje: error.message });
  }
}
