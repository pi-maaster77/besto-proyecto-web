const escribir = document.getElementById("escribir"); // Obtener donde se escribiran los articulos

async function actualizarLikes() { // Actualizar los likes.
  const likesArticulos = await fetch('/likes') // Obtener los likes actualizados.
  const cantidad = await likesArticulos.json() // Transformar lo obtenido en objeto.
  for(articulo of cantidad.articulos){ // Por cada articulo, obtener el contador de likes [1] y actualizarlo [2].
    const actualizar = document.getElementById(`cantidad-likes${articulo.id}`) // 1
    actualizar.innerHTML = articulo.likes // 2
    
  }
}
async function mostrarArticulos() {
  try {
    const response = await fetch(`/articles`); // Obtener los datos de la pagina api.
    if (!response.ok) { // Verificar si el servidor respondio
      throw new Error(`Error al obtener datos del servidor: ${response.status}`); // De no ser el caso, Informar.
    }

    const data = await response.json(); // Convertir lo obtenido
    console.log(data)
    
    for (const articulo of data) { // Por cada articulo, verificar si el usuario le dio like [1] y escribir el articulo [2].
      agregarArticulo(articulo); // 2
    }
  } catch (error) { // Verificar si hay algun error y mostrarlo.
    console.error(`Error al obtener y mostrar artículos: ${error}`);
  }
}

setInterval(mostrarArticulos, 10000);