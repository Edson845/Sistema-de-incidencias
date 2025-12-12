import * as usuarioService from '../services/usuarios.service.js';

export async function obtenerUsuario(req, res) {
  try {
    const dni = req.params.id;
    const usuario = await usuarioService.obtenerUsuarioServicio(dni);
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
    return res.status(200).json(usuario);
  } catch (error) {
    console.error("❌ Error al obtener usuario:", error);
    return res.status(500).json({ mensaje: "Error al obtener usuario" });
  }
}

export async function obtenerUsuarios(req, res) {
  try {
    const usuarios = await usuarioService.obtenerUsuariosServicio();
    return res.status(200).json(usuarios);

  } catch (error) {
    console.error("❌ Error al obtener usuarios:", error);
    return res.status(500).json({ mensaje: "Error al obtener usuarios" });
  }
}

export async function crearUsuario(req, res) {
  try {
    const resultado = await usuarioService.crearUsuarioServicio(req.body);
    return res.status(201).json(resultado);

  } catch (error) {
    console.error("❌ Error al crear usuario:", error);
    return res.status(500).json({
      mensaje: "Error al crear usuario",
      detalles: error.message
    });
  }
}

export async function actualizarAvatar(req, res) {
  try {
    const dni = req.params.id;
    const archivo = req.file;

    const resultado = await usuarioService.actualizarAvatarServicio(dni, archivo);

    if (resultado.error) {
      return res.status(400).json({ mensaje: resultado.mensaje });
    }

    res.status(200).json({
      mensaje: "Avatar actualizado correctamente",
      avatar: resultado.avatar
    });

  } catch (error) {
    console.error("❌ Error al actualizar avatar:", error);
    res.status(500).json({ mensaje: "Error al subir el avatar" });
  }
}

export async function actualizarPerfil(req, res) {
  try {
    const dni = req.user?.dni;

    if (!dni) {
      return res.status(401).json({ mensaje: "No autorizado: no se encontró el DNI del usuario." });
    }

    const { usuario, correo, celular } = req.body;

    const resultado = await usuarioService.actualizarPerfilServicio(dni, {
      usuario,
      correo,
      celular
    });

    if (resultado.error) {
      return res.status(400).json({ mensaje: resultado.mensaje });
    }
    return res.status(200).json({ mensaje: "Perfil actualizado correctamente." });
  } catch (error) {
    console.error("❌ Error en actualizarPerfil:", error);
    return res.status(500).json({ mensaje: "Error interno al actualizar el perfil." });
  }
}
export async function actualizarUsuario(req, res) {
  try {
    const { id } = req.params;
    const datos = req.body;

    const resultado = await usuarioService.actualizarUsuarioServicio(id, datos);

    if (resultado.error) {
      return res.status(resultado.codigo).json({ mensaje: resultado.mensaje });
    }

    return res.status(200).json({ mensaje: "Usuario actualizado correctamente" });

  } catch (error) {
    console.error("❌ Error en actualizarUsuario:", error);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
}
export async function obtenerTecnicos(req, res) {
  try {
    const tecnicos = await usuarioService.obtenerTecnicosService();
    res.json(tecnicos);
  } catch (error) {
    console.error('❌ Error al obtener técnicos:', error);
    res.status(500).json({ mensaje: error.message });
  }
}
export async function obtenerPerfil(req, res) {
  try {
    const dni = req.user?.dni;

    if (!dni) {
      return res.status(401).json({ mensaje: "No autorizado" });
    }

    const resultado = await usuarioService.obtenerPerfilServicio(dni);

    if (resultado.error) {
      return res.status(resultado.codigo).json({ mensaje: resultado.mensaje });
    }

    return res.status(200).json(resultado.datos);

  } catch (error) {
    console.error("❌ Error en getPerfil:", error);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
}
export async function eliminarUsuario(req, res) {
  const { id } = req.params;

  try {
    const resultado = await usuarioService.eliminarUsuarioService(id);

    if (resultado.error) {
      return res.status(404).json({ mensaje: resultado.error });
    }

    res.status(200).json({ mensaje: resultado.mensaje });

  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ mensaje: "Error al eliminar usuario" });
  }
}

export async function cambiarPassword(req, res) {
  try {
    const dni = req.user?.dni;

    if (!dni) {
      return res.status(401).json({ mensaje: "No autorizado: no se encontró el DNI del usuario." });
    }

    const { actual, nueva } = req.body;

    if (!actual || !nueva) {
      return res.status(400).json({ mensaje: "Faltan datos: contraseña actual y nueva son requeridas" });
    }

    const resultado = await usuarioService.cambiarPasswordServicio(dni, actual, nueva);

    if (resultado.error) {
      return res.status(resultado.codigo).json({ mensaje: resultado.mensaje });
    }

    return res.status(200).json({ mensaje: resultado.mensaje });

  } catch (error) {
    console.error("❌ Error en cambiarPassword:", error);
    return res.status(500).json({ mensaje: "Error interno al cambiar la contraseña" });
  }
}