const URL_SERVICIOS = "http://localhost:8080/api/servicios";

// Cargar la lista automáticamente al abrir la página
document.addEventListener("DOMContentLoaded", () => {
    obtenerListaServicios();
});

// Mostrar alertas visuales en el formulario
function mostrarMensaje(texto, tipo) {
    const divMensaje = document.getElementById("mensajeEstado");
    divMensaje.textContent = texto;
    divMensaje.className = `feedback show ${tipo}`;

    setTimeout(() => {
        divMensaje.classList.remove("show");
    }, 4500);
}

// Limpiar todos los campos
function limpiarFormulario() {
    document.getElementById("id").value = "";
    document.getElementById("nombre").value = "";
    document.getElementById("descripcion").value = "";
    document.getElementById("duracion").value = "";
    document.getElementById("precio").value = "";
    document.getElementById("mensajeEstado").classList.remove("show");
}

// Obtener datos del formulario y validar
function obtenerDatosFormulario() {
    const nombre = document.getElementById("nombre").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();
    const duracion = Number(document.getElementById("duracion").value);
    const precio = Number(document.getElementById("precio").value);

    if (!nombre || !descripcion || duracion <= 0 || precio <= 0) {
        mostrarMensaje("Por favor completa todos los campos con valores válidos.", "error");
        return null;
    }

    return {
        nombre,
        descripcion,
        duracionMinutos: duracion, // Ajusta el nombre del atributo según tu entidad en Java/Backend
        precio
    };
}

// 1. Registrar nuevo servicio (POST)
async function registrarServicio() {
    const datos = obtenerDatosFormulario();
    if (!datos) return;

    try {
        const respuesta = await fetch(URL_SERVICIOS, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });

        if (!respuesta.ok) {
            throw new Error(await respuesta.text() || "Error al registrar el servicio.");
        }

        mostrarMensaje("Servicio registrado correctamente.", "success");
        limpiarFormulario();
        await obtenerListaServicios();

    } catch (error) {
        console.error(error);
        mostrarMensaje(error.message, "error");
    }
}

// 2. Buscar servicio por ID (GET /{id})
async function obtenerServicio() {
    const id = document.getElementById("id").value;

    if (!id || Number(id) <= 0) {
        mostrarMensaje("Ingresa un ID válido para buscar.", "error");
        return;
    }

    try {
        const respuesta = await fetch(`${URL_SERVICIOS}/${id}`);

        if (!respuesta.ok) {
            throw new Error("No se encontró ningún servicio con ese ID.");
        }

        const servicio = await respuesta.json();
        cargarServicioEnFormulario(servicio);
        mostrarMensaje("Servicio encontrado.", "success");

    } catch (error) {
        console.error(error);
        mostrarMensaje(error.message, "error");
    }
}

// 3. Actualizar servicio existente (PUT /{id})
async function actualizarServicio() {
    const id = document.getElementById("id").value;

    if (!id || Number(id) <= 0) {
        mostrarMensaje("Primero busca o selecciona un servicio para actualizar.", "error");
        return;
    }

    const datos = obtenerDatosFormulario();
    if (!datos) return;

    try {
        const respuesta = await fetch(`${URL_SERVICIOS}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });

        if (!respuesta.ok) {
            throw new Error(await respuesta.text() || "Error al actualizar el servicio.");
        }

        mostrarMensaje("Servicio actualizado correctamente.", "success");
        await obtenerListaServicios();

    } catch (error) {
        console.error(error);
        mostrarMensaje(error.message, "error");
    }
}

// 4. Inactivar o Reactivar servicio (PATCH /{id})
async function cambiarEstadoServicio(activo) {
    const id = document.getElementById("id").value;

    if (!id || Number(id) <= 0) {
        mostrarMensaje("Primero busca o selecciona un servicio.", "error");
        return;
    }

    const accion = activo ? "reactivar" : "inactivar";

    if (!confirm(`¿Deseas ${accion} este servicio?`)) {
        return;
    }

    try {
        const respuesta = await fetch(`${URL_SERVICIOS}/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ activo: activo })
        });

        if (!respuesta.ok) {
            throw new Error(await respuesta.text() || `Error al ${accion} el servicio.`);
        }

        mostrarMensaje(
            activo ? "Servicio reactivado correctamente." : "Servicio inactivado correctamente.",
            "success"
        );

        await obtenerListaServicios();

    } catch (error) {
        console.error(error);
        mostrarMensaje(error.message, "error");
    }
}

// 5. Listar todos los servicios (GET)
async function obtenerListaServicios() {
    const tbody = document.getElementById("tablaServicios");

    try {
        const respuesta = await fetch(URL_SERVICIOS);

        if (!respuesta.ok) {
            throw new Error("No se pudo obtener la lista de servicios.");
        }

        const servicios = await respuesta.json();
        tbody.innerHTML = "";

        if (!servicios || servicios.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-cell">No hay servicios registrados.</td>
                </tr>`;
            return;
        }

        servicios.forEach(servicio => {
            const fila = document.createElement("tr");
            
            // Permite hacer clic en cualquier fila para rellenar el formulario
            fila.onclick = () => cargarServicioEnFormulario(servicio);

            const duracion = servicio.duracionMinutos ?? servicio.duracion ?? 0;
            const precioFormateado = new Intl.NumberFormat("es-CO", {
                style: "currency",
                currency: "COP",
                maximumFractionDigits: 0
            }).format(servicio.precio);

            const esActivo = servicio.activo !== false;

            fila.innerHTML = `
                <td>${servicio.id}</td>
                <td><strong>${servicio.nombre}</strong></td>
                <td>${servicio.descripcion}</td>
                <td>${duracion} min</td>
                <td>${precioFormateado}</td>
                <td class="${esActivo ? "estado-activo" : "estado-inactivo"}">
                    ${esActivo ? "Activo" : "Inactivo"}
                </td>
            `;

            tbody.appendChild(fila);
        });

    } catch (error) {
        console.error(error);
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-cell">Error de conexión con el servidor.</td>
            </tr>`;
    }
}

// Rellenar formulario al buscar o hacer clic en la tabla
function cargarServicioEnFormulario(servicio) {
    document.getElementById("id").value = servicio.id;
    document.getElementById("nombre").value = servicio.nombre;
    document.getElementById("descripcion").value = servicio.descripcion;
    document.getElementById("duracion").value = servicio.duracionMinutos ?? servicio.duracion ?? "";
    document.getElementById("precio").value = servicio.precio;
}