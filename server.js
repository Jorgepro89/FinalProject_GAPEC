const express = require('express');
const path = require('path');
const app = express();
const port = 80;

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/creadores', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'creadores.html'));
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor del ahorcado en: http://localhost:${port}`);
});
