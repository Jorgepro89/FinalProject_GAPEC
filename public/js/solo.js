let palabraSecreta = '';
let palabraMostrada = '';
let intentos = 6;
let letrasIncorrectas = [];

async function enviarTema() {
  const tema = document.getElementById('tema').value.trim();
  if (!tema) return alert('Escribe un tema primero.');

  const res = await fetch('/api/get-categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tema })
  });

  const categorias = await res.json();

  const divCategorias = document.getElementById('categorias');
  divCategorias.innerHTML = '<h2>Elige una categoría:</h2>';
  categorias.forEach(cat => {
    const btn = document.createElement('button');
    btn.innerText = cat;
    btn.onclick = () => seleccionarCategoria(cat);
    divCategorias.appendChild(btn);
  });

  document.getElementById('tema-input').classList.add('hidden');
  divCategorias.classList.remove('hidden');
}

async function seleccionarCategoria(categoria) {
  const res = await fetch('/api/get-word', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ categoria })
  });

  const data = await res.json();
  palabraSecreta = data.word.toUpperCase();
  iniciarJuego();
}

function iniciarJuego() {
  palabraMostrada = '_'.repeat(palabraSecreta.length);
  document.getElementById('palabra-oculta').innerText = palabraMostrada.split('').join(' ');
  document.getElementById('juego').classList.remove('hidden');
  letrasIncorrectas = [];
  intentos = 6;
  limpiarCanvas();
}

function probarLetra() {
  const input = document.getElementById('letra');
  const letra = input.value.toUpperCase();
  input.value = '';

  if (!letra || letra.length !== 1) return;

  if (palabraSecreta.includes(letra)) {
    let nuevaPalabra = '';
    for (let i = 0; i < palabraSecreta.length; i++) {
      if (palabraSecreta[i] === letra) {
        nuevaPalabra += letra;
      } else {
        nuevaPalabra += palabraMostrada[i];
      }
    }
    palabraMostrada = nuevaPalabra;
    document.getElementById('palabra-oculta').innerText = palabraMostrada.split('').join(' ');

    if (!palabraMostrada.includes('_')) {
      alert('¡Ganaste!');
    }
  } else {
    if (!letrasIncorrectas.includes(letra)) {
      letrasIncorrectas.push(letra);
      intentos--;
      dibujarAhorcado();
      document.getElementById('letras-incorrectas').innerText = 'Letras incorrectas: ' + letrasIncorrectas.join(', ');
      if (intentos === 0) {
        alert('¡Perdiste! La palabra era: ' + palabraSecreta);
      }
    }
  }
}

function limpiarCanvas() {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function dibujarAhorcado() {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  ctx.lineWidth = 2;

  if (intentos === 5) {
    ctx.beginPath();
    ctx.arc(100, 50, 20, 0, Math.PI * 2); // Cabeza
    ctx.stroke();
  }
  if (intentos === 4) {
    ctx.beginPath();
    ctx.moveTo(100, 70);
    ctx.lineTo(100, 120); // Cuerpo
    ctx.stroke();
  }
  if (intentos === 3) {
    ctx.beginPath();
    ctx.moveTo(100, 80);
    ctx.lineTo(80, 100); // Brazo izquierdo
    ctx.stroke();
  }
  if (intentos === 2) {
    ctx.beginPath();
    ctx.moveTo(100, 80);
    ctx.lineTo(120, 100); // Brazo derecho
    ctx.stroke();
  }
  if (intentos === 1) {
    ctx.beginPath();
    ctx.moveTo(100, 120);
    ctx.lineTo(80, 150); // Pierna izquierda
    ctx.stroke();
  }
  if (intentos === 0) {
    ctx.beginPath();
    ctx.moveTo(100, 120);
    ctx.lineTo(120, 150); // Pierna derecha
    ctx.stroke();
  }
}
