import * as catalogos from '../services/catalogos.service.js';
export async function obtenerCargos(req, res) {
  try {
    const data = await catalogos.obtenerCargosService();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error al obtener cargos:", error);
    res.status(500).json({ mensaje: "Error al obtener cargos" });
  }
}

export async function obtenerOficinas(req, res) {
  try {
    const data = await catalogos.obtenerOficinasService();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error al obtener oficinas:", error);
    res.status(500).json({ mensaje: "Error al obtener oficinas" });
  }
}

export async function obtenerDepartamentos(req, res) {
  try {
    const data = await catalogos.obtenerDepartamentosService();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error al obtener departamentos:", error);
    res.status(500).json({ mensaje: "Error al obtener departamentos" });
  }
}

export async function obtenerGerencias(req, res) {
  try {
    const data = await catalogos.obtenerGerenciasService();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error al obtener gerencias:", error);
    res.status(500).json({ mensaje: "Error al obtener gerencias" });
  }
}