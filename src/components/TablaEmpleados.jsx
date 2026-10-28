import { useState } from "react";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import FormularioEmpleado from "./FormularioEmpleado";
import { guardarEmpleados, obtenerEmpleados } from "../utils/empleados";

function TablaEmpleados() {
  const [estadoInicial] = useState(() => {
    try {
      return { empleados: obtenerEmpleados(), error: "" };
    } catch {
      return {
        empleados: [],
        error: "No se pudieron leer los empleados guardados en este navegador.",
      };
    }
  });
  const [empleados, setEmpleados] = useState(estadoInicial.empleados);
  const [errorCarga, setErrorCarga] = useState(estadoInicial.error);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [empleadoEditando, setEmpleadoEditando] = useState(null);

  const guardarCambios = (empleadosActualizados, mensaje) => {
    try {
      guardarEmpleados(empleadosActualizados);
      setEmpleados(empleadosActualizados);
      setErrorCarga("");
      setMostrarFormulario(false);
      setEmpleadoEditando(null);
      Swal.fire({
        icon: "success",
        title: mensaje,
        timer: 1800,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "No se pudieron guardar los cambios",
        text: "Revisa el almacenamiento de este navegador e inténtalo nuevamente.",
        confirmButtonColor: "#344c5c",
      });
    }
  };

  const guardarEmpleado = (datos) => {
    if (empleadoEditando) {
      const empleadosActualizados = empleados.map((registro) =>
        registro.id === empleadoEditando.id
          ? { ...registro, ...datos }
          : registro
      );
      guardarCambios(empleadosActualizados, "Empleado actualizado");
      return;
    }

    const nuevoEmpleado = {
      id: crypto.randomUUID(),
      ...datos,
      estado: "Activo",
    };
    guardarCambios([...empleados, nuevoEmpleado], "Empleado registrado");
  };

  const cambiarEstado = async (empleado) => {
    const nuevoEstado = empleado.estado === "Activo" ? "Inactivo" : "Activo";
    const accion = nuevoEstado === "Activo" ? "activar" : "inhabilitar";
    const resultado = await Swal.fire({
      icon: "question",
      title: `¿Deseas ${accion} a ${empleado.nombre}?`,
      text:
        nuevoEstado === "Activo"
          ? "El empleado volverá a figurar como activo."
          : "El registro se conservará y no será eliminado.",
      showCancelButton: true,
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: "Cancelar",
      confirmButtonColor: nuevoEstado === "Activo" ? "#198754" : "#dc3545",
    });

    if (resultado.isConfirmed) {
      const empleadosActualizados = empleados.map((registro) =>
        registro.id === empleado.id
          ? { ...registro, estado: nuevoEstado }
          : registro
      );
      guardarCambios(
        empleadosActualizados,
        `Empleado ${nuevoEstado === "Activo" ? "activado" : "inhabilitado"}`
      );
    }
  };

  const columnas = [
    {
      name: "Documento",
      selector: (fila) => fila.documento,
      sortable: true,
    },
    {
      name: "Nombre",
      selector: (fila) => fila.nombre,
      sortable: true,
    },
    {
      name: "Correo",
      selector: (fila) => fila.correo,
      sortable: true,
    },
    {
      name: "Teléfono",
      selector: (fila) => fila.telefono,
    },
    {
      name: "Cargo",
      selector: (fila) => fila.cargo,
      sortable: true,
    },
    {
      name: "Estado",
      selector: (fila) => fila.estado,
      sortable: true,
      cell: (fila) => (
        <span
          className={`badge ${fila.estado === "Activo" ? "bg-success" : "bg-secondary"}`}
        >
          {fila.estado}
        </span>
      ),
    },
    {
      name: "Acciones",
      width: "116px",
      cell: (fila) => (
        <div className="employee-actions">
          <button
            type="button"
            className="btn btn-sm btn-outline-primary employee-action-button"
            title="Editar empleado"
            aria-label={`Editar a ${fila.nombre}`}
            onClick={() => {
              setEmpleadoEditando(fila);
              setMostrarFormulario(true);
            }}
          >
            <i className="bi bi-pencil-square" aria-hidden="true"></i>
          </button>
          <button
            type="button"
            className={`btn btn-sm employee-action-button ${fila.estado === "Activo" ? "btn-outline-danger" : "btn-outline-success"}`}
            title={fila.estado === "Activo" ? "Inhabilitar empleado" : "Activar empleado"}
            aria-label={fila.estado === "Activo" ? `Inhabilitar a ${fila.nombre}` : `Activar a ${fila.nombre}`}
            onClick={() => cambiarEstado(fila)}
          >
            <i
              className={`bi ${fila.estado === "Activo" ? "bi-person-dash" : "bi-person-check"}`}
              aria-hidden="true"
            ></i>
          </button>
        </div>
      ),
    },
  ];

  const termino = busqueda.trim().toLocaleLowerCase();
  const empleadosFiltrados = empleados.filter((empleado) =>
    [empleado.nombre, empleado.documento, empleado.cargo].some((valor) =>
      valor.toLocaleLowerCase().includes(termino)
    )
  );

  const cancelarFormulario = () => {
    setMostrarFormulario(false);
    setEmpleadoEditando(null);
  };

  return (
    <section className="hp-panel employee-panel">
      <div className="hp-panel-header employee-panel-header">
        <div>
          <h2>Gestión de empleados</h2>
          <p>Administra la información y el estado del personal del hotel.</p>
        </div>
        <button
          type="button"
          className="btn text-white"
          style={{ backgroundColor: "#344c5c" }}
          onClick={() => {
            setEmpleadoEditando(null);
            setMostrarFormulario(true);
          }}
          disabled={Boolean(errorCarga)}
        >
          <i className="bi bi-person-plus me-2" aria-hidden="true"></i>
          Nuevo empleado
        </button>
      </div>

      {errorCarga && (
        <div className="alert alert-warning" role="alert">
          {errorCarga}
        </div>
      )}

      {mostrarFormulario && (
        <div className="card p-3 p-md-4 mb-4">
          <h3 className="h5 mb-3">
            {empleadoEditando ? "Editar empleado" : "Registrar empleado"}
          </h3>
          <FormularioEmpleado
            key={empleadoEditando?.id ?? "nuevo"}
            empleado={empleadoEditando}
            empleados={empleados}
            guardar={guardarEmpleado}
            cancelar={cancelarFormulario}
          />
        </div>
      )}

      <label className="visually-hidden" htmlFor="buscar-empleados">
        Buscar por nombre, documento o cargo
      </label>
      <input
        id="buscar-empleados"
        type="search"
        className="form-control mb-3"
        placeholder="Buscar por nombre, documento o cargo..."
        value={busqueda}
        onChange={(evento) => setBusqueda(evento.target.value)}
      />

      <div className="employee-table-wrap">
        <DataTable
          columns={columnas}
          data={empleadosFiltrados}
          keyField="id"
          pagination
          highlightOnHover
          striped
          responsive
          noDataComponent={
            termino
              ? "No hay empleados que coincidan con la búsqueda"
              : "No hay empleados registrados"
          }
        />
      </div>
    </section>
  );
}

export default TablaEmpleados;