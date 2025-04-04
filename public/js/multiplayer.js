const socket = io(); // 🚀

function crearPartida() {
  const tema = document.getElementById('tema').value.trim();
  if (tema !== '') {
    // Primero pedimos a la API la palabra basada en la categoría
    fetch('/api/get-word', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoria: tema })
    })
    .then(response => response.json())
    .then(data => {
      console.log('Palabra generada por IA:', data.word);
      socket.emit('crearPartida', { palabra: data.word });
    })
    .catch(error => {
      console.error('Error obteniendo palabra:', error);
      alert('Error obteniendo palabra.');
    });
  } else {
    alert('Por favor escribe una categoría.');
  }
}

function unirsePartida() {
  const id = document.getElementById('inputPartida').value.trim();
  if (id !== '') {
    socket.emit('unirsePartida', id);
  } else {
    alert('Por favor ingresa un ID de partida válido.');
  }
}

// Recibe ID de la partida creada
socket.on('partidaCreada', (id) => {
  console.log('🎯 ID de partida creado:', id);
  alert('🎯 ID de partida: ' + id);
});

// Confirmación de unión a partida
socket.on('unido', (data) => {
  console.log('✅', data.mensaje);
  alert('✅ Te has unido a la partida');
});

// Jugadores listos
socket.on('jugadoresListos', () => {
  console.log('🎯 Jugadores listos, ¡comienza la partida!');
});

// Cuando llega una letra
socket.on('letraRecibida', (data) => {
  console.log('Letra recibida:', data.letra);
});
