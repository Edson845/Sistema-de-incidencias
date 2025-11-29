import * as catalogos from '../models/catalagos.model.js';
export async function obtenerCargosService() {
  return await catalogos.obtenerCargosModel();
}

export async function obtenerOficinasService() {
  return await catalogos.obtenerOficinasModel();
}

export async function obtenerDepartamentosService() {
  return await catalogos.obtenerDepartamentosModel();
}

export async function obtenerGerenciasService() {
  return await catalogos.obtenerGerenciasModel();
}