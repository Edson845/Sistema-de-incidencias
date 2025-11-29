import pool from '../db.js';

export async function obtenerCargosModel() {
  const [rows] = await pool.query(`SELECT idCargo, nombreCargo FROM cargo ORDER BY idCargo`);
  return rows;
}

export async function obtenerOficinasModel() {
  const [rows] = await pool.query(`SELECT idOficina, nombreOficina FROM oficina ORDER BY idOficina`);
  return rows;
}

export async function obtenerDepartamentosModel() {
  const [rows] = await pool.query(`SELECT idDepartamento, nombreDepartamento FROM departamento ORDER BY idDepartamento`);
  return rows;
}

export async function obtenerGerenciasModel() {
  const [rows] = await pool.query(`SELECT idGerencia, nombreGerencia FROM gerencias ORDER BY idGerencia`);
  return rows;
}
