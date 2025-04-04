let palabraSecreta = '';
let palabraAdivinada = '';
let errores = 0;
let letrasIncorrectas = [];

async function enviarTema() {
  const tema = document.getElementById('tema').value;
  const res = await fetch('/api/get-categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tema })
  });
  const categorias = JSON.parse(await res.json());

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
  const data = JSON.parse(await res.json());
  palabraSecreta = data.word.toUpperCase();
  palabraAdivinada = '_'.repeat(palabraSecreta.length);

  document.getElementById('palabra-oculta').innerText = palabraAdivinada.split('').join(' ');
  document.getElementById('categorias').classList.add('hidden');
  document.getElementById('juego').classList.remove('hidden');
  dibujarBase();
}

function probarLetra() {
  const input = document.getElementById('letra');
  const letra = input.value.toUpperCase();
  input.value = '';

  if (!letra || letrasIncorrectas.includes(letra) || palabraAdivinada.includes(letra)) return;

  if (palabraSecreta.includes(letra)) {
    let nuevaPalabra = '';
    for (let i = 0; i < palabraSecreta.length; i++) {
      nuevaPalabra += (palabraSecreta[i] === letra) ? letra : palabraAdivinada[i];
    }
    palabraAdivinada = nuevaPalabra;
    document.getElementById('palabra-oculta').innerText = palabraAdivinada.split('').join(' ');

    if (!palabraAdivinada.includes('_')) {
      alert('🎉 ¡Ganaste!');
      location.reload();
    }
  } else {
    errores++;
    letrasIncorrectas.push(letra);
    document.getElementById('letras-incorrectas').innerText = 'Incorrectas: ' + letrasIncorrectas.join(', ');
    dibujarAhorcado();
    if (errores === 6) {
      alert('💀 ¡Perdiste! La palabra era: ' + palabraSecreta);
      location.reload();
    }
  }
}

function dibujarBase() {
  const ctx = document.getElementById('canvas').getContext('2d');
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(10, 240);
  ctx.lineTo(190, 240);
  ctx.moveTo(50, 240);
  ctx.lineTo(50, 10);
  ctx.lineTo(150, 10);
  ctx.lineTo(150, 40);
  ctx.stroke();
}

function dibujarAhorcado() {
  const ctx = document.getElementById('canvas').getContext('2d');
  ctx.lineWidth = 2;
  switch (errores) {
    case 1: ctx.beginPath(); ctx.arc(150, 60, 20, 0, Math.PI * 2); ctx.stroke(); break; // cabeza
    case 2: ctx.beginPath(); ctx.moveTo(150, 80); ctx.lineTo(150, 140); ctx.stroke(); break; // cuerpo
    case 3: ctx.beginPath(); ctx.moveTo(150, 90); ctx.lineTo(120, 120); ctx.stroke(); break; // brazo izq
    case 4: ctx.beginPath(); ctx.moveTo(150, 90); ctx.lineTo(180, 120); ctx.stroke(); break; // brazo der
    case 5: ctx.beginPath(); ctx.moveTo(150, 140); ctx.lineTo(120, 190); ctx.stroke(); break; // pierna izq
    case 6: ctx.beginPath(); ctx.moveTo(150, 140); ctx.lineTo(180, 190); ctx.stroke(); break; // pierna der
  }
}
