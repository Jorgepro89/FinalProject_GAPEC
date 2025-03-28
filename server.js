const fs = require("fs");
const https = require("https");
const express = require("express");
const path = require("path");

const app = express();

const options = {
  key: fs.readFileSync(path.join(__dirname, "certs", "server.key")),
  cert: fs.readFileSync(path.join(__dirname, "certs", "server.cert"))
};

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/creadores', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'creadores.html'));
});

https.createServer(options, app).listen(443, () => {
  console.log("🔒 Servidor HTTPS funcionando en puerto 443");
});
