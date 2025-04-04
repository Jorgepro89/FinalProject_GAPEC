const socket = io();

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');

socket.emit('unirsePartida', id);

let partidaActual = null;

socket.on('estadoActualizado', (partida) => {
  partidaActual = partida;
  actualizarPantalla();
});

socket.on('ganaron', () => {
  alert('¡Ganaron! 🎉');
  window.location.href = '/';
});

socket.on('perdieron', (palabra) => {
  alert(`¡Perdieron! La palabra era: ${palabra}`);
  window.location.href = '/';
});

function probarLetra() {
  const letraInput = document.getElementById('letra');
  const letra = letraInput.value.toUpperCase();
  letraInput.value = '';
  if (letra && letra.length === 1) {
    socket.emit('probarLetra', { id, letra });
  }
}

function actualizarPantalla() {
  if (!partidaActual) return;

  document.getElementById('palabra-oculta').innerText = partidaActual.palabraMostrada.split('').join(' ');
  document.getElementById('letras-incorrectas').innerText = 'Letras incorrectas: ' + partidaActual.letrasIncorrectas.join(', ');
  limpiarCanvas();
  dibujarAhorcado(6 - partidaActual.intentos);
}

function limpiarCanvas() {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function dibujarAhorcado(fallos) {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  ctx.lineWidth = 2;

  if (fallos > 0) {
    ctx.beginPath();
    ctx.arc(100, 50, 20, 0, Math.PI * 2); // Cabeza
    ctx.stroke();
  }
  if (fallos > 1) {
    ctx.beginPath();
    ctx.moveTo(100, 70);
    ctx.lineTo(100, 120); // Cuerpo
    ctx.stroke();
  }
  if (fallos > 2) {
    ctx.beginPath();
    ctx.moveTo(100, 80);
    ctx.lineTo(80, 100); // Brazo izq
    ctx.stroke();
  }
  if (fallos > 3) {
    ctx.beginPath();
    ctx.moveTo(100, 80);
    ctx.lineTo(120, 100); // Brazo der
    ctx.stroke();
  }
  if (fallos > 4) {
    ctx.beginPath();
    ctx.moveTo(100, 120);
    ctx.lineTo(80, 150); // Pierna izq
    ctx.stroke();
  }
  if (fallos > 5) {
    ctx.beginPath();
    ctx.moveTo(100, 120);
    ctx.lineTo(120, 150); // Pierna der
    ctx.stroke();
  }
}
