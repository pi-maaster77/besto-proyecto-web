const escribir = document.getElementById("escribir"); // Obtener donde se escribiran los articulos

function agregarArticulo(articulo) {
  escribir.innerHTML += `
<article id="articulo-${articulo.id}" class="articulo">
    <p class="autor">${articulo.user}</p>
    <h2 class="titulo">${articulo.title}</h2>
    <img src="/image?name=${articulo.image}" class="imagen-articulo">
    <div class="botones">
        <button class="abrir-comentarios" onclick="abrirComentarios(${articulo.id})">💬</button>
        <button class="dar-like" onclick="anadirLike(${articulo.id})">🤍 
          <span id="likes-${articulo.id}">${articulo.likes}</span>
        </button>
    </div>
</article>
`;
}

async function mostrarArticulos() {
  try {
    const response = await fetch(`/articles`); // Obtener los datos de la pagina api.
    if (!response.ok) { // Verificar si el servidor respondio
      throw new Error(`Error al obtener datos del servidor: ${response.status}`); // De no ser el caso, Informar.
    }

    const data = await response.json(); // Convertir lo obtenido
    
    for (const articulo of data) { // Por cada articulo, verificar si el usuario le dio like [1] y escribir el articulo [2].
      agregarArticulo(articulo); // 2
    }
  } catch (error) { // Verificar si hay algun error y mostrarlo.
    console.error(`Error al obtener y mostrar artículos: ${error}`);
  }
}

mostrarArticulos()