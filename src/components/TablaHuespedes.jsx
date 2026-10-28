import { useState } from "react";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import {
  guardarClientes,
  obtenerClientes,
} from "../utils/clientes";

function cargarHuespedes() {
  try {
    const clientes = obtenerClientes();
    const reservasGuardadas = localStorage.getItem("reservasHotel");
    const reservas = reservasGuardadas ? JSON.parse(reservasGuardadas) : [];

    if (!Array.isArray(reservas)) {
      throw new Error("Las reservas guardadas no tienen un formato válido.");
    }

    return {
      huespedes: clientes.map((cliente) => ({
        id: cliente.id,
        nombre: cliente.nombre,
        correo: cliente.correo,
        telefono: cliente.telefono || "",
        direccion: cliente.direccion || "",
        activo: cliente.activo !== false,
        reservas: reservas.filter(
          (reserva) =>
            reserva && String(reserva.clienteId) === String(cliente.id)
        ),
      })),
      error: "",
    };
  } catch {
    return {
      huespedes: [],
      error: "No fue posible leer los huéspedes o sus reservas guardadas.",
    };
  }
}

function DetalleHuesped({ data }) {
  return (
    <div className="p-3 bg-light border-bottom">
      <p className="mb-3">
        <strong>Dirección:</strong> {data.direccion || "No registrada"}
      </p>
      {data.reservas.length === 0 ? (
        <p className="text-secondary mb-0">
          No hay reservas asociadas a este huésped.
        </p>
      ) : (
        <div className="table-responsive">
          <table className="table table-sm table-hover align-middle mb-0">
            <thead>
              <tr>
                <th scope="col">Código</th>
                <th scope="col">Habitación</th>
                <th scope="col">Entrada</th>
                <th scope="col">Salida</th>
                <th scope="col">Estado</th>
              </tr>
            </thead>
            <tbody>
              {data.reservas.map((reserva, indice) => (
                <tr key={reserva.id ?? `${data.id}-${indice}`}>
                  <td>{reserva.id ?? "—"}</td>
                  <td>{reserva.habitacion || "—"}</td>
                  <td>{reserva.entrada || "—"}</td>
                  <td>{reserva.salida || "—"}</td>
                  <td>{reserva.estado || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function TablaHuespedes() {
  const [datos, setDatos] = useState(cargarHuespedes);
  const [busqueda, setBusqueda] = useState("");
  const termino = busqueda.trim().toLocaleLowerCase();

  const cambiarEstado = async (huesped) => {
    const nuevoEstado = huesped.activo === false;
    const accion = nuevoEstado ? "activar" : "inactivar";
    const resultado = await Swal.fire({
      icon: "question",
      title: `¿Deseas ${accion} a este huésped?`,
      text: nuevoEstado
        ? "Podrá volver a iniciar sesión y realizar reservas."
        : "No podrá iniciar sesión ni crear o modificar reservas.",
      showCancelButton: true,
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: "Cancelar",
      confirmButtonColor: nuevoEstado ? "#198754" : "#dc3545",
    });

    if (!resultado.isConfirmed) {
      return;
    }

    try {
      const clientes = obtenerClientes();
      let clienteEncontrado = false;
      const clientesActualizados = clientes.map((cliente) => {
        if (cliente.id !== huesped.id) {
          return cliente;
        }
        clienteEncontrado = true;
        return { ...cliente, activo: nuevoEstado };
      });

      if (!clienteEncontrado) {
        throw new Error("No se encontró la cuenta del huésped.");
      }

      guardarClientes(clientesActualizados);
      setDatos((actuales) => ({
        ...actuales,
        huespedes: actuales.huespedes.map((registro) =>
          registro.id === huesped.id
            ? { ...registro, activo: nuevoEstado }
            : registro
        ),
      }));
      await Swal.fire({
        icon: "success",
        title: `Huésped ${nuevoEstado ? "activado" : "inactivado"}`,
        timer: 1600,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "No se pudo actualizar el estado",
        text: "No fue posible guardar el cambio en este navegador.",
        confirmButtonColor: "#344c5c",
      });
    }
  };

  const huespedesFiltrados = datos.huespedes.filter((huesped) =>
    [huesped.nombre, huesped.correo].some((dato) =>
      dato.toLocaleLowerCase().includes(termino)
    )
  );

  const columnas = [
    {
      name: "Huésped",
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
      selector: (fila) => fila.telefono || "No registrado",
    },
    {
      name: "Reservas",
      selector: (fila) => fila.reservas.length,
      sortable: true,
    },
    {
      name: "Estado",
      selector: (fila) => (fila.activo ? "Activo" : "Inactivo"),
      sortable: true,
      cell: (fila) => (
        <span className={`badge ${fila.activo ? "bg-success" : "bg-secondary"}`}>
          {fila.activo ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      name: "Acciones",
      cell: (fila) => (
        <button
          type="button"
          className={`btn btn-sm ${fila.activo ? "btn-outline-danger" : "btn-outline-success"}`}
          title={fila.activo ? "Inactivar huésped" : "Activar huésped"}
          aria-label={fila.activo ? "Inactivar huésped" : "Activar huésped"}
          onClick={() => cambiarEstado(fila)}
        >
          <i
            className={`bi ${fila.activo ? "bi-person-slash" : "bi-person-check"} me-1`}
            aria-hidden="true"
          ></i>
          {fila.activo ? "Inactivar" : "Activar"}
        </button>
      ),
    },
  ];

  return (
    <section className="hp-panel">
      <div className="hp-panel-header">
        <div>
          <h2>Gestión de huéspedes</h2>
          <p>Consulta las cuentas registradas y sus reservas asociadas.</p>
        </div>
        <span className="hp-demo-tag">
          {datos.huespedes.length} registrados
        </span>
      </div>

      {datos.error && (
        <div className="alert alert-warning" role="alert">
          {datos.error}
        </div>
      )}

      <label className="visually-hidden" htmlFor="buscar-huespedes">
        Buscar huésped por nombre o correo
      </label>
      <input
        id="buscar-huespedes"
        type="search"
        className="form-control mb-3"
        placeholder="Buscar por nombre o correo..."
        value={busqueda}
        onChange={(evento) => setBusqueda(evento.target.value)}
      />

      <DataTable
        columns={columnas}
        data={huespedesFiltrados}
        keyField="id"
        pagination
        highlightOnHover
        striped
        responsive
        expandableRows
        expandableRowsComponent={DetalleHuesped}
        noDataComponent={
          termino
            ? "No hay huéspedes que coincidan con la búsqueda"
            : "No hay huéspedes registrados"
        }
      />
    </section>
  );
}

export default TablaHuespedes;