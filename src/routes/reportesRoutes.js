const express = require('express');
const router = express.Router();
const ReportesController = require('../controllers/reportesController');
const PedidoModel = require('../models/pedidoModel'); 

const reportesController = new ReportesController(PedidoModel); 

router.get('/reporte-diario', reportesController.generarReporteDiario.bind(reportesController));

module.exports = router;