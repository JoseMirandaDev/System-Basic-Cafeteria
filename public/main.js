const API_URL = 'http://localhost:3000/api/pedidos';

function mostrarSeccion(id) {
    document.querySelectorAll('.seccion').forEach(sec => sec.style.display = 'none');
    document.getElementById(id).style.display = 'block';
}

document.getElementById('formPedido')?.addEventListener('submit', function(e) {
    e.preventDefault();
    // El formulario de pedido no envía productos ni total, se maneja por el ticket-panel
    // Por lo tanto, aquí no se hace nada
});

async function cargarPedidosCocina() {
    const res = await fetch(`${API_URL}/cocina`);
    const pedidos = await res.json();
    const tbody = document.getElementById('tablaCocina');
    tbody.innerHTML = '';
    pedidos.forEach((p, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${p.id}</td>
            <td>Orden ${idx + 1}</td>
            <td>${estadoPedidoTexto(p.estado)}</td>
            <td>
                ${p.estado === 'pendiente' ? `<button class="accion-btn" onclick="cambiarEstado(${p.id},'cocina','en-preparacion')">En preparación</button>` : ''}
                ${p.estado === 'en_preparacion' ? `<button class="accion-btn" onclick="cambiarEstado(${p.id},'cocina','listo')">Listo</button>` : ''}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function cargarPedidosBarista() {
    const res = await fetch(`${API_URL}/cafe`);
    const pedidos = await res.json();
    const tbody = document.getElementById('tablaBarista');
    tbody.innerHTML = '';
    pedidos.forEach((p, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${p.id}</td>
            <td>Orden ${idx + 1}</td>
            <td>${estadoPedidoTexto(p.estado)}</td>
            <td>
                ${p.estado === 'pendiente' ? `<button class="accion-btn" onclick="cambiarEstado(${p.id},'cafe','en-preparacion')">En preparación</button>` : ''}
                ${p.estado === 'en_preparacion' ? `<button class="accion-btn" onclick="cambiarEstado(${p.id},'cafe','listo')">Listo</button>` : ''}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function estadoPedidoTexto(estado) {
    switch (estado) {
        case 'pendiente': return '<span style="color:#bfa600;font-weight:bold;">Pendiente</span>';
        case 'en_preparacion': return '<span style="color:#007bff;font-weight:bold;">En preparación</span>';
        case 'listo': return '<span style="color:#388e3c;font-weight:bold;">Listo</span>';
        case 'cancelado': return '<span style="color:#d32f2f;font-weight:bold;">Cancelado</span>';
        default: return estado;
    }
}

async function cambiarEstado(id, tipo, estado) {
    let url = `${API_URL}/${tipo}/${id}/${estado === 'en-preparacion' ? 'en-preparacion' : 'listo'}`;
    await fetch(url, { method: 'PUT' });
    if (tipo === 'cocina') cargarPedidosCocina();
    if (tipo === 'cafe') cargarPedidosBarista();
}

async function cargarReporte() {
    const fecha = document.getElementById('fechaReporte').value;
    const res = await fetch(`/api/reportes/reporte-diario?fecha=${fecha}`);
    const data = await res.json();
    const div = document.getElementById('reporteDiario');
    if (data && data.detalles) {
        div.innerHTML = `
            <b>Fecha:</b> ${data.fecha}<br>
            <b>Total Ventas:</b> Bs. ${data.totalVentas || 0}<br>
            <b>Total Pedidos:</b> ${data.totalPedidos || 0}<br>
            <h4>Detalles:</h4>
            <ul>
                ${data.detalles.map(p => `<li>#${p.id} - ${p.tipo} - ${p.productos.map(prod => `${prod.nombre} (x${prod.cantidad})`).join(', ')} - Bs. ${p.total}</li>`).join('')}
            </ul>
        `;
    } else {
        div.textContent = 'No hay datos para la fecha seleccionada.';
    }
}

async function cargarCategorias() {
    const res = await fetch('/api/pedidos/categorias');
    const categorias = await res.json();
    const select = document.getElementById('filtroCategoria');
    if (select) {
        select.innerHTML = '<option value="">Todas las categorías</option>' +
            categorias.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
    }
    // Para el formulario de admin
    const selectAdmin = document.getElementById('categoriaProducto');
    if (selectAdmin) {
        selectAdmin.innerHTML = categorias.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
    }
}

let productosDisponibles = [];
let filtroCategoria = null;
async function cargarProductos() {
    let url = `${API_URL}/productos`;
    if (filtroCategoria) url += `?categoria_id=${filtroCategoria}`;
    const res = await fetch(url);
    productosDisponibles = await res.json();
    const tableBody = document.getElementById('productosTableBody');
    if (tableBody) {
        tableBody.innerHTML = '';
        productosDisponibles.forEach(prod => {
            const tr = document.createElement('tr');
            tr.style.cursor = 'pointer';
            tr.onclick = () => agregarAlTicket(prod.id);
            const precio = Number(prod.precio);
            tr.innerHTML = `
                <td>${prod.id}</td>
                <td>${prod.nombre}</td>
                <td>${prod.categoria || ''}</td>
                <td>
                    ${prod.activo ? '<span style="color:green;font-weight:bold;">Activo</span>' : '<span style="color:red;">Inactivo</span>'}
                </td>
                <td>Bs. ${precio.toFixed(2)}</td>
            `;
            tableBody.appendChild(tr);
        });
    }
}

window.filtrarPorCategoria = function(categoriaId) {
    filtroCategoria = categoriaId || null;
    cargarProductos();
};

window.editarProducto = async function(id) {
    alert('Funcionalidad de edición de producto (implementa modal o formulario)');
};

window.eliminarProducto = async function(id) {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
    await fetch(`/api/pedidos/productos/${id}`, { method: 'DELETE' });
    cargarProductos();
};

let ticket = [];
function agregarAlTicket(productoId) {
    const prod = productosDisponibles.find(p => p.id === productoId);
    if (!prod) return;
    const existente = ticket.find(p => p.producto_id === productoId);
    if (existente) {
        existente.cantidad += 1;
        existente.total = existente.cantidad * existente.precio_unitario;
    } else {
        ticket.push({
            producto_id: prod.id,
            nombre: prod.nombre,
            cantidad: 1,
            precio_unitario: Number(prod.precio),
            total: Number(prod.precio)
        });
    }
    renderTicket();
}

function renderTicket() {
    const tbody = document.getElementById('ticketBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    let total = 0;
    ticket.forEach(item => {
        total += item.total;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.nombre}</td>
            <td>
                <button onclick="cambiarCantidad(${item.producto_id},-1)">-</button>
                ${item.cantidad}
                <button onclick="cambiarCantidad(${item.producto_id},1)">+</button>
            </td>
            <td>Bs. ${item.precio_unitario.toFixed(2)}</td>
            <td>Bs. ${item.total.toFixed(2)}</td>
        `;
        tbody.appendChild(tr);
    });
    document.getElementById('precioTotal').textContent = `Bs. ${total.toFixed(2)}`;
}

window.cambiarCantidad = function(productoId, delta) {
    const item = ticket.find(p => p.producto_id === productoId);
    if (!item) return;
    item.cantidad += delta;
    if (item.cantidad <= 0) {
        ticket = ticket.filter(p => p.producto_id !== productoId);
    } else {
        item.total = item.cantidad * item.precio_unitario;
    }
    renderTicket();
};

document.getElementById('enviarPedidoBtn')?.addEventListener('click', async function() {
    const tipo = document.getElementById('tipoPedido')?.value || 'cocina';
    const form = document.getElementById('formPedido');
    const cliente = form.cliente.value;
    const mesa = form.mesa.value;
    const descuento = parseFloat(form.descuento.value) || 0;
    if (ticket.length === 0) return;
    const total = ticket.reduce((acc, p) => acc + p.total, 0) - descuento;
    const data = { tipo, productos: ticket, total, descuento, mesa, cliente };
    const res = await fetch(`${API_URL}/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const msg = document.getElementById('mensajePedido');
    if (res.ok) {
        msg.textContent = 'Pedido creado correctamente.';
        ticket = [];
        renderTicket();
        form.reset();
    } else {
        msg.textContent = 'Error al crear el pedido.';
    }
    setTimeout(() => { if(msg) msg.textContent = ''; }, 3000);
});

document.addEventListener('DOMContentLoaded', () => {
    mostrarSeccion('caja');
    cargarCategorias();
    cargarProductos();

    // Manejador para el formulario de administración de productos
    const formAdmin = document.getElementById('formAgregarProducto');
    if (formAdmin) {
        formAdmin.onsubmit = async function(e) {
            e.preventDefault();
            const form = e.target;
            const data = {
                nombre: form.nombre.value,
                descripcion: form.descripcion.value,
                precio: parseFloat(form.precio.value),
                categoria_id: parseInt(form.categoria.value)
            };
            const res = await fetch('/api/pedidos/productos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const msg = document.getElementById('mensajeAdmin');
            if (res.ok) {
                msg.textContent = 'Producto agregado correctamente.';
                form.reset();
            } else {
                msg.textContent = 'Error al agregar producto.';
            }
            setTimeout(() => { if(msg) msg.textContent = ''; }, 3000);
            cargarProductos();
        };
    }

    document.querySelector('button[onclick*="cocina"]')?.addEventListener('click', cargarPedidosCocina);
    document.querySelector('button[onclick*="barista"]')?.addEventListener('click', cargarPedidosBarista);

    document.getElementById('fechaReporte').value = new Date().toISOString().slice(0,10);
});
