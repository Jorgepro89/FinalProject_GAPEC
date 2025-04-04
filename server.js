const fs = require("fs");
const https = require("https");
const http = require("http");
const express = require("express");
const path = require("path");
const axios = require("axios");
const { Server } = require("socket.io");
require('dotenv').config(); // Cargar variables de entorno

const app = express();

// Middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// API para obtener 5 categorías (Solo)
app.post('/api/get-categories', async (req, res) => {
  const { tema } = req.body;
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Responde SOLO un arreglo JSON plano como ["cat1", "cat2", "cat3"]. No uses ```json ni ningún otro formato.' },
        { role: 'user', content: `Dame 5 subcategorías de ${tema}.` }
      ]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      }
    });

    let content = response.data.choices[0].message.content;
    content = content.replace(/```json|```/g, '').trim();

    console.log('📋 Categorías recibidas de OpenAI:', content);

    res.json(JSON.parse(content));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

// API para obtener una palabra secreta (Solo y Multijugador)
app.post('/api/get-word', async (req, res) => {
  const { categoria } = req.body;
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Devuelve solo un JSON con una palabra secreta, sin ```json ni otros caracteres.' },
        { role: 'user', content: `Dame una palabra secreta de la categoría ${categoria}. Responde solo en JSON {"word": "palabra"}.` }
      ]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      }
    });

    let content = response.data.choices[0].message.content;
    content = content.replace(/```json|```/g, '').trim();

    const data = JSON.parse(content);

    console.log(`📢 Palabra secreta generada para la categoría "${categoria}": ${data.word}`);

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener palabra' });
  }
});

// Ruta principal
app.get('/', (req, res) => {
  const userAgent = req.get('User-Agent') || '';
  if (userAgent.includes('curl')) {
    res.send('✅ Conexión correcta al servidor HTTPS.');
  } else {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
  }
});

// Configuración HTTPS
const options = {
  key: fs.readFileSync(path.join(__dirname, 'certs', 'server.key')),
  cert: fs.readFileSync(path.join(__dirname, 'certs', 'server.cert'))
};

// Crear servidor HTTPS
const server = https.createServer(options, app);

// Socket.IO para Multijugador
const io = new Server(server);

const partidas = {}; // { idPartida: { palabra: '...', jugadores: [socketId1, socketId2] } }

io.on('connection', (socket) => {
  console.log('🔌 Nuevo cliente conectado');

  socket.on('crearPartida', (palabra) => {
    const id = Math.random().toString(36).substring(2, 8);
    partidas[id] = { palabra, jugadores: [socket.id] };
    socket.emit('partidaCreada', id); // 🔥 SOLO enviamos el id directamente
    console.log(`🎯 Nueva partida creada - ID: ${id} | Palabra: ${palabra}`);
  });

  socket.on('unirsePartida', (id) => {
    if (partidas[id]) {
      partidas[id].jugadores.push(socket.id);
      socket.join(id);
      socket.emit('unido', { mensaje: 'Te has unido a la partida.' });
      io.to(id).emit('jugadoresListos');
      console.log(`👥 Un jugador se unió a la partida: ${id}`);
    } else {
      socket.emit('error', { mensaje: 'ID de partida no válido.' });
    }
  });

  socket.on('intentoLetra', ({ id, letra }) => {
    io.to(id).emit('letraRecibida', { letra });
  });

  socket.on('disconnect', () => {
    console.log('❌ Cliente desconectado');
    for (const id in partidas) {
      partidas[id].jugadores = partidas[id].jugadores.filter(j => j !== socket.id);
      if (partidas[id].jugadores.length === 0) {
        delete partidas[id];
        console.log(`🗑️ Partida eliminada: ${id}`);
      }
    }
  });
});


// Lanzar el servidor HTTPS
server.listen(443, () => {
  console.log('🔒 Servidor HTTPS corriendo en https://localhost');
});

// Redireccionar HTTP ➔ HTTPS
http.createServer((req, res) => {
  res.writeHead(301, { "Location": "https://" + req.headers.host + req.url });
  res.end();
}).listen(80);
