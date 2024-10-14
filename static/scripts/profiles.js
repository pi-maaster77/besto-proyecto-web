const profile = document.getElementById("profile");
const articles = document.getElementById("posts");

const params = new URLSearchParams(window.location.search);
id = params.get("id")

async function visualizarPerfil() {
  let id_usuario = 0
  const usuario = await fetch(`/getuser?id=${id}`)
  const respuesta = await usuario.json()
  const token = localStorage.getItem("token");
  if (token) {
    const temp = await fetch(`/username?token=${token}`)
    const sesion = await temp.json()
    id_usuario = sesion.id
  }

  console.log(id_usuario)
  if(id_usuario == id) {
    img = respuesta.img ? `/image?name=${respuesta.img}` : "/static/assets/default-user.jpg"
    profile.innerHTML=`
        <article id="usuario" class="usuario">
          <form id="uploadForm" method="post" enctype="multipart/form-data">
            <img src="${img}" class="perfil-usuario" id="propietario" onclick="triggerFileUpload()">
            <input type="file" id="fileInput" name="file" style="display: none;" onchange="uploadFile()">
            <span id="message"></span>
          </form>
          <h2 class="titulo">${respuesta.username}</h2> 
        </article>`
  }
  else {
    img = respuesta.img ? `/image?name=${respuesta.img}` : "/static/assets/default-user.jpg"
    profile.innerHTML=`
        <article id="usuario" class="usuario">
          <img src="${img}" class="perfil-usuario">
            <h2 class="titulo">${respuesta.username}</h2>
        </article>`
  }
}

function agregarArticulo(articulo) {
  articles.innerHTML += `
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
    const response = await fetch(`/articles?id=${id}`); // Obtener los datos de la pagina api.
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

function triggerFileUpload() {
  document.getElementById('fileInput').click();
}

async function uploadFile() {
  const formData = new FormData();
  formData.append('token', localStorage.getItem('token'));
  // Cambia 'image' por 'file' para que coincida con el nombre en el input
  formData.append('file', document.getElementById('fileInput').files[0]); 
  try {
    const response = await fetch('/change-pfp', {
        method: 'POST',
        body: formData
    });

    const result = await response.json();

    if (response.ok) {
      document.getElementById('message').innerHTML = `<p style="color: green;">${result.message}</p>`;
    } else {
      document.getElementById('message').innerHTML = `<p style="color: red;">Error: ${result.error}</p>`;
    }
  } catch (error) {
      console.error('Error al subir el archivo:', error);
      document.getElementById('message').innerHTML = `<p style="color: red;">Error al subir el archivo</p>`;
  }
}


mostrarArticulos()
visualizarPerfil()