const socket = io();

// Escuchar cuando se crea una partida
socket.on('partidaCreada', (id) => {
  console.log('ID de partida creado:', id);
  alert('ID de partida: ' + id); // ✅ Aquí ya funciona bien
});

// Escuchar cuando el jugador se une
socket.on('unido', (data) => {
  console.log(data.mensaje);
});

// Escuchar cuando los jugadores están listos
socket.on('jugadoresListos', () => {
  console.log('Jugadores listos, ¡comienza la partida!');
});

// Escuchar cuando se recibe una letra
socket.on('letraRecibida', (data) => {
  console.log('Letra recibida:', data.letra);
});

// Función para crear partida
function crearPartida(palabra) {
  socket.emit('crearPartida', { palabra });
}

// Función para unirse a una partida
function unirseAPartida(id) {
  socket.emit('unirsePartida', id);
}

// Función para enviar intento de letra
function enviarLetra(id, letra) {
  socket.emit('intentoLetra', { id, letra });
}
