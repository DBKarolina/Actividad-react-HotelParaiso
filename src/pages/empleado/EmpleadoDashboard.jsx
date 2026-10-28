import { useState } from "react";
import DataTable from "react-data-table-component";
import Sidebar from "../../components/Sidebar";
import { obtenerAsignaciones } from "../../utils/asignaciones";
import "../admin/Dashboard.css";

function cargarAsignacionesEmpleado(empleadoId) {
  try {
    return {
      asignaciones: obtenerAsignaciones().filter(
        (asignacion) => asignacion.empleadoId === empleadoId
      ),
      error: "",
    };
  } catch {
    return {
      asignaciones: [],
      error: "No se pudieron leer tus tareas. Actualiza el panel e inténtalo nuevamente.",
    };
  }
}

function EmpleadoDashboard({ onLogout, empleado }) {
  const [seccion, setSeccion] = useState("Mis tareas");
  const [estadoInicial] = useState(() =>
    cargarAsignacionesEmpleado(empleado.id)
  );
  const columnas = [
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
      name: "Inicio",
      selector: (fila) => fila.horaInicio,
      sortable: true,
    },
    {
      name: "Finalización",
      selector: (fila) => fila.horaFin,
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
  ];

  return (
    <div className="hp-dashboard">
      <Sidebar
        titulo="Espacio del empleado"
        opciones={["Mis tareas"]}
        seccion={seccion}
        cambiarSeccion={setSeccion}
        cerrarSesion={onLogout}
      />
      <main className="hp-main">
        <header className="hp-header">
          <div>
            <p className="hp-eyebrow">PANEL DEL EMPLEADO</p>
            <h1>{seccion}</h1>
            <p className="hp-subtitle">
              Consulta tus asignaciones y el estado de cada tarea.
            </p>
          </div>
          <div className="hp-user">
            <span className="hp-avatar" aria-hidden="true">
              {empleado.nombre.charAt(0).toUpperCase()}
            </span>
            <span>{empleado.nombre}</span>
          </div>
        </header>

        <section className="hp-panel">
          <div className="hp-panel-header">
            <div>
              <h2>Mis tareas</h2>
              <p>{empleado.cargo}</p>
            </div>
            <span className="hp-demo-tag">
              {estadoInicial.asignaciones.length} asignaciones
            </span>
          </div>

          {estadoInicial.error && (
            <div className="alert alert-warning" role="alert">
              {estadoInicial.error}
            </div>
          )}

          <DataTable
            columns={columnas}
            data={estadoInicial.asignaciones}
            keyField="id"
            pagination
            highlightOnHover
            striped
            responsive
            noDataComponent="No tienes tareas asignadas"
          />
        </section>
        <footer className="hp-footer">Hotel Paraíso · Panel del empleado</footer>
      </main>
    </div>
  );
}

export default EmpleadoDashboard;
