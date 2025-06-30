const express = require('express');
const router = express.Router();
const PedidosController = require('../controllers/pedidosController');
const PedidoModel = require('../models/pedidoModel'); 

const pedidosController = new PedidosController(PedidoModel); 

router.post('/pedidos', (req, res) => {
    pedidosController.crearPedido(req, res);
});

router.get('/pedidos', (req, res) => {
    pedidosController.obtenerPedidos(req, res);
});

router.put('/pedidos/:id', (req, res) => {
    pedidosController.actualizarEstadoPedido(req, res);
});

router.get('/cocina', (req, res) => {
    pedidosController.obtenerPedidosCocina(req, res);
});
router.put('/cocina/:id/en-preparacion', (req, res) => {
    pedidosController.marcarPedidoEnPreparacion(req, res);
});
router.put('/cocina/:id/listo', (req, res) => {
    pedidosController.marcarPedidoListo(req, res);
});

// Pedidos para café/barista
router.get('/cafe', (req, res) => {
    pedidosController.obtenerPedidosCafe(req, res);
});
router.put('/cafe/:id/en-preparacion', (req, res) => {
    pedidosController.marcarPedidoEnPreparacion(req, res);
});
router.put('/cafe/:id/listo', (req, res) => {
    pedidosController.marcarPedidoListo(req, res);
});

router.get('/productos', (req, res) => {
    pedidosController.obtenerProductos(req, res);
});

router.get('/categorias', (req, res) => {
    pedidosController.obtenerCategorias(req, res);
});

router.post('/productos', (req, res) => {
    pedidosController.agregarProducto(req, res);
});

router.get('/pedidos/:id/historial', (req, res) => {
    pedidosController.obtenerHistorialPedido(req, res);
});

router.put('/productos/:id', (req, res) => {
    pedidosController.editarProducto(req, res);
});

router.delete('/productos/:id', (req, res) => {
    pedidosController.eliminarProducto(req, res);
});


module.exports = router;