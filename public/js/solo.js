let palabraActual = '';
let palabraMostrada = '';
let errores = 0;
const maxErrores = 6;

function enviarTema() {
  const tema = document.getElementById('tema').value.trim();
  if (!tema) {
    alert('Por favor escribe un tema.');
    return;
  }

  fetch('/api/get-categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tema: tema })
  })
  .then(response => response.json())
  .then(categorias => {
    const contenedor = document.getElementById('categorias');
    contenedor.innerHTML = '';

    categorias.forEach(cat => {
      const boton = document.createElement('button');
      boton.textContent = cat;
      boton.onclick = () => seleccionarCategoria(cat);
      contenedor.appendChild(boton);
    });
  })
  .catch(error => {
    console.error(error);
    alert('Error al obtener las categorías');
  });
}

function seleccionarCategoria(categoria) {
  fetch('/api/get-word', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ categoria: categoria })
  })
  .then(response => response.json())
  .then(data => {
    palabraActual = data.word.toUpperCase();
    palabraMostrada = '_'.repeat(palabraActual.length);
    document.getElementById('palabra-secreta').innerText = palabraMostrada.split('').join(' ');
    errores = 0;
    limpiarCanvas();
  })
  .catch(error => {
    console.error(error);
    alert('Error al obtener la palabra');
  });
}

function probarLetra() {
  const letra = document.getElementById('letra').value.toUpperCase();
  if (!letra) return;

  let nuevaPalabra = '';
  let acierto = false;
  for (let i = 0; i < palabraActual.length; i++) {
    if (palabraActual[i] === letra) {
      nuevaPalabra += letra;
      acierto = true;
    } else {
      nuevaPalabra += palabraMostrada[i];
    }
  }

  palabraMostrada = nuevaPalabra;
  document.getElementById('palabra-secreta').innerText = palabraMostrada.split('').join(' ');

  if (!acierto) {
    errores++;
    dibujarAhorcado();
  }

  if (palabraMostrada === palabraActual) {
    alert('🎉 ¡Ganaste!');
  } else if (errores >= maxErrores) {
    alert('💀 ¡Perdiste! La palabra era: ' + palabraActual);
  }

  document.getElementById('letra').value = '';
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
  ctx.strokeStyle = 'black';

  if (errores === 1) {
    ctx.beginPath();
    ctx.moveTo(10, 390);
    ctx.lineTo(290, 390);
    ctx.stroke();
  }
  if (errores === 2) {
    ctx.beginPath();
    ctx.moveTo(50, 390);
    ctx.lineTo(50, 50);
    ctx.lineTo(200, 50);
    ctx.lineTo(200, 100);
    ctx.stroke();
  }
  if (errores === 3) {
    ctx.beginPath();
    ctx.arc(200, 130, 30, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (errores === 4) {
    ctx.beginPath();
    ctx.moveTo(200, 160);
    ctx.lineTo(200, 250);
    ctx.stroke();
  }
  if (errores === 5) {
    ctx.beginPath();
    ctx.moveTo(200, 180);
    ctx.lineTo(170, 220);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(200, 180);
    ctx.lineTo(230, 220);
    ctx.stroke();
  }
  if (errores === 6) {
    ctx.beginPath();
    ctx.moveTo(200, 250);
    ctx.lineTo(170, 300);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(200, 250);
    ctx.lineTo(230, 300);
    ctx.stroke();
  }
}
