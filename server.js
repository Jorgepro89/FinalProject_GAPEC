const axios = require('axios');

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

    res.json(response.data.choices[0].message.content);
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

    res.json(response.data.choices[0].message.content);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener palabra' });
  }
});
