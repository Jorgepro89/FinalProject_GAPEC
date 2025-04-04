const socket = io();

function crearPartida() {
  const palabra = prompt('Escribe la palabra secreta para la partida:');
  if (!palabra) return alert('Palabra inválida');
  socket.emit('crearPartida', { palabra });
}

socket.on('partidaCreada', (id) => {
  document.getElementById('idPartida').classList.remove('hidden');
  document.getElementById('codigoPartida').innerText = id;
});

function unirsePartida() {
  const id = document.getElementById('unirCodigo').value.trim().toUpperCase();
  if (!id) return;
  socket.emit('unirsePartida', id);
}

socket.on('unido', (id) => {
  window.location.href = `/juego-multi.html?id=${id}`;
});

socket.on('error', (mensaje) => {
  alert(mensaje);
});
