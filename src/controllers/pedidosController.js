class PedidosController {
    constructor(pedidoModel) {
        this.pedidoModel = pedidoModel;
    }

    async crearPedido(req, res) {
        try {
            const { tipo, productos, total, descuento, mesa, cliente, usuario_id } = req.body;
            const nuevoPedido = await this.pedidoModel.crearPedido(tipo, productos, total, descuento, mesa, cliente, usuario_id);
            res.status(201).json(nuevoPedido);
        } catch (error) {
            res.status(500).json({ message: 'Error al crear el pedido', error });
        }
    }

    async obtenerHistorialPedido(req, res) {
        try {
            const { id } = req.params;
            const historial = await this.pedidoModel.obtenerHistorialPedido(id);
            res.status(200).json(historial);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener historial', error });
        }
    }

    async obtenerProductos(req, res) {
        try {
            const productos = await this.pedidoModel.obtenerProductos();
            res.status(200).json(productos);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener productos', error });
        }
    }

    async obtenerPedidos(req, res) {
        try {
            const pedidos = await this.pedidoModel.obtenerPedidos();
            res.status(200).json(pedidos);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener los pedidos', error });
        }
    }

    async obtenerPedidosCocina(req, res) {
        try {
            const pedidos = await this.pedidoModel.obtenerPedidosPorTipo('cocina');
            res.status(200).json(pedidos);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener los pedidos de cocina', error });
        }
    }

    async obtenerPedidosCafe(req, res) {
        try {
            const pedidos = await this.pedidoModel.obtenerPedidosPorTipo('cafe');
            res.status(200).json(pedidos);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener los pedidos de café', error });
        }
    }

    async actualizarEstadoPedido(req, res) {
        try {
            const { id } = req.params;
            const { estado } = req.body;
            const pedidoActualizado = await this.pedidoModel.actualizarEstadoPedido(id, estado);
            if (pedidoActualizado) {
                res.status(200).json(pedidoActualizado);
            } else {
                res.status(404).json({ message: 'Pedido no encontrado' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error al actualizar el estado del pedido', error });
        }
    }

    async marcarPedidoEnPreparacion(req, res) {
        try {
            const { id } = req.params;
            const pedidoActualizado = await this.pedidoModel.actualizarEstadoPedido(id, 'en_preparacion');
            if (pedidoActualizado) {
                res.status(200).json({ message: 'Pedido en preparación' });
            } else {
                res.status(404).json({ message: 'Pedido no encontrado' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error al actualizar el estado del pedido', error });
        }
    }

    async marcarPedidoListo(req, res) {
        try {
            const { id } = req.params;
            const pedidoActualizado = await this.pedidoModel.actualizarEstadoPedido(id, 'listo');
            if (pedidoActualizado) {
                res.status(200).json({ message: 'Pedido listo para entregar' });
            } else {
                res.status(404).json({ message: 'Pedido no encontrado' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error al actualizar el estado del pedido', error });
        }
    }

    async obtenerCategorias(req, res) {
        try {
            const categorias = await this.pedidoModel.obtenerCategorias();
            res.status(200).json(categorias);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener categorías', error });
        }
    }

    async agregarProducto(req, res) {
        try {
            const { nombre, descripcion, precio, categoria_id } = req.body;
            const producto = await this.pedidoModel.agregarProducto(nombre, descripcion, precio, categoria_id);
            res.status(201).json(producto);
        } catch (error) {
            res.status(500).json({ message: 'Error al agregar producto', error });
        }
    }

    async editarProducto(req, res) {
        try {
            const { id } = req.params;
            const { nombre, descripcion, precio, categoria_id } = req.body;
            const result = await this.pedidoModel.editarProducto(id, nombre, descripcion, precio, categoria_id);
            if (result) res.status(200).json({ message: 'Producto editado' });
            else res.status(404).json({ message: 'Producto no encontrado' });
        } catch (error) {
            res.status(500).json({ message: 'Error al editar producto', error });
        }
    }

    async eliminarProducto(req, res) {
        try {
            const { id } = req.params;
            const result = await this.pedidoModel.eliminarProducto(id);
            if (result) res.status(200).json({ message: 'Producto eliminado' });
            else res.status(404).json({ message: 'Producto no encontrado' });
        } catch (error) {
            res.status(500).json({ message: 'Error al eliminar producto', error });
        }
    }
}

module.exports = PedidosController;
// (No se requieren cambios aquí, ya que los métodos llaman al modelo y los nombres de tablas/campos ya están ajustados en el modelo.)