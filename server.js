const fs = require("fs");
const https = require("https");
const express = require("express");
const path = require("path");
const axios = require("axios");
require('dotenv').config(); // Si usas .env para claves

const app = express(); // <<<<<< NECESARIO

// Configuración para servir archivos estáticos y leer JSON
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // <<<<<< NECESARIO para leer req.body en POST

// --------- TUS RUTAS CON OPENAI ---------

// Ruta para obtener 5 subcategorías
app.post('/api/get-categories', async (req, res) => {
  const { tema } = req.body;

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Eres un asistente que devuelve solo subcategorías, en forma de lista JSON, sin explicaciones.' },
        { role: 'user', content: `Dame 5 subcategorías de ${tema}. Solo responde en formato JSON simple.` }
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

// Ruta para obtener palabra secreta
app.post('/api/get-word', async (req, res) => {
  const { categoria } = req.body;

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Eres un asistente que devuelve una sola palabra, relacionada a la categoría, sin explicaciones, solo la palabra en JSON {"word": "palabra" }.' },
        { role: 'user', content: `Dame una palabra secreta sobre ${categoria}.` }
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

// --------- FIN TUS RUTAS ---------

// --------- CONFIGURAR HTTPS ---------

// Cargar los certificados SSL
const options = {
  key: fs.readFileSync(path.join(__dirname, 'certs', 'server.key')),
  cert: fs.readFileSync(path.join(__dirname, 'certs', 'server.cert'))
};

// Crear el servidor HTTPS
https.createServer(options, app).listen(443, () => {
  console.log('🔒 Servidor HTTPS corriendo en https://localhost');
});
