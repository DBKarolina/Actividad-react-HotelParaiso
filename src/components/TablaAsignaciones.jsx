import { useState } from "react";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import FormularioAsignacion from "./FormularioAsignacion";
import {
  cancelarAsignacion,
  guardarAsignacion,
  obtenerAsignaciones,
} from "../utils/asignaciones";
import { obtenerEmpleados } from "../utils/empleados";

function cargarDatos() {
  try {
    return {
      empleados: obtenerEmpleados(),
      asignaciones: obtenerAsignaciones(),
      error: "",
    };
  } catch {
    return {
      empleados: [],
      asignaciones: [],
      error: "No se pudieron leer los empleados o las asignaciones guardadas.",
    };
  }
}

function TablaAsignaciones() {
  const [datosIniciales] = useState(cargarDatos);
  const [empleados] = useState(datosIniciales.empleados);
  const [asignaciones, setAsignaciones] = useState(datosIniciales.asignaciones);
  const [errorCarga] = useState(datosIniciales.error);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [asignacionEditando, setAsignacionEditando] = useState(null);

  const mostrarError = (error) => {
    Swal.fire({
      icon: "error",
      title: "No se pudo guardar la asignación",
      text: error.message || "Inténtalo nuevamente.",
      confirmButtonColor: "#344c5c",
    });
  };

  const guardar = (datos) => {
    try {
      const actualizadas = guardarAsignacion(datos, asignacionEditando?.id);
      setAsignaciones(actualizadas);
      setMostrarFormulario(false);
      setAsignacionEditando(null);
      Swal.fire({
        icon: "success",
        title: asignacionEditando ? "Asignación actualizada" : "Tarea asignada",
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (error) {
      mostrarError(error);
    }
  };

  const cancelar = async (asignacion) => {
    const resultado = await Swal.fire({
      icon: "warning",
      title: "¿Cancelar esta asignación?",
      text: "El registro se conservará con estado Cancelada.",
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar tarea",
      cancelButtonText: "Volver",
      confirmButtonColor: "#dc3545",
    });

    if (!resultado.isConfirmed) {
      return;
    }

    try {
      setAsignaciones(cancelarAsignacion(asignacion.id));
    } catch (error) {
      mostrarError(error);
    }
  };

  const columnas = [
    {
      name: "Empleado",
      selector: (fila) => fila.empleadoNombre,
      sortable: true,
    },
    {
      name: "Tarea",
      selector: (fila) => fila.tipoTarea,
      sortable: true,
    },
    {
      name: "Piso / habitación",
      selector: (fila) => fila.ubicacion || "—",
    },
    {
      name: "Fecha",
      selector: (fila) => fila.fecha,
      sortable: true,
    },
    {
      name: "Horario",
      selector: (fila) => `${fila.horaInicio} - ${fila.horaFin}`,
      sortable: true,
    },
    {
      name: "Estado",
      selector: (fila) => fila.estado,
      sortable: true,
      cell: (fila) => {
        const claseEstado = {
          Pendiente: "bg-warning text-dark",
          "En curso": "bg-primary",
          Finalizada: "bg-success",
          Cancelada: "bg-secondary",
        }[fila.estado];
        return <span className={`badge ${claseEstado}`}>{fila.estado}</span>;
      },
    },
    {
      name: "Acciones",
      cell: (fila) => (
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            title="Editar asignación"
            aria-label={`Editar tarea de ${fila.empleadoNombre}`}
            onClick={() => {
              setAsignacionEditando(fila);
              setMostrarFormulario(true);
            }}
          >
            <i className="bi bi-pencil-square" aria-hidden="true"></i>
          </button>
          {fila.estado !== "Cancelada" && (
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              title="Cancelar asignación"
              aria-label={`Cancelar tarea de ${fila.empleadoNombre}`}
              onClick={() => cancelar(fila)}
            >
              <i className="bi bi-x-circle" aria-hidden="true"></i>
            </button>
          )}
        </div>
      ),
    },
  ];

  const termino = busqueda.trim().toLocaleLowerCase();
  const asignacionesFiltradas = asignaciones.filter((asignacion) =>
    [
      asignacion.empleadoNombre,
      asignacion.tipoTarea,
      asignacion.ubicacion,
      asignacion.estado,
    ].some((valor) => valor.toLocaleLowerCase().includes(termino))
  );
  const empleadosParaFormulario = empleados.filter(
    (empleado) =>
      empleado.estado === "Activo" ||
      empleado.id === asignacionEditando?.empleadoId
  );

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setAsignacionEditando(null);
  };

  return (
    <section className="hp-panel">
      <div className="hp-panel-header">
        <div>
          <h2>Asignación de tareas</h2>
          <p>Programa tareas y consulta los horarios del personal.</p>
        </div>
        <button
          type="button"
          className="btn text-white"
          style={{ backgroundColor: "#344c5c" }}
          disabled={Boolean(errorCarga) || !empleados.some((empleado) => empleado.estado === "Activo")}
          onClick={() => {
            setAsignacionEditando(null);
            setMostrarFormulario(true);
          }}
        >
          <i className="bi bi-calendar-plus me-2" aria-hidden="true"></i>
          Asignar tarea
        </button>
      </div>

      {errorCarga && (
        <div className="alert alert-warning" role="alert">
          {errorCarga}
        </div>
      )}

      {!errorCarga && empleados.length === 0 && (
        <div className="alert alert-info" role="status">
          Registra empleados activos antes de asignar tareas.
        </div>
      )}

      {mostrarFormulario && (
        <div className="card p-3 p-md-4 mb-4">
          <h3 className="h5 mb-3">
            {asignacionEditando ? "Editar asignación" : "Nueva asignación"}
          </h3>
          <FormularioAsignacion
            key={asignacionEditando?.id ?? "nueva"}
            asignacion={asignacionEditando}
            empleados={empleadosParaFormulario}
            guardar={guardar}
            cancelar={cerrarFormulario}
          />
        </div>
      )}

      <label className="visually-hidden" htmlFor="buscar-asignaciones">
        Buscar asignación
      </label>
      <input
        id="buscar-asignaciones"
        type="search"
        className="form-control mb-3"
        placeholder="Buscar por empleado, tarea, ubicación o estado..."
        value={busqueda}
        onChange={(evento) => setBusqueda(evento.target.value)}
      />

      <DataTable
        columns={columnas}
        data={asignacionesFiltradas}
        keyField="id"
        pagination
        highlightOnHover
        striped
        responsive
        noDataComponent="No hay asignaciones registradas"
      />
    </section>
  );
}

export default TablaAsignaciones;