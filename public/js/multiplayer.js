const socket = io();
let idPartida = '';
let palabraOculta = [];
let errores = 0;
const maxErrores = 6;
const canvas = document.getElementById('canvas');
const ctx = canvas ? canvas.getContext('2d') : null;

function crearPartida() {
  const tema = document.getElementById('tema').value.trim();
  if (tema !== '') {
    fetch('/api/get-word', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoria: tema })
    })
    .then(response => response.json())
    .then(data => {
      console.log('Palabra generada:', data.word);
      socket.emit('crearPartida', data.word.toUpperCase());
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
    idPartida = id;
  } else {
    alert('Por favor ingresa un ID de partida válido.');
  }
}

socket.on('partidaCreada', (id) => {
  console.log('ID de partida creado:', id);
  alert('🎯 ID de partida: ' + id);
  idPartida = id;
});

socket.on('jugadoresListos', ({ palabraOculta: inicial }) => {
  palabraOculta = inicial;
  errores = 0;
  document.getElementById('inicio').style.display = 'none';
  document.getElementById('juego').style.display = 'block';
  dibujarTodo();
});

socket.on('actualizarEstado', ({ palabraOculta: nueva, errores: nuevosErrores }) => {
  palabraOculta = nueva;
  errores = nuevosErrores;
  dibujarTodo();
});

function enviarLetra() {
  const letra = document.getElementById('letraInput').value.toUpperCase();
  document.getElementById('letraInput').value = '';
  if (letra && idPartida) {
    socket.emit('intentoLetra', { id: idPartida, letra });
  }
}

function dibujarTodo() {
  actualizarPalabra();
  dibujarAhorcado();
}

function actualizarPalabra() {
  document.getElementById('palabraSecreta').innerText = palabraOculta.join(' ');
}

function dibujarAhorcado() {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.moveTo(10, 190);
  ctx.lineTo(190, 190);
  ctx.moveTo(50, 190);
  ctx.lineTo(50, 10);
  ctx.lineTo(150, 10);
  ctx.lineTo(150, 30);
  if (errores > 0) ctx.arc(150, 40, 10, 0, Math.PI * 2);
  if (errores > 1) { ctx.moveTo(150, 50); ctx.lineTo(150, 100); }
  if (errores > 2) { ctx.moveTo(150, 60); ctx.lineTo(130, 80); }
  if (errores > 3) { ctx.moveTo(150, 60); ctx.lineTo(170, 80); }
  if (errores > 4) { ctx.moveTo(150, 100); ctx.lineTo(130, 130); }
  if (errores > 5) { ctx.moveTo(150, 100); ctx.lineTo(170, 130); }
  ctx.stroke();
}
