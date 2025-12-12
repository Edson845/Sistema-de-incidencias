import * as usuarioModel from '../models/usuarios.model.js';
import bcrypt from 'bcrypt';

export async function obtenerTecnicosService() {
  return await usuarioModel.obtenerTecnicosModel();
}
export async function obtenerUsuarioServicio(dni) {
  const usuario = await usuarioModel.obtenerUsuarioPorDniModelo(dni);

  if (usuario.length === 0) {
    return null;
  }
  return usuario[0];
}
export async function obtenerUsuariosServicio() {
  const usuarios = await usuarioModel.obtenerTodosLosUsuariosModelo();
  return usuarios || [];
}
export async function crearUsuarioServicio(datos) {

  let {
    dni, usuario, password, nombres, celular,
    apellidos, correo, idRol, idCargo,
    idOficina, idDepartamento, idGerencia
  } = datos;

  // ------------------------------
  // COMODINES
  // ------------------------------
  const DEPARTAMENTO_VACIO = 45;
  const OFICINA_VACIA = 48;

  // ------------------------------
  // REGLA 1: Solo GERENCIA
  // ------------------------------
  if (idGerencia && !idDepartamento && !idOficina) {
    idDepartamento = DEPARTAMENTO_VACIO;
    idOficina = OFICINA_VACIA;
  }

  // ------------------------------
  // REGLA 2: Solo DEPARTAMENTO
  // ------------------------------
  if (idDepartamento && !idOficina) {
    const dep = await usuarioModel.obtenerGerenciaPorDepartamento(idDepartamento);

    if (dep.length > 0) {
      idGerencia = dep[0].idGerencia;
    }
    idOficina = OFICINA_VACIA;
  }

  // ------------------------------
  // REGLA 3: Solo OFICINA
  // ------------------------------
  if (idOficina) {
    const info = await usuarioModel.obtenerInfoDesdeOficina(idOficina);

    if (info.length > 0) {
      idDepartamento = info[0].idDepartamento;
      idGerencia = info[0].idGerencia;
    }
  }

  if (!dni || !usuario || !password || !nombres || !apellidos ||
    !correo || !idRol || !idCargo || !idOficina ||
    !idDepartamento || !idGerencia) {

    throw new Error("Faltan datos obligatorios");
  }

  // Verificar si usuario ya existe
  const existe = await usuarioModel.buscarUsuarioPorDNI(dni);
  if (existe.length > 0) {
    throw new Error("El usuario ya existe");
  }

  // Verificar si el rol existe
  const rolExiste = await usuarioModel.buscarRolPorId(idRol);
  if (rolExiste.length === 0) {
    throw new Error(`El rol con ID ${idRol} no existe`);
  }

  // Validar correo y celular
  const correoRegex = /^[a-zA-Z0-9._%+-]+@munisanroman\.gob\.pe$/;
  const celularRegex = /^[0-9]{9}$/;

  if (!correoRegex.test(correo)) {
    throw new Error("Correo inválido (debe terminar en @munisanroman.gob.pe)");
  }
  if (!celularRegex.test(celular)) {
    throw new Error("El celular debe tener 9 dígitos");
  }

  // ------------------------------
  // HASH PASSWORD
  // ------------------------------
  const hashedPassword = await bcrypt.hash(password, 10);

  // ------------------------------
  // TRANSACCIÓN
  // ------------------------------
  await usuarioModel.empezarTransaccion();

  try {
    await usuarioModel.insertarUsuarioModelo({
      dni,
      usuario,
      password: hashedPassword,
      celular,
      nombres,
      apellidos,
      correo,
      idCargo,
      idOficina,
      idDepartamento,
      idGerencia
    });

    await usuarioModel.insertarRolUsuarioModelo(dni, idRol);

    await usuarioModel.confirmarTransaccion();

  } catch (error) {
    await usuarioModel.cancelarTransaccion();
    throw error;
  }

  return { mensaje: "Usuario creado exitosamente" };
}
export async function actualizarAvatarServicio(dni, archivo) {
  if (!archivo) {
    return { error: true, mensaje: "No se envió ningún archivo" };
  }

  const avatarUrl = `/uploads/avatars/${archivo.filename}`;

  await usuarioModel.actualizarAvatarModelo(avatarUrl, dni);

  return { error: false, avatar: avatarUrl };
}
export async function actualizarPerfilServicio(dni, datos) {
  const { usuario, correo, celular } = datos;

  // Validación de correo institucional
  const correoRegex = /^[a-zA-Z0-9._%+-]+@munisanroman\.gob\.pe$/;
  if (correo && !correoRegex.test(correo)) {
    return { error: true, mensaje: "El correo debe ser institucional (@munisanroman.gob.pe)." };
  }

  // Validación de celular (exactamente 9 dígitos)
  const celularRegex = /^[0-9]{9}$/;
  if (celular && !celularRegex.test(celular)) {
    return { error: true, mensaje: "El celular debe tener 9 dígitos." };
  }

  try {
    await usuarioModel.actualizarPerfilModelo(dni, { usuario, correo, celular });
    return { error: false };
  } catch (error) {
    console.error("❌ Error en actualizarPerfilServicio:", error);
    return { error: true, mensaje: "No se pudo actualizar el perfil." };
  }
}
export async function actualizarUsuarioServicio(id, datos) {
  const { nombres, apellidos, correo, idCargo, idOficina, idDepartamento, idGerencia, celular, password } = datos;

  // Verificar existencia
  const [usuarioExiste] = await usuarioModel.buscarUsuarioPorDNI(id);
  if (usuarioExiste.length === 0) {
    return { error: true, codigo: 404, mensaje: "Usuario no encontrado" };
  }

  const campos = [];
  const valores = [];

  if (nombres) { campos.push("nombres = ?"); valores.push(nombres); }
  if (apellidos) { campos.push("apellidos = ?"); valores.push(apellidos); }
  if (correo) { campos.push("correo = ?"); valores.push(correo); }
  if (celular) { campos.push("celular = ?"); valores.push(celular); }
  if (idCargo) { campos.push("idCargo = ?"); valores.push(idCargo); }

  // Convertir cadenas vacías a null para campos integer
  if (idOficina !== undefined) {
    campos.push("idOficina = ?");
    valores.push(idOficina === '' || idOficina === null ? null : idOficina);
  }
  if (idDepartamento !== undefined) {
    campos.push("idDepartamento = ?");
    valores.push(idDepartamento === '' || idDepartamento === null ? null : idDepartamento);
  }
  if (idGerencia !== undefined) {
    campos.push("idGerencia = ?");
    valores.push(idGerencia === '' || idGerencia === null ? null : idGerencia);
  }

  if (password) {
    const hashed = await bcrypt.hash(password, 10);
    campos.push("password = ?");
    valores.push(hashed);
  }

  if (campos.length === 0) {
    return { error: true, codigo: 400, mensaje: "No hay campos para actualizar" };
  }

  try {
    await usuarioModel.actualizarUsuarioModelo(id, campos, valores);
    return { error: false };
  } catch (err) {
    console.error("❌ Error en actualizarUsuarioServicio:", err);
    return { error: true, codigo: 500, mensaje: "Error al actualizar el usuario" };
  }
}
export async function obtenerPerfilServicio(dni) {
  try {
    const [rows] = await usuarioModel.obtenerPerfilModelo(dni);

    if (rows.length === 0) {
      return { error: true, codigo: 404, mensaje: "Usuario no encontrado" };
    }

    return { error: false, datos: rows[0] };

  } catch (error) {
    console.error("❌ Error en obtenerPerfilServicio:", error);
    return { error: true, codigo: 500, mensaje: "Error al obtener el perfil del usuario" };
  }
}
export async function eliminarUsuarioService(dni) {
  try {
    // Iniciar transacción
    await usuarioModel.empezarTransaccion();

    // Verificar si existe
    const existeUsuario = await usuarioModel.obtenerTodosDatosUsuario(dni);
    if (existeUsuario.length === 0) {
      await usuarioModel.cancelarTransaccion();
      return { error: "Usuario no encontrado" };
    }

    // Reasignar tickets
    await usuarioModel.reasignarTicketsAUsuarioGenerico(dni);

    // Eliminar roles asignados
    await usuarioModel.eliminarRolesDeUsuario(dni);

    // Eliminar usuario
    await usuarioModel.eliminarUsuarioModel(dni);

    // Confirmar transacción
    await usuarioModel.confirmarTransaccion();

    return { mensaje: "Usuario eliminado y tickets reasignados correctamente" };

  } catch (error) {
    await usuarioModel.cancelarTransaccion();
    throw error;
  }
}

export async function cambiarPasswordServicio(dni, passwordActual, passwordNueva) {
  try {
    // Obtener password actual del usuario
    const passwordHash = await usuarioModel.obtenerPasswordUsuario(dni);

    if (!passwordHash) {
      return { error: true, codigo: 404, mensaje: "Usuario no encontrado" };
    }

    // Verificar que la contraseña actual sea correcta
    const esValida = await bcrypt.compare(passwordActual, passwordHash);
    if (!esValida) {
      return { error: true, codigo: 401, mensaje: "La contraseña actual es incorrecta" };
    }

    // Validar que la nueva contraseña tenga al menos 6 caracteres
    if (passwordNueva.length < 6) {
      return { error: true, codigo: 400, mensaje: "La nueva contraseña debe tener al menos 6 caracteres" };
    }

    // Hash de la nueva contraseña
    const passwordNuevaHash = await bcrypt.hash(passwordNueva, 10);

    // Actualizar password en la base de datos
    await usuarioModel.actualizarPasswordModelo(dni, passwordNuevaHash);

    return { error: false, mensaje: "Contraseña actualizada correctamente" };

  } catch (error) {
    console.error("❌ Error en cambiarPasswordServicio:", error);
    return { error: true, codigo: 500, mensaje: "Error al cambiar la contraseña" };
  }
}