import { useState } from "react";
import { normalizarCorreo, obtenerClientes } from "../utils/clientes";
import { CARGOS_EMPLEADO } from "../utils/empleados";

function FormularioEmpleado({ empleado, empleados, guardar, cancelar }) {
  const [formulario, setFormulario] = useState({
    documento: empleado?.documento ?? "",
    nombre: empleado?.nombre ?? "",
    correo: empleado?.correo ?? "",
    telefono: empleado?.telefono ?? "",
    cargo: empleado?.cargo ?? "",
    password: "",
    confirmarPassword: "",
  });
  const [error, setError] = useState("");
  const requierePassword = !empleado?.password;

  const manejarCambio = (evento) => {
    setFormulario({
      ...formulario,
      [evento.target.name]: evento.target.value,
    });
    setError("");
  };

  const manejarEnvio = (evento) => {
    evento.preventDefault();
    const datos = {
      documento: formulario.documento.trim(),
      nombre: formulario.nombre.trim(),
      correo: formulario.correo.trim().toLowerCase(),
      telefono: formulario.telefono.trim(),
      cargo: formulario.cargo.trim(),
    };
    const documentoNormalizado = datos.documento.toLocaleLowerCase();
    const correoNormalizado = normalizarCorreo(datos.correo);
    const documentoDuplicado = empleados.some(
      (registro) =>
        registro.id !== empleado?.id &&
        registro.documento.trim().toLocaleLowerCase() === documentoNormalizado
    );
    const correoDuplicado = empleados.some(
      (registro) =>
        registro.id !== empleado?.id &&
        registro.correo.trim().toLocaleLowerCase() === correoNormalizado
    );
    const digitosTelefono = datos.telefono.replace(/\D/g, "").length;

    let clientes;
    try {
      clientes = obtenerClientes();
    } catch {
      setError("No se pudo validar el correo contra las cuentas de clientes.");
      return;
    }

    if (!/^[\p{L}\p{N}][\p{L}\p{N} ./-]{3,19}$/u.test(datos.documento)) {
      setError("El documento debe tener entre 4 y 20 caracteres válidos.");
      return;
    }

    if (datos.nombre.length < 2) {
      setError("El nombre debe tener al menos 2 caracteres.");
      return;
    }

    if (documentoDuplicado) {
      setError("Ya existe un empleado con ese documento.");
      return;
    }

    if (correoDuplicado) {
      setError("Ya existe un empleado con ese correo.");
      return;
    }

    if (
      correoNormalizado === "admin@hotel.com" ||
      clientes.some(
        (cliente) => normalizarCorreo(cliente.correo) === correoNormalizado
      )
    ) {
      setError("Ese correo ya está reservado por otra cuenta del hotel.");
      return;
    }

    if (requierePassword && formulario.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (formulario.password && formulario.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (
      (requierePassword || formulario.password) &&
      formulario.password !== formulario.confirmarPassword
    ) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (digitosTelefono < 7 || digitosTelefono > 15) {
      setError("El teléfono debe contener entre 7 y 15 dígitos.");
      return;
    }

    if (formulario.password) {
      datos.password = formulario.password;
    }
    guardar(datos);
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
          <label className="form-label" htmlFor="empleado-documento">
            Documento
          </label>
          <input
            id="empleado-documento"
            className="form-control"
            name="documento"
            type="text"
            minLength={4}
            maxLength={20}
            autoComplete="off"
            value={formulario.documento}
            onChange={manejarCambio}
            required
          />
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label" htmlFor="empleado-nombre">
            Nombre completo
          </label>
          <input
            id="empleado-nombre"
            className="form-control"
            name="nombre"
            type="text"
            minLength={2}
            maxLength={80}
            autoComplete="name"
            value={formulario.nombre}
            onChange={manejarCambio}
            required
          />
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label" htmlFor="empleado-correo">
            Correo electrónico
          </label>
          <input
            id="empleado-correo"
            className="form-control"
            name="correo"
            type="email"
            maxLength={120}
            autoComplete="email"
            value={formulario.correo}
            onChange={manejarCambio}
            required
          />
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label" htmlFor="empleado-telefono">
            Teléfono
          </label>
          <input
            id="empleado-telefono"
            className="form-control"
            name="telefono"
            type="tel"
            minLength={7}
            maxLength={25}
            autoComplete="tel"
            placeholder="Ej. +57 300 123 4567"
            value={formulario.telefono}
            onChange={manejarCambio}
            required
          />
          <small className="form-text text-muted">
            Ingresa entre 7 y 15 dígitos; puedes incluir espacios o prefijo.
          </small>
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label" htmlFor="empleado-cargo">
            Cargo
          </label>
          <select
            id="empleado-cargo"
            className="form-select"
            name="cargo"
            value={formulario.cargo}
            onChange={manejarCambio}
            required
          >
            <option value="">Selecciona un cargo</option>
            {CARGOS_EMPLEADO.map((cargo) => (
              <option key={cargo} value={cargo}>
                {cargo}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label" htmlFor="empleado-password">
            {empleado?.password ? "Nueva contraseña (opcional)" : "Contraseña"}
          </label>
          <input
            id="empleado-password"
            className="form-control"
            name="password"
            type="password"
            minLength={6}
            autoComplete="new-password"
            placeholder={empleado?.password ? "Deja vacío para conservarla" : "Mínimo 6 caracteres"}
            value={formulario.password}
            onChange={manejarCambio}
            required={requierePassword}
          />
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label" htmlFor="empleado-confirmar-password">
            Confirmar contraseña
          </label>
          <input
            id="empleado-confirmar-password"
            className="form-control"
            name="confirmarPassword"
            type="password"
            minLength={6}
            autoComplete="new-password"
            value={formulario.confirmarPassword}
            onChange={manejarCambio}
            required={requierePassword || Boolean(formulario.password)}
          />
        </div>
        <div className="col-12 mb-3">
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={cancelar}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn text-white"
          style={{ backgroundColor: "#344c5c" }}
        >
          <i className="bi bi-check-circle me-2" aria-hidden="true"></i>
          {empleado ? "Guardar cambios" : "Registrar empleado"}
        </button>
      </div>
    </form>
  );
}

export default FormularioEmpleado;