const fs = require("fs");
const https = require("https");
const express = require("express");
const path = require("path");
const axios = require("axios");
require('dotenv').config();

const app = express();
const server = https.createServer({
  key: fs.readFileSync(path.join(__dirname, 'certs', 'server.key')),
  cert: fs.readFileSync(path.join(__dirname, 'certs', 'server.cert'))
}, app);

const io = require("socket.io")(server);

const partidas = {}; // Guardar partidas aquí

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// API para obtener palabra secreta
app.post('/api/get-word', async (req, res) => {
  const { categoria } = req.body;
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Devuelve solo un JSON simple {"word": "palabra"} sin ```json.' },
        { role: 'user', content: `Dame una palabra secreta sobre ${categoria}.` }
      ]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      }
    });

    const cleanContent = response.data.choices[0].message.content
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const palabra = JSON.parse(cleanContent);

    console.log(`📢 Palabra secreta generada: ${palabra.word}`);
    res.json(palabra);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener palabra' });
  }
});

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Sockets
io.on('connection', (socket) => {
  console.log('🖥️ Nuevo cliente conectado');

  socket.on('crearPartida', ({ palabra }) => {
    const id = generarID();
    partidas[id] = {
      palabraSecreta: palabra.toUpperCase(),
      palabraMostrada: '_'.repeat(palabra.length),
      intentos: 6,
      letrasIncorrectas: [],
      jugadores: [socket.id]
    };
    socket.join(id);
    socket.emit('partidaCreada', id);
  });

  socket.on('unirsePartida', (id) => {
    if (partidas[id]) {
      partidas[id].jugadores.push(socket.id);
      socket.join(id);
      socket.emit('unido', id);
      io.to(id).emit('estadoActualizado', partidas[id]);
    } else {
      socket.emit('error', 'Partida no encontrada');
    }
  });

  socket.on('probarLetra', ({ id, letra }) => {
    const partida = partidas[id];
    if (!partida) return;

    letra = letra.toUpperCase();
    let acierto = false;

    for (let i = 0; i < partida.palabraSecreta.length; i++) {
      if (partida.palabraSecreta[i] === letra) {
        partida.palabraMostrada = partida.palabraMostrada.substring(0, i) + letra + partida.palabraMostrada.substring(i + 1);
        acierto = true;
      }
    }

    if (!acierto && !partida.letrasIncorrectas.includes(letra)) {
      partida.intentos--;
      partida.letrasIncorrectas.push(letra);
    }

    io.to(id).emit('estadoActualizado', partida);

    if (partida.palabraMostrada === partida.palabraSecreta) {
      io.to(id).emit('ganaron');
      delete partidas[id];
    } else if (partida.intentos === 0) {
      io.to(id).emit('perdieron', partida.palabraSecreta);
      delete partidas[id];
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Cliente desconectado');
  });
});

// Crear servidor HTTPS
server.listen(443, () => {
  console.log('🔒 Servidor HTTPS y WebSocket corriendo en https://localhost');
});

// Utilidad para ID
function generarID() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
