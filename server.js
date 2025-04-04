const fs = require("fs");
const https = require("https");
const express = require("express");
const path = require("path");
const axios = require("axios");
require('dotenv').config(); // Cargar variables de entorno

const app = express();

// Middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// API para obtener categorías
app.post('/api/get-categories', async (req, res) => {
  const { tema } = req.body;
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Eres un asistente que devuelve solo subcategorías, en formato JSON.' },
        { role: 'user', content: `Dame 5 subcategorías de ${tema}. Solo JSON simple.` }
      ]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      }
    });

    res.json(JSON.parse(response.data.choices[0].message.content));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

// API para obtener una palabra secreta
app.post('/api/get-word', async (req, res) => {
  const { categoria } = req.body;
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Devuelve una sola palabra relacionada en formato JSON {"word": "palabra"}.' },
        { role: 'user', content: `Dame una palabra secreta de la categoría ${categoria}.` }
      ]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      }
    });

    res.json(JSON.parse(response.data.choices[0].message.content));
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

// HTTPS
const options = {
  key: fs.readFileSync(path.join(__dirname, 'certs', 'server.key')),
  cert: fs.readFileSync(path.join(__dirname, 'certs', 'server.cert'))
};

https.createServer(options, app).listen(443, () => {
  console.log('🔒 Servidor HTTPS corriendo en https://localhost');
});
