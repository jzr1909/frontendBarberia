
const API_URL = "http://localhost:8080/api/barberos";

// ==========================================
// REGISTRAR BARBERO
// ==========================================

async function registrarBarbero() {

    const barbero = obtenerDatosFormulario();

    if (!barbero.nombre || !barbero.apellido ||
        !barbero.documento || !barbero.telefono ||
        !barbero.correo || !barbero.estado) {

        mostrarMensaje("Complete todos los campos", "warning");
        return;
    }

    try {

        const respuesta = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(barbero)
        });

        if (!respuesta.ok) {
            throw new Error("No se pudo registrar el barbero");
        }

        mostrarMensaje("Barbero registrado correctamente", "success");

        limpiarFormulario();
        listarBarberos();

    } catch (error) {

        mostrarMensaje(error.message, "danger");

    }

}


// ==========================================
// LISTAR TODOS LOS BARBEROS
// ==========================================

async function listarBarberos() {

    try {

        const respuesta = await fetch(API_URL);

        if (!respuesta.ok) {
            throw new Error("Error al consultar los barberos");
        }

        const barberos = await respuesta.json();

        const tabla = document.getElementById("tablaBarberos");

        tabla.innerHTML = "";

        if (barberos.length === 0) {

            tabla.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-cell">
                        No hay barberos registrados.
                    </td>
                </tr>
            `;

            mostrarMensaje("No hay barberos registrados", "info");
            return;
        }

        barberos.forEach(barbero => {

            tabla.innerHTML += `
                <tr>
                    <td>${barbero.id}</td>
                    <td>${barbero.nombre}</td>
                    <td>${barbero.apellido}</td>
                    <td>${barbero.documento}</td>
                    <td>${barbero.telefono}</td>
                    <td>${barbero.correo}</td>
                    <td>${barbero.estado}</td>
                </tr>
            `;

        });

        mostrarMensaje("Lista de barberos cargada correctamente", "success");

    } catch (error) {

        mostrarMensaje(error.message, "danger");

    }

}


// ==========================================
// BUSCAR BARBERO POR ID
// ==========================================

async function buscarBarbero() {

    const id = document.getElementById("id").value;

    if (id === "") {

        mostrarMensaje("Ingrese el ID del barbero", "warning");
        return;

    }

    try {

        const respuesta = await fetch(`${API_URL}/${id}`);

        if (!respuesta.ok) {
            throw new Error("No se encontró el barbero");
        }

        const barbero = await respuesta.json();

        document.getElementById("nombre").value = barbero.nombre;
        document.getElementById("apellido").value = barbero.apellido;
        document.getElementById("documento").value = barbero.documento;
        document.getElementById("telefono").value = barbero.telefono;
        document.getElementById("correo").value = barbero.correo;
        document.getElementById("estado").value = barbero.estado;

        mostrarMensaje("Barbero encontrado correctamente", "success");

    } catch (error) {

        mostrarMensaje(error.message, "danger");

    }

}


// ==========================================
// ACTUALIZAR BARBERO
// ==========================================

async function actualizarBarbero() {

    const id = document.getElementById("id").value;

    if (id === "") {

        mostrarMensaje("Ingrese el ID del barbero que desea actualizar", "warning");
        return;

    }

    const barbero = obtenerDatosFormulario();

    try {

        const respuesta = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(barbero)
        });

        if (!respuesta.ok) {
            throw new Error("No se pudo actualizar el barbero");
        }

        mostrarMensaje("Barbero actualizado correctamente", "success");

        listarBarberos();

    } catch (error) {

        mostrarMensaje(error.message, "danger");

    }

}


// ==========================================
// ELIMINAR BARBERO
// ==========================================

async function eliminarBarbero() {

    const id = document.getElementById("id").value;

    if (id === "") {

        mostrarMensaje("Ingrese el ID del barbero que desea eliminar", "warning");
        return;

    }

    const confirmar = confirm("¿Está seguro de eliminar este barbero?");

    if (!confirmar) {
        return;
    }

    try {

        const respuesta = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (!respuesta.ok) {
            throw new Error("No se pudo eliminar el barbero");
        }

        mostrarMensaje("Barbero eliminado correctamente", "success");

        limpiarFormulario();
        listarBarberos();

    } catch (error) {

        mostrarMensaje(error.message, "danger");

    }

}


// ==========================================
// OBTENER DATOS DEL FORMULARIO
// ==========================================

function obtenerDatosFormulario() {

    return {

        nombre: document.getElementById("nombre").value.trim(),
        apellido: document.getElementById("apellido").value.trim(),
        documento: document.getElementById("documento").value.trim(),
        telefono: document.getElementById("telefono").value.trim(),
        correo: document.getElementById("correo").value.trim(),
        estado: document.getElementById("estado").value

    };

}


// ==========================================
// LIMPIAR FORMULARIO
// ==========================================

function limpiarFormulario() {

    document.getElementById("id").value = "";
    document.getElementById("nombre").value = "";
    document.getElementById("apellido").value = "";
    document.getElementById("documento").value = "";
    document.getElementById("telefono").value = "";
    document.getElementById("correo").value = "";
    document.getElementById("estado").value = "";

    document.getElementById("mensaje").innerHTML = "";

}


// ==========================================
// MOSTRAR MENSAJES
// ==========================================

function mostrarMensaje(texto, tipo) {

    const mensaje = document.getElementById("mensaje");

    mensaje.innerHTML = `
        <div class="alert alert-${tipo} alert-dismissible fade show">
            ${texto}

            <button type="button"
                    class="btn-close"
                    data-bs-dismiss="alert">
            </button>
        </div>
    `;

}
