const API_BASE_URL = "http://localhost:8080";

document.addEventListener("DOMContentLoaded", () => {
  mostrarFechaActual();
  marcarEnlaceActivo();
  cargarResumenDashboard();
});

// 1. Muestra la fecha actual en el encabezado
function mostrarFechaActual() {
  const fechaEl = document.getElementById("fechaActual");
  if (!fechaEl) return;

  const opciones = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  };
  const hoy = new Date().toLocaleDateString("es-CO", opciones);
  const fechaCapitalizada = hoy.charAt(0).toUpperCase() + hoy.slice(1);

  fechaEl.textContent = `${fechaCapitalizada} — Selecciona un módulo para gestionar tus operaciones.`;
}

// 2. Resalta automáticamente el módulo activo en la barra lateral
function marcarEnlaceActivo() {
  const paginaActual = window.location.pathname.split("/").pop() || "index.html";
  const enlaces = document.querySelectorAll(".nav-link");

  enlaces.forEach((enlace) => {
    const href = enlace.getAttribute("href");
    if (href === paginaActual) {
      enlace.classList.add("active");
    } else {
      enlace.classList.remove("active");
    }
  });
}

// 3. Consulta el conteo de registros en tus endpoints REST (GET)
async function obtenerTotalEndpoint(ruta) {
  const response = await fetch(`${API_BASE_URL}${ruta}`, {
    method: "GET",
    headers: { Accept: "application/json" }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} en ${ruta}`);
  }

  const datos = await response.json();
  return Array.isArray(datos) ? datos.length : 0;
}

// 4. Actualiza las tarjetas de resumen y el indicador de estado de la API
async function cargarResumenDashboard() {
  const dotEl = document.getElementById("apiStatusDot");
  const textEl = document.getElementById("apiStatusText");

  const consultas = [
    { ruta: "/productos", elementoId: "statProductos" },
    { ruta: "/barberos", elementoId: "statBarberos" },
    { ruta: "/reservas", elementoId: "statReservas" }
  ];

  let algunaConexionExitosa = false;

  await Promise.all(
    consultas.map(async ({ ruta, elementoId }) => {
      const el = document.getElementById(elementoId);
      try {
        const total = await obtenerTotalEndpoint(ruta);
        if (el) el.textContent = total;
        algunaConexionExitosa = true;
      } catch (error) {
        if (el) el.textContent = "0";
      }
    })
  );

  if (dotEl && textEl) {
    if (algunaConexionExitosa) {
      dotEl.classList.add("online");
      textEl.textContent = "API REST conectada";
    } else {
      dotEl.classList.add("offline");
      textEl.textContent = "API sin conexión";
    }
  }
}