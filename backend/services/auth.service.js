import * as authModel from '../models/auth.model.js';
import { firmarToken } from '../utils/jwt.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Servicio de login - Valida credenciales y genera token JWT
 * @param {string} identificador - Correo o nombre de usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Promise<Object>} Objeto con token y roles, o error
 */
export async function loginService(identificador, password) {
    try {
        // Buscar usuario por correo o usuario
        const usuarios = await authModel.buscarUsuarioPorIdentificador(identificador);

        if (usuarios.length === 0) {
            return { error: true, codigo: 404, mensaje: 'Usuario no encontrado' };
        }

        const usuario = usuarios[0];

        // Validar contraseña
        const esValido = await bcrypt.compare(password, usuario.password);
        if (!esValido) {
            return { error: true, codigo: 401, mensaje: 'Credenciales inválidas' };
        }

        // Obtener roles del usuario
        const rolesRows = await authModel.obtenerRolesUsuario(usuario.dni);
        const roles = rolesRows.map(r => r.nombreRol);

        // Generar token
        const token = firmarToken(
            {
                dni: usuario.dni,
                nombre: usuario.nombres || usuario.apellidos || 'Usuario',
                correo: usuario.correo,
                rol: roles,
                roles
            },
            process.env.JWT_SECRET,
            '8h'
        );

        return { error: false, token, roles };

    } catch (error) {
        console.error('❌ Error en loginService:', error);
        return { error: true, codigo: 500, mensaje: error.message };
    }
}
