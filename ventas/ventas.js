const API_URL = "http://localhost:8080/api/ventas";

let carrito = [];

// Catálogo provisional del backend
const catalogo = {
    PRODUCTO: [
        { id: 1, nombre: "Cera para cabello", precio: 15000 },
        { id: 2, nombre: "Shampoo", precio: 20000 }
    ],
    SERVICIO: [
        { id: 1, nombre: "Corte de cabello", precio: 18000 },
        { id: 2, nombre: "Arreglo de barba", precio: 10000 }
    ]
};

document.addEventListener("DOMContentLoaded", () => {
    cargarArticulos();
    mostrarCarrito();
    cargarVentas();

    document.getElementById("tipoItem")
        .addEventListener("change", cargarArticulos);

    document.getElementById("btnAgregar")
        .addEventListener("click", agregarArticulo);

    document.getElementById("btnRegistrar")
        .addEventListener("click", registrarVenta);

    document.getElementById("filtroEstado")
        .addEventListener("change", cargarVentas);
});

function moneda(valor) {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
    }).format(valor);
}

function mostrarMensaje(texto, error = false) {
    const mensaje = document.getElementById("mensaje");

    mensaje.textContent = texto;
    mensaje.className = error
        ? "mensaje-error"
        : "mensaje-exito";
}

async function solicitar(url, opciones = {}) {
    const respuesta = await fetch(url, opciones);

    if (!respuesta.ok) {
        throw new Error("Error HTTP: " + respuesta.status);
    }

    if (respuesta.status === 204) {
        return null;
    }

    return await respuesta.json();
}

// Cargar productos y servicios
function cargarArticulos() {
    const tipo = document.getElementById("tipoItem").value;
    const select = document.getElementById("itemId");

    select.innerHTML = "";

    catalogo[tipo].forEach(item => {
        const opcion = document.createElement("option");

        opcion.value = item.id;
        opcion.textContent = item.nombre + " - " + moneda(item.precio);

        select.appendChild(opcion);
    });
}

// Agregar artículos al carrito
function agregarArticulo() {
    const tipo = document.getElementById("tipoItem").value;
    const id = Number(document.getElementById("itemId").value);
    const cantidad = Number(document.getElementById("cantidad").value);

    if (!Number.isInteger(cantidad) || cantidad < 1) {
        mostrarMensaje("Ingresa una cantidad válida.", true);
        return;
    }

    const articulo = catalogo[tipo].find(item => item.id === id);

    if (!articulo) {
        mostrarMensaje("Selecciona un artículo válido.", true);
        return;
    }

    const existente = carrito.find(item =>
        item.tipoItem === tipo && item.itemId === id
    );

    if (existente) {
        existente.cantidad += cantidad;
    } else {
        carrito.push({
            tipoItem: tipo,
            itemId: id,
            nombre: articulo.nombre,
            precio: articulo.precio,
            cantidad: cantidad
        });
    }

    mostrarCarrito();
    mostrarMensaje("Artículo agregado.");
}

// Mostrar artículos agregados
function mostrarCarrito() {
    const tabla = document.getElementById("tablaCarrito");

    tabla.innerHTML = "";

    let total = 0;

    carrito.forEach((item, index) => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;

        tabla.innerHTML += `
            <tr>
                <td>${item.nombre}</td>
                <td>${item.cantidad}</td>
                <td>${moneda(item.precio)}</td>
                <td>${moneda(subtotal)}</td>
                <td>
                    <button class="btn-secundario"
                        onclick="quitarArticulo(${index})">
                        Quitar
                    </button>
                </td>
            </tr>
        `;
    });

    if (carrito.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="5">No hay artículos agregados.</td>
            </tr>
        `;
    }

    document.getElementById("totalVenta").textContent = moneda(total);
}

function quitarArticulo(index) {
    carrito.splice(index, 1);
    mostrarCarrito();
}

// POST: Registrar venta
async function registrarVenta() {
    const metodoPago = document.getElementById("metodoPago").value;
    const cliente = document.getElementById("clienteId").value;

    if (carrito.length === 0) {
        mostrarMensaje("Agrega al menos un artículo.", true);
        return;
    }

    if (!metodoPago) {
        mostrarMensaje("Selecciona un método de pago.", true);
        return;
    }

    if (cliente && (!Number.isInteger(Number(cliente)) || Number(cliente) < 1)) {
        mostrarMensaje("Ingresa un ID de cliente válido.", true);
        return;
    }

    const venta = {
        clienteId: cliente ? Number(cliente) : null,
        metodoPago: metodoPago,
        detalles: carrito.map(item => ({
            tipoItem: item.tipoItem,
            itemId: item.itemId,
            cantidad: item.cantidad
        }))
    };

    const boton = document.getElementById("btnRegistrar");
    boton.disabled = true;

    try {
        await solicitar(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(venta)
        });

        carrito = [];
        mostrarCarrito();

        document.getElementById("clienteId").value = "";
        document.getElementById("metodoPago").value = "";

        mostrarMensaje("Venta registrada correctamente.");

        await cargarVentas();

    } catch (error) {
        mostrarMensaje("No se pudo registrar la venta. " + error.message, true);
    } finally {
        boton.disabled = false;
    }
}

// GET: Consultar ventas y filtrar
async function cargarVentas() {
    const filtro = document.getElementById("filtroEstado").value;

    try {
        const todas = await solicitar(API_URL);

        actualizarResumen(todas);

        const ventas = filtro
            ? await solicitar(API_URL + "?estado=" + encodeURIComponent(filtro))
            : todas;

        mostrarVentas(ventas);

        document.getElementById("apiStatusDot").className =
            "status-dot online";

        document.getElementById("apiStatusText").textContent =
            "API REST conectada";

    } catch (error) {
        document.getElementById("apiStatusDot").className =
            "status-dot offline";

        document.getElementById("apiStatusText").textContent =
            "API sin conexión";

        mostrarMensaje("No se pudo conectar con el backend.", true);
    }
}

// Mostrar historial
function mostrarVentas(ventas) {
    const tabla = document.getElementById("tablaVentas");

    tabla.innerHTML = "";

    if (ventas.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="7">No hay ventas registradas.</td>
            </tr>
        `;
        return;
    }

    ventas.forEach(venta => {
        const anulada = venta.estado === "ANULADA";
        const id = Number(venta.id);

        const fecha = new Date(venta.fecha)
            .toLocaleString("es-CO");

        tabla.innerHTML += `
            <tr>
                <td>${id}</td>
                <td>${fecha}</td>
                <td>${venta.clienteId == null ? "Sin cliente" : Number(venta.clienteId)}</td>
                <td>${nombrePago(venta.metodoPago)}</td>
                <td>${moneda(venta.total)}</td>
                <td>
                    <span class="estado ${anulada ? "anulada" : "registrada"}">
                        ${anulada ? "ANULADA" : "REGISTRADA"}
                    </span>
                </td>
                <td>
                    <div class="acciones">
                        <button onclick="verVenta(${id})">
                            Ver
                        </button>

                        <button onclick="verComprobante(${id})">
                            Comprobante
                        </button>

                        ${!anulada ? `
                            <button onclick="editarVenta(${id})">
                                Editar
                            </button>

                            <button onclick="cambiarPago(${id})">
                                Cambiar pago
                            </button>

                            <button class="btn-anular"
                                onclick="anularVenta(${id})">
                                Anular
                            </button>
                        ` : ""}
                    </div>
                </td>
            </tr>
        `;
    });
}

function nombrePago(metodo) {
    return metodo === "EFECTIVO"
        ? "Efectivo"
        : "Transferencia bancaria";
}

// Actualizar tarjetas superiores
function actualizarResumen(ventas) {
    const registradas = ventas.filter(v => v.estado === "REGISTRADA");
    const anuladas = ventas.filter(v => v.estado === "ANULADA");

    const total = registradas.reduce(
        (suma, venta) => suma + Number(venta.total), 0
    );

    document.getElementById("totalRegistradas").textContent =
        registradas.length;

    document.getElementById("totalAnuladas").textContent =
        anuladas.length;

    document.getElementById("totalIngresos").textContent =
        moneda(total);
}

// GET: Consultar una venta por ID
async function verVenta(id) {
    try {
        const venta = await solicitar(API_URL + "/" + id);

        const detalles = venta.detalles.map(item =>
            `${item.nombre} x${item.cantidad} - ${moneda(item.subtotal)}`
        ).join("\n");

        alert(
            "VENTA #" + venta.id +
            "\nCliente: " + (venta.clienteId ?? "Sin cliente") +
            "\nEstado: " + venta.estado +
            "\nMétodo de pago: " + nombrePago(venta.metodoPago) +
            "\n\nArtículos:\n" + detalles +
            "\n\nTotal: " + moneda(venta.total) +
            "\nMotivo de anulación: " + (venta.motivoAnulacion ?? "No aplica")
        );

    } catch (error) {
        mostrarMensaje(error.message, true);
    }
}

function solicitarMetodoPago() {
    const opcion = prompt(
        "Selecciona el método de pago:\n1. Efectivo\n2. Transferencia bancaria"
    );

    if (opcion === null) return null;
    if (opcion === "1") return "EFECTIVO";
    if (opcion === "2") return "TRANSFERENCIA_BANCARIA";

    mostrarMensaje("Método de pago inválido.", true);
    return null;
}

// PUT: Actualizar venta
async function editarVenta(id) {
    try {
        const venta = await solicitar(API_URL + "/" + id);

        const cliente = prompt(
            "ID del cliente (vacío si no tiene):",
            venta.clienteId ?? ""
        );

        if (cliente === null) return;

        if (cliente && (!Number.isInteger(Number(cliente)) || Number(cliente) < 1)) {
            mostrarMensaje("ID de cliente inválido.", true);
            return;
        }

        const metodoPago = solicitarMetodoPago();

        if (!metodoPago) return;

        await solicitar(API_URL + "/" + id, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                clienteId: cliente ? Number(cliente) : null,
                metodoPago: metodoPago
            })
        });

        mostrarMensaje("Venta actualizada correctamente.");
        await cargarVentas();

    } catch (error) {
        mostrarMensaje(error.message, true);
    }
}

// PATCH: Cambiar método de pago
async function cambiarPago(id) {
    const metodoPago = solicitarMetodoPago();

    if (!metodoPago) return;

    try {
        await solicitar(API_URL + "/" + id, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                metodoPago: metodoPago
            })
        });

        mostrarMensaje("Método de pago actualizado.");
        await cargarVentas();

    } catch (error) {
        mostrarMensaje(error.message, true);
    }
}

// DELETE: Anular venta
async function anularVenta(id) {
    const motivo = prompt("Escribe el motivo de anulación:");

    if (motivo === null) return;

    if (!motivo.trim()) {
        mostrarMensaje("Debes ingresar un motivo.", true);
        return;
    }

    if (!confirm("¿Deseas anular esta venta?")) return;

    try {
        await solicitar(
            API_URL + "/" + id + "?motivo=" + encodeURIComponent(motivo),
            { method: "DELETE" }
        );

        mostrarMensaje("Venta anulada correctamente.");
        await cargarVentas();

    } catch (error) {
        mostrarMensaje(error.message, true);
    }
}

// GET: Consultar e imprimir comprobante
async function verComprobante(id) {
    try {
        const comprobante = await solicitar(
            API_URL + "/" + id + "/comprobante"
        );

        const ventana = window.open("", "_blank", "width=600,height=650");

        if (!ventana) {
            mostrarMensaje("Permite las ventanas emergentes.", true);
            return;
        }

        ventana.document.title = "Comprobante BarberIA";

        const contenido = ventana.document.createElement("pre");

        contenido.style.whiteSpace = "pre-wrap";
        contenido.style.fontFamily = "Arial";
        contenido.style.padding = "25px";

        const detalles = comprobante.detalles.map(item =>
            `${item.nombre} x${item.cantidad} - ${moneda(item.subtotal)}`
        ).join("\n");

        contenido.textContent =
            "BARBERIA\n" +
            "COMPROBANTE DE VENTA\n\n" +
            "Número: " + comprobante.numeroComprobante +
            "\nFecha: " + comprobante.fecha +
            "\nEstado: " + comprobante.estado +
            "\nMétodo de pago: " + nombrePago(comprobante.metodoPago) +
            "\n\nDETALLES\n" + detalles +
            "\n\nTOTAL: " + moneda(comprobante.total);

        ventana.document.body.appendChild(contenido);

        const boton = ventana.document.createElement("button");

        boton.textContent = "Imprimir comprobante";
        boton.onclick = () => ventana.print();

        ventana.document.body.appendChild(boton);

    } catch (error) {
        mostrarMensaje(error.message, true);
    }
}