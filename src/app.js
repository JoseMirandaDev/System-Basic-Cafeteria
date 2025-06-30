const express = require('express');
const bodyParser = require('body-parser');
const pedidosRoutes = require('./routes/pedidosRoutes');
const reportesRoutes = require('./routes/reportesRoutes');
const database = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use('/api/pedidos', pedidosRoutes);
app.use('/api/reportes', reportesRoutes);

app.get('/api', (req, res) => {
  res.json({ status: 'API funcionando', endpoints: ['/api/pedidos', '/api/reportes'] });
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado en ${PORT}`);
});