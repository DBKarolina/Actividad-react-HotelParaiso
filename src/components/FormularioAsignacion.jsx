import { useState } from "react";

const TIPOS_TAREA = [
  "Recepción",
  "Limpieza",
  "Mantenimiento",
  "Preparación de alimentos",
  "Inspección",
  "Otra",
];

function FormularioAsignacion({ asignacion, empleados, guardar, cancelar }) {
  const [formulario, setFormulario] = useState({
    empleadoId: asignacion?.empleadoId ?? "",
    tipoTarea: asignacion?.tipoTarea ?? "",
    ubicacion: asignacion?.ubicacion ?? "",
    fecha: asignacion?.fecha ?? "",
    horaInicio: asignacion?.horaInicio ?? "",
    horaFin: asignacion?.horaFin ?? "",
    estado: asignacion?.estado ?? "Pendiente",
  });
  const [error, setError] = useState("");

  const manejarCambio = (evento) => {
    setFormulario({
      ...formulario,
      [evento.target.name]: evento.target.value,
    });
    setError("");
  };

  const manejarEnvio = (evento) => {
    evento.preventDefault();

    if (formulario.horaFin <= formulario.horaInicio) {
      setError("La hora de finalización debe ser posterior a la de inicio.");
      return;
    }

    guardar({
      ...formulario,
      tipoTarea: formulario.tipoTarea.trim(),
      ubicacion: formulario.ubicacion.trim(),
    });
  };

  return (
    <form onSubmit={manejarEnvio}>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label" htmlFor="asignacion-empleado">
            Empleado
          </label>
          <select
            id="asignacion-empleado"
            className="form-select"
            name="empleadoId"
            value={formulario.empleadoId}
            onChange={manejarCambio}
            required
          >
            <option value="">Selecciona un empleado activo</option>
            {empleados.map((empleado) => (
              <option
                key={empleado.id}
                value={empleado.id}
                disabled={empleado.estado !== "Activo"}
              >
                {empleado.nombre}
                {empleado.estado !== "Activo" ? " (Inactivo)" : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label" htmlFor="asignacion-tipo">
            Tipo de tarea
          </label>
          <select
            id="asignacion-tipo"
            className="form-select"
            name="tipoTarea"
            value={formulario.tipoTarea}
            onChange={manejarCambio}
            required
          >
            <option value="">Selecciona un tipo</option>
            {TIPOS_TAREA.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12 mb-3">
          <label className="form-label" htmlFor="asignacion-ubicacion">
            Piso, habitación o área (opcional)
          </label>
          <input
            id="asignacion-ubicacion"
            className="form-control"
            name="ubicacion"
            type="text"
            maxLength={80}
            placeholder="Ej. Piso 2, habitación 204 o cocina"
            value={formulario.ubicacion}
            onChange={manejarCambio}
          />
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label" htmlFor="asignacion-fecha">
            Fecha
          </label>
          <input
            id="asignacion-fecha"
            className="form-control"
            name="fecha"
            type="date"
            value={formulario.fecha}
            onChange={manejarCambio}
            required
          />
        </div>
        <div className="col-md-3 mb-3">
          <label className="form-label" htmlFor="asignacion-inicio">
            Hora de inicio
          </label>
          <input
            id="asignacion-inicio"
            className="form-control"
            name="horaInicio"
            type="time"
            value={formulario.horaInicio}
            onChange={manejarCambio}
            required
          />
        </div>
        <div className="col-md-3 mb-3">
          <label className="form-label" htmlFor="asignacion-fin">
            Hora de finalización
          </label>
          <input
            id="asignacion-fin"
            className="form-control"
            name="horaFin"
            type="time"
            value={formulario.horaFin}
            onChange={manejarCambio}
            required
          />
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label" htmlFor="asignacion-estado">
            Estado
          </label>
          <select
            id="asignacion-estado"
            className="form-select"
            name="estado"
            value={formulario.estado}
            onChange={manejarCambio}
            required
          >
            <option value="Pendiente">Pendiente</option>
            <option value="En curso">En curso</option>
            <option value="Finalizada">Finalizada</option>
            <option value="Cancelada">Cancelada</option>
          </select>
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={cancelar}
        >
          Cerrar
        </button>
        <button
          type="submit"
          className="btn text-white"
          style={{ backgroundColor: "#344c5c" }}
        >
          <i className="bi bi-check-circle me-2" aria-hidden="true"></i>
          Guardar asignación
        </button>
      </div>
    </form>
  );
}

export default FormularioAsignacion;