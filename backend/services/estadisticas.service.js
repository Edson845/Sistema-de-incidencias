import * as estadisticasModel from '../models/estadisticas.model.js';

/**
 * Servicio para obtener el resumen general de estadísticas
 * @returns {Promise<Object>} Objeto con totales y estadísticas básicas
 */
export async function obtenerResumenService() {
    try {
        const totalTickets = await estadisticasModel.obtenerTotalTickets();
        const ticketsResueltos = await estadisticasModel.obtenerTicketsResueltos();
        const ticketsPendientes = await estadisticasModel.obtenerTicketsPendientes();
        const totalUsuarios = await estadisticasModel.obtenerTotalUsuarios();

        return {
            error: false,
            datos: {
                totalTickets,
                ticketsResueltos,
                ticketsPendientes,
                totalUsuarios
            }
        };

    } catch (error) {
        console.error('❌ Error en obtenerResumenService:', error);
        return {
            error: true,
            codigo: 500,
            mensaje: 'Error al obtener resumen',
            detalles: error.message
        };
    }
}

/**
 * Servicio para obtener tickets agrupados por estado
 * @returns {Promise<Object>} Objeto con array de estados y cantidades
 */
export async function obtenerTicketsPorEstadoService() {
    try {
        const datos = await estadisticasModel.obtenerTicketsPorEstado();
        return { error: false, datos };

    } catch (error) {
        console.error('❌ Error en obtenerTicketsPorEstadoService:', error);
        return {
            error: true,
            codigo: 500,
            mensaje: 'Error al obtener tickets por estado',
            detalles: error.message
        };
    }
}

/**
 * Servicio para obtener tickets agrupados por usuario
 * @returns {Promise<Object>} Objeto con array de usuarios y cantidades
 */
export async function obtenerTicketsPorUsuarioService() {
    try {
        const datos = await estadisticasModel.obtenerTicketsPorUsuario();
        return { error: false, datos };

    } catch (error) {
        console.error('❌ Error en obtenerTicketsPorUsuarioService:', error);
        return {
            error: true,
            codigo: 500,
            mensaje: 'Error al obtener tickets por usuario',
            detalles: error.message
        };
    }
}

/**
 * Servicio para obtener usuarios agrupados por rol
 * @returns {Promise<Object>} Objeto con array de roles y cantidades
 */
export async function obtenerUsuariosPorRolService() {
    try {
        const datos = await estadisticasModel.obtenerUsuariosPorRol();
        return { error: false, datos };

    } catch (error) {
        console.error('❌ Error en obtenerUsuariosPorRolService:', error);
        return {
            error: true,
            codigo: 500,
            mensaje: 'Error al obtener usuarios por rol',
            detalles: error.message
        };
    }
}

/**
 * Servicio para obtener todas las estadísticas generales del dashboard
 * @returns {Promise<Object>} Objeto con todas las estadísticas para el dashboard
 */
export async function obtenerEstadisticasGeneralesService() {
    try {
        // Obtener todos los datos necesarios
        const total = await estadisticasModel.obtenerTotalTickets();
        const nuevos = await estadisticasModel.obtenerTicketsNuevos();
        const resueltosHoy = await estadisticasModel.obtenerTicketsResueltosHoy();
        const promedioSolucion = await estadisticasModel.obtenerPromedioResolucion();
        const porEstado = await estadisticasModel.obtenerTicketsPorEstadoDetallado();
        const ticketsPorDiaRows = await estadisticasModel.obtenerTicketsPorDia();

        // Convertir array a objeto { '10/12/2025': 5 }
        const ticketsPorDia = {};
        ticketsPorDiaRows.forEach(row => {
            ticketsPorDia[row.dia] = row.cantidad;
        });

        return {
            error: false,
            datos: {
                total,
                nuevos,
                resueltosHoy,
                promedioSolucion,
                porEstado,
                ticketsPorDia
            }
        };

    } catch (error) {
        console.error('❌ Error en obtenerEstadisticasGeneralesService:', error);
        return {
            error: true,
            codigo: 500,
            mensaje: 'Error al obtener estadísticas generales',
            detalles: error.message
        };
    }
}
