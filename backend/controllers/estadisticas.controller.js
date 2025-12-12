import * as estadisticasService from '../services/estadisticas.service.js';

export const getResumen = async (req, res) => {
  try {
    const resultado = await estadisticasService.obtenerResumenService();

    if (resultado.error) {
      return res.status(resultado.codigo).json({
        message: resultado.mensaje,
        error: resultado.detalles
      });
    }

    res.json(resultado.datos);

  } catch (error) {
    res.status(500).json({ message: 'Error al obtener resumen', error: error.message });
  }
};

export const getTicketsPorEstado = async (req, res) => {
  try {
    const resultado = await estadisticasService.obtenerTicketsPorEstadoService();

    if (resultado.error) {
      return res.status(resultado.codigo).json({
        message: resultado.mensaje,
        error: resultado.detalles
      });
    }

    res.json(resultado.datos);

  } catch (error) {
    res.status(500).json({ message: 'Error al obtener tickets por estado', error: error.message });
  }
};

export const getTicketsPorUsuario = async (req, res) => {
  try {
    const resultado = await estadisticasService.obtenerTicketsPorUsuarioService();

    if (resultado.error) {
      return res.status(resultado.codigo).json({
        message: resultado.mensaje,
        error: resultado.detalles
      });
    }

    res.json(resultado.datos);

  } catch (error) {
    res.status(500).json({ message: 'Error al obtener tickets por usuario', error: error.message });
  }
};

export const getUsuariosPorRol = async (req, res) => {
  try {
    const resultado = await estadisticasService.obtenerUsuariosPorRolService();

    if (resultado.error) {
      return res.status(resultado.codigo).json({
        message: resultado.mensaje,
        error: resultado.detalles
      });
    }

    res.json(resultado.datos);

  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios por rol', error: error.message });
  }
};

export const getEstadisticasGenerales = async (req, res) => {
  try {
    const resultado = await estadisticasService.obtenerEstadisticasGeneralesService();

    if (resultado.error) {
      return res.status(resultado.codigo).json({
        message: resultado.mensaje,
        error: resultado.detalles
      });
    }

    res.json(resultado.datos);

  } catch (error) {
    console.error("❌ Error estadísticas:", error);
    res.status(500).json({
      message: "Error al obtener estadísticas generales",
      error: error.message
    });
  }
};

