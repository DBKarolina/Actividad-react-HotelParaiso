import { obtenerEmpleados } from "./empleados";

export const CLAVE_ASIGNACIONES = "asignacionesEmpleados";

const ESTADOS_ASIGNACION = ["Pendiente", "En curso", "Finalizada", "Cancelada"];

export function obtenerAsignaciones() {
  const guardadas = localStorage.getItem(CLAVE_ASIGNACIONES);

  if (!guardadas) {
    return [];
  }

  const asignaciones = JSON.parse(guardadas);
  if (
    !Array.isArray(asignaciones) ||
    asignaciones.some(
      (asignacion) =>
        !asignacion ||
        typeof asignacion.id !== "string" ||
        typeof asignacion.empleadoId !== "string" ||
        typeof asignacion.empleadoNombre !== "string" ||
        typeof asignacion.tipoTarea !== "string" ||
        typeof asignacion.ubicacion !== "string" ||
        typeof asignacion.fecha !== "string" ||
        typeof asignacion.horaInicio !== "string" ||
        typeof asignacion.horaFin !== "string" ||
        !ESTADOS_ASIGNACION.includes(asignacion.estado)
    )
  ) {
    throw new Error("Los datos guardados de asignaciones no son válidos.");
  }

  return asignaciones;
}

export function guardarAsignaciones(asignaciones) {
  localStorage.setItem(CLAVE_ASIGNACIONES, JSON.stringify(asignaciones));
}

export function guardarAsignacion(datos, asignacionId = null) {
  const empleados = obtenerEmpleados();
  const empleado = empleados.find(
    (registro) =>
      registro.id === datos.empleadoId && registro.estado === "Activo"
  );

  if (!empleado) {
    throw new Error("No se pueden asignar tareas a un empleado inactivo.");
  }

  if (
    !datos.fecha ||
    !datos.horaInicio ||
    !datos.horaFin ||
    datos.horaFin <= datos.horaInicio
  ) {
    throw new Error("Verifica la fecha y el horario de la asignación.");
  }

  const asignaciones = obtenerAsignaciones();
  const existente = asignacionId
    ? asignaciones.find((asignacion) => asignacion.id === asignacionId)
    : null;

  if (asignacionId && !existente) {
    throw new Error("No se encontró la asignación que intentas editar.");
  }

  const conflicto =
    datos.estado !== "Cancelada" &&
    asignaciones.some(
      (asignacion) =>
        asignacion.id !== asignacionId &&
        asignacion.empleadoId === empleado.id &&
        asignacion.fecha === datos.fecha &&
        asignacion.estado !== "Cancelada" &&
        datos.horaInicio < asignacion.horaFin &&
        datos.horaFin > asignacion.horaInicio
    );

  if (conflicto) {
    throw new Error(
      "Conflicto de horario: este empleado ya tiene una tarea que se superpone."
    );
  }

  const asignacionActualizada = {
    ...datos,
    id: asignacionId ?? crypto.randomUUID(),
    empleadoId: empleado.id,
    empleadoNombre: empleado.nombre,
  };
  const actualizadas = existente
    ? asignaciones.map((asignacion) =>
        asignacion.id === asignacionId ? asignacionActualizada : asignacion
      )
    : [...asignaciones, asignacionActualizada];

  guardarAsignaciones(actualizadas);
  return actualizadas;
}

export function cancelarAsignacion(asignacionId) {
  const asignaciones = obtenerAsignaciones();
  const actualizadas = asignaciones.map((asignacion) =>
    asignacion.id === asignacionId
      ? { ...asignacion, estado: "Cancelada" }
      : asignacion
  );

  guardarAsignaciones(actualizadas);
  return actualizadas;
}