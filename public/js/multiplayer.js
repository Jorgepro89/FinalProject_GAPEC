const socket = io(); // 🚀

function crearPartida(palabra) {
  socket.emit('crearPartida', { palabra });
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
  console.log('ID de partida creado:', id);
  alert('🎯 ID de partida: ' + id);
});

// Confirmación de unión a partida
socket.on('unido', (data) => {
  console.log(data.mensaje);
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
