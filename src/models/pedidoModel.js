const db = require('../config/database');

class PedidoModel {
    static crearPedido(tipo, productos, total, descuento = 0, mesa = null, cliente = null, usuario_id = null) {
        return new Promise((resolve, reject) => {
            const query = 'INSERT INTO pedidos (tipo, total, descuento, mesa, cliente, usuario_id) VALUES (?, ?, ?, ?, ?, ?)';
            db.query(query, [tipo, total, descuento, mesa, cliente, usuario_id], (error, results) => {
                if (error) return reject(error);
                const pedidoId = results.insertId;
                if (productos && productos.length > 0) {
                    // Insertar detalles
                    const detalles = productos.map(p => [
                        pedidoId, p.producto_id, p.cantidad, p.precio_unitario, p.cantidad * p.precio_unitario
                    ]);
                    const detalleQuery = 'INSERT INTO pedido_detalles (pedido_id, producto_id, cantidad, precio_unitario, total) VALUES ?';
                    db.query(detalleQuery, [detalles], (err) => {
                        if (err) return reject(err);
                        // Insertar historial de estado inicial
                        db.query('INSERT INTO pedido_estado_historial (pedido_id, estado, usuario_id) VALUES (?, ?, ?)', [pedidoId, 'pendiente', usuario_id], (histErr) => {
                            if (histErr) return reject(histErr);
                            resolve({ id: pedidoId, tipo, productos, total, descuento, mesa, cliente, estado: 'pendiente' });
                        });
                    });
                } else {
                    // Sin productos, solo historial
                    db.query('INSERT INTO pedido_estado_historial (pedido_id, estado, usuario_id) VALUES (?, ?, ?)', [pedidoId, 'pendiente', usuario_id], (histErr) => {
                        if (histErr) return reject(histErr);
                        resolve({ id: pedidoId, tipo, productos, total, descuento, mesa, cliente, estado: 'pendiente' });
                    });
                }
            });
        });
    }

    static obtenerProductos(filtrarActivos = true, categoria_id = null) {
        return new Promise((resolve, reject) => {
            let query = `
                SELECT p.id, p.nombre, p.descripcion, p.precio, p.categoria_id, c.nombre as categoria, p.activo
                FROM productos p
                LEFT JOIN categorias c ON p.categoria_id = c.id
            `;
            const params = [];
            if (filtrarActivos) {
                query += ' WHERE p.activo = 1';
            }
            if (categoria_id) {
                query += filtrarActivos ? ' AND' : ' WHERE';
                query += ' p.categoria_id = ?';
                params.push(categoria_id);
            }
            db.query(query, params, (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }

    static obtenerPedidos() {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT p.*, 
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'producto_id', pr.id,
                            'nombre', pr.nombre,
                            'cantidad', pd.cantidad,
                            'precio_unitario', pd.precio_unitario,
                            'total', pd.total
                        )
                    ) as productos
                FROM pedidos p
                LEFT JOIN pedido_detalles pd ON p.id = pd.pedido_id
                LEFT JOIN productos pr ON pd.producto_id = pr.id
                GROUP BY p.id
            `;
            db.query(query, (error, results) => {
                if (error) return reject(error);
                results.forEach(r => {
                    try {
                        r.productos = JSON.parse(r.productos);
                    } catch {
                        r.productos = [];
                    }
                });
                resolve(results);
            });
        });
    }

    static actualizarEstadoPedido(id, estado, usuario_id = null) {
        return new Promise((resolve, reject) => {
            const query = 'UPDATE pedidos SET estado = ? WHERE id = ?';
            db.query(query, [estado, id], (error, results) => {
                if (error) return reject(error);
                // Guardar historial
                db.query('INSERT INTO pedido_estado_historial (pedido_id, estado, usuario_id) VALUES (?, ?, ?)', [id, estado, usuario_id], (histErr) => {
                    if (histErr) return reject(histErr);
                    resolve(results.affectedRows);
                });
            });
        });
    }

    static obtenerHistorialPedido(pedido_id) {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM pedido_estado_historial WHERE pedido_id = ? ORDER BY fecha ASC', [pedido_id], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }

    static obtenerPedidosPorTipo(tipo) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT p.id, p.estado, p.fecha, p.total,
                    JSON_ARRAYAGG(
                        IF(pr.id IS NOT NULL,
                            JSON_OBJECT(
                                'producto_id', pr.id,
                                'nombre', pr.nombre,
                                'cantidad', pd.cantidad,
                                'precio_unitario', pd.precio_unitario,
                                'total', pd.total
                            ),
                            NULL
                        )
                    ) as productos
                FROM pedidos p
                LEFT JOIN pedido_detalles pd ON p.id = pd.pedido_id
                LEFT JOIN productos pr ON pd.producto_id = pr.id
                WHERE p.tipo = ? AND p.estado != 'listo'
                GROUP BY p.id
                ORDER BY p.fecha ASC
            `;
            db.query(query, [tipo], (error, results) => {
                if (error) {
                    return reject(error);
                }
                results.forEach(r => {
                    try {
                        let arr = JSON.parse(r.productos);
                        // Filtra nulos (cuando no hay productos)
                        r.productos = Array.isArray(arr) ? arr.filter(x => x !== null) : [];
                    } catch {
                        r.productos = [];
                    }
                });
                resolve(results);
            });
        });
    }

    static obtenerReportesDiarios(fecha) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    DATE(fecha) as fecha,
                    COUNT(*) as totalPedidos,
                    SUM(total) as totalVentas
                FROM pedidos
                WHERE DATE(fecha) = ?
                GROUP BY DATE(fecha)
            `;
            db.query(query, [fecha], (error, results) => {
                if (error) {
                    return reject(error);
                }
                // Obtener detalles de los pedidos del día con productos
                const detallesQuery = `
                    SELECT p.id, p.tipo, p.estado, p.total, p.fecha,
                        JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'producto_id', pr.id,
                                'nombre', pr.nombre,
                                'cantidad', pd.cantidad,
                                'precio_unitario', pd.precio_unitario,
                                'total', pd.total
                            )
                        ) as productos
                    FROM pedidos p
                    LEFT JOIN pedido_detalles pd ON p.id = pd.pedido_id
                    LEFT JOIN productos pr ON pd.producto_id = pr.id
                    WHERE DATE(p.fecha) = ?
                    GROUP BY p.id
                    ORDER BY p.fecha ASC
                `;
                db.query(detallesQuery, [fecha], (err, detalles) => {
                    if (err) {
                        return reject(err);
                    }
                    detalles.forEach(r => {
                        try {
                            r.productos = JSON.parse(r.productos);
                        } catch {
                            r.productos = [];
                        }
                    });
                    const reporte = results[0] || { fecha, totalPedidos: 0, totalVentas: 0 };
                    reporte.detalles = detalles;
                    resolve(reporte);
                });
            });
        });
    }

    static agregarProducto(nombre, descripcion, precio, categoria_id) {
        return new Promise((resolve, reject) => {
            const query = 'INSERT INTO productos (nombre, descripcion, precio, categoria_id) VALUES (?, ?, ?, ?)';
            db.query(query, [nombre, descripcion, precio, categoria_id], (error, results) => {
                if (error) return reject(error);
                resolve({ id: results.insertId, nombre, descripcion, precio, categoria_id });
            });
        });
    }

    static obtenerCategorias() {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM categorias', (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }

    static editarProducto(id, nombre, descripcion, precio, categoria_id) {
        return new Promise((resolve, reject) => {
            const query = 'UPDATE productos SET nombre=?, descripcion=?, precio=?, categoria_id=? WHERE id=?';
            db.query(query, [nombre, descripcion, precio, categoria_id, id], (error, results) => {
                if (error) return reject(error);
                resolve(results.affectedRows);
            });
        });
    }

    static eliminarProducto(id) {
        return new Promise((resolve, reject) => {
            const query = 'UPDATE productos SET activo=0 WHERE id=?';
            db.query(query, [id], (error, results) => {
                if (error) return reject(error);
                resolve(results.affectedRows);
            });
        });
    }
}

module.exports = PedidoModel;