class ReportesController {
    constructor(pedidoModel) {
        this.pedidoModel = pedidoModel;
    }

    async generarReporteDiario(req, res) {
        try {
            const fecha = req.query.fecha || new Date().toISOString().slice(0, 10);
            const reporte = await this.pedidoModel.obtenerReportesDiarios(fecha);
            res.status(200).json(reporte);
        } catch (error) {
            res.status(500).json({ message: 'Error al generar el reporte diario', error });
        }
    }
}

module.exports = ReportesController;