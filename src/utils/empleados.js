export const CLAVE_EMPLEADOS = "empleadosHotel";
export const CARGOS_EMPLEADO = [
  "Recepción",
  "Limpieza",
  "Mantenimiento",
  "Cocina",
  "Administración",
];

export function obtenerEmpleados() {
  const guardados = localStorage.getItem(CLAVE_EMPLEADOS);

  if (!guardados) {
    return [];
  }

  const empleados = JSON.parse(guardados);
  if (
    !Array.isArray(empleados) ||
    empleados.some(
      (empleado) =>
        !empleado ||
        typeof empleado.id !== "string" ||
        typeof empleado.documento !== "string" ||
        typeof empleado.nombre !== "string" ||
        typeof empleado.correo !== "string" ||
        typeof empleado.telefono !== "string" ||
        typeof empleado.cargo !== "string" ||
        (empleado.password !== undefined &&
          typeof empleado.password !== "string") ||
        !["Activo", "Inactivo"].includes(empleado.estado)
    )
  ) {
    throw new Error("Los datos guardados de empleados no son válidos.");
  }

  return empleados;
}

export function guardarEmpleados(empleados) {
  localStorage.setItem(CLAVE_EMPLEADOS, JSON.stringify(empleados));
}