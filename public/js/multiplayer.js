const socket = io();

function generarPalabra() {
  const categoria = document.getElementById('categoria').value.trim();
  if (!categoria) return alert('Escribe una categoría válida');

  fetch('/api/get-word', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ categoria: categoria })
  })
  .then(response => response.json())
  .then(data => {
    const palabra = data.word;
    if (palabra) {
      socket.emit('crearPartida', { palabra });
    } else {
      alert('No se pudo generar la palabra');
    }
  })
  .catch(err => {
    console.error(err);
    alert('Error al generar palabra');
  });
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
