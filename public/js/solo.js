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

// Aquí va el resto de tu lógica de ahorcado como iniciarJuego(), probarLetra(), etc.
