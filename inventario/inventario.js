
 

        

    



async function obtenerProducto() {
    console.log("Iniciando consulta de Producto...");
    const id = document.getElementById("id").value;
    if (!id) {
        alert("Por favor, ingresa un id válido.");
        return;
    }
    const url = `http://localhost:8080/productos/${id}`;
    console.log("URL solicitada:", url);
    try {
        const respuesta = await fetch(url);
        if (!respuesta.ok) {
            const mensajeError = await respuesta.text();
            throw new Error(`Error ${respuesta.status}: ${mensajeError}`);
        }
        const producto = await respuesta.json();
        document.getElementById("id").value = producto.id || "";
        document.getElementById("nombre").value = producto.nombre || "";
        document.getElementById("descripcion").value = producto.descripcion || "";
        document.getElementById("categoria").value = producto.categoria || "";
        document.getElementById("precioVenta").value = producto.precioVenta || "";
        document.getElementById("stockActual").value = producto.stockActual || "";
        document.getElementById("estado").value = producto.estado || "";


        console.log("Producto encontrado:", producto);
    } catch (error) {
        console.error("Error al obtener el Producto:", error);
        alert("Hubo un problema al buscar el Producto: " + error.message);
    }
}

async function obtenerListaProductos() {
    console.log("Iniciando consulta de lista de productos...");
    const url = `http://localhost:8080/productos`;
    console.log("URL solicitada:", url);


     
    try {
         const respuesta = await fetch(url, {
            method: "GET",
            headers: {
                "Accept": "application/json",
            },
            
        });
        if (!respuesta.ok) {
            if (respuesta.status === 204) {
                alert("No hay productos disponibles en la lista.");
                console.log("La lista de productos está vacía.");
                return;
            }
            const mensajeError = await respuesta.text();
            throw new Error(`Error ${respuesta.status}: ${mensajeError}`);
        }
        const personas = await respuesta.json();
        console.log("Lista de personas obtenida:");
        // Iterar sobre la lista y mostrar cada producto en la consola
        personas.forEach((producto, index) => {
            console.log(`Producto: ${index + 1}`);
            console.log(`Id: ${producto.id}`);
            console.log(`Nombre: ${producto.nombre}`);
            console.log(`Descripcion: ${producto.descripcion}`);
            console.log(`Categoria: ${producto.categoria}`);
            console.log(`Precio de Venta: ${producto.precioVenta}`);
            console.log(`Stock: ${producto.stockActual}`);
            console.log(`Estado: ${producto.estado}`);
            console.log("-----------------------------");
            console.log("");
        });
    } catch (error) {
        console.error("Error al obtener la lista de productos:", error);
        alert("Hubo un problema al obtener la lista de productos: " + error.message);
    }
}


async function registrarProducto() {
    console.log("Iniciando registro de Producto...");
    const nombre = document.getElementById("nombre").value;
    const descripcion = document.getElementById("descripcion").value;
    const categoria = document.getElementById("categoria").value;
    const precioVenta = document.getElementById("precioVenta").value;
    const stockActual = document.getElementById("stockActual").value;
    const estado = document.getElementById("estado").value;
    

    if ( !nombre || !descripcion || !categoria || !precioVenta || !stockActual || !estado) {
        alert("Por favor, completa todos los campos antes de registrar.");
        return;
    }
    const producto = {
        
        nombre: nombre,
        descripcion: descripcion,
        categoria: categoria,
        precioVenta: parseFloat (precioVenta),
        stockActual: parseInt (stockActual),
        estado: estado
        

    };
    console.log("Producto a registrar:", producto);
    const url = "http://localhost:8080/productos";
    try {
        const respuesta = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(producto),
        });
        if (!respuesta.ok) {
            const mensajeError = await respuesta.text();
            throw new Error(`Error ${respuesta.status}: ${mensajeError}`);
        }
        const resultado = await respuesta.json();
        console.log("Producto registrado con éxito:", resultado);
        alert("El Producto se registró con éxito.")

        limpiarFormulario();
    } catch (error) {
        console.error("Error al registrar el producto:", error);
        alert("Hubo un problema al registrar el producto: " + error.message);
    }
}


async function actualizarProducto() {
    const id = document.getElementById("id").value;
    const nombre = document.getElementById("nombre").value;
    const descripcion = document.getElementById("descripcion").value;
    const categoria = document.getElementById("categoria").value;
    const precioVenta = document.getElementById("precioVenta").value;
    const stockActual = document.getElementById("stockActual").value;
    const estado = document.getElementById("estado").value;

    if ( !nombre || !descripcion || !categoria || !precioVenta || !stockActual || !estado) {
        alert("Por favor, completa todos los campos antes de registrar.");
        return;
    }
    const producto = {
        
        nombre: nombre,
        descripcion: descripcion,
        categoria: categoria,
        precioVenta: parseFloat (precioVenta),
        stockActual: parseInt (stockActual),
        estado: estado
        

    };
    console.log("Producto a actualizar:", producto);
    const url = `http://localhost:8080/productos/${id}`;
    try {
        const respuesta = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(producto),
        });
        if (!respuesta.ok) {
            const mensajeError = await respuesta.text();
            throw new Error(`Error ${respuesta.status}: ${mensajeError}`);
        }
        const resultado = await respuesta.json();
        console.log("Producto actualizado con éxito:", resultado);
        alert("El producto se actualizó con éxito.");
    } catch (error) {
        console.error("Error al actualizar el producto:", error);
        alert("Hubo un problema al actualizar el producto: " + error.message);
    }
}


async function eliminarProducto() {
    console.log("Iniciando proceso para eliminar producto...");
    const id = document.getElementById("id").value;
    if (!id) {
        alert("Por favor, ingresa un codigo válido para eliminar.");
        return;
    }
    const url = `http://localhost:8080/productos/${id}`;
    console.log("URL solicitada:", url);
    try {
        const respuesta = await fetch(url, {
            method: "DELETE",
        });
        if (respuesta.ok) {
            const mensaje = await respuesta.text();
            console.log("Respuesta del servidor:", mensaje);
            alert("Producto eliminado con éxito.");
        } else if (respuesta.status === 404) {
            const mensaje = await respuesta.text();
            console.warn("Error: producto no encontrado.");
            alert("Error: " + mensaje);
        } else {
            throw new Error(`Error ${respuesta.status}: ${await respuesta.text()}`);
        }
    } catch (error) {
        console.error("Ocurrió un error al eliminar el producto:", error);
        alert("Hubo un problema al eliminar el producto: " + error.message);
    }
}


async function limpiarFormulario() {
    document.getElementById("id").value = "";
    document.getElementById("nombre").value = "";
    document.getElementById("descripcion").value = "";
    document.getElementById("categoria").value = "";
    document.getElementById("precioVenta").value = "";
    document.getElementById("stockActual").value = "";
    document.getElementById("estado").value = "";

}

