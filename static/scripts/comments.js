document.getElementById("nuevo-comentario").addEventListener('submit', async function(e) {
    e.preventDefault(); // Prevenir el envío del formulario

    const token = localStorage.getItem("token");
    const comment = document.getElementById("texto");

    // Validar si hay un comentario
    if (!comment.value) {  
        alert("Por favor, escribe un comentario.");  
        return; 
    }

    const formData = new FormData();
    formData.append('token', token);
    formData.append('comment', comment.value);
    formData.append('article_id', article_id);

    try {
        const response = await fetch('/comment', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        if (response.ok) {  
            comment.value = "";
            abrirComentarios(article_id); // Refrescar los comentarios
        } else {
            alert(result.error || "Error al subir el comentario");  
        }
    } catch (error) {
        console.error('Error al publicar comentario:', error);
    }
});

let article_id;
const commentBox = document.getElementById("contenedor-comentarios");

// Mostrar los comentarios y desactivar el scroll en el cuerpo
async function abrirComentarios(x) {
    try {
        article_id = x;
        commentBox.style.display = "block";
        document.body.classList.add('no-scroll'); // Agregar clase para desactivar el scroll
        
        const response = await fetch(`/comment?id=${x}`);
        const comentarios = document.getElementById("comentarios");
        comentarios.innerHTML = "";

        if (!response.ok) {
            comentarios.innerHTML = "<p>Error al cargar comentarios.</p>";
            return;
        }

        const result = await response.json();

        if (result && Array.isArray(result) && result.length) {
            result.forEach(element => {
                comentarios.innerHTML += `
                <div class="comentario">
                    <p class="autor"><strong>${element.user}</strong></p>
                    <p class="texto">${element.text}</p>        
                    <button class="dar-like" onclick="anadirLikeComentario(${element.id})">🤍 
                        <span id="likes-comentario-${element.id}">${element.likes}</span>
                    </button>
                </div>`;
            });
        } else {
            comentarios.innerHTML = "<p>No hay comentarios disponibles.</p>";
        }
    } catch (error) {
        console.error('Error al cargar comentarios:', error);
        comentarios.innerHTML = "<p>Error al cargar comentarios.</p>";
    }
}

// Ocultar los comentarios y permitir el scroll en el cuerpo
function cerrarComentarios() {
    commentBox.style.display = "none";
    document.body.classList.remove('no-scroll'); // Quitar la clase para restaurar el scroll
}

async function anadirLikeComentario(commentID) {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Por favor, inicia sesión para dar like.");
        return;
    }

    const formData = new FormData();
    formData.append('token', token);
    formData.append('comment_id', commentID);

    try {
        const response = await fetch("/likes", {
            method: 'POST',
            body: formData
        });

        const result = await response.json();  // Parsear la respuesta a JSON
        if (response.ok) {
            actualizarLikesComentario(commentID, result.message)
        } else {
            // Si hay un error, mostrar el mensaje de error
            alert(result.error || "Error al procesar la solicitud.");
        }
    } catch (error) {
        console.error('Error al enviar el like:', error);
        alert("Hubo un error al enviar el like.");
    }
}

function actualizarLikesComentario(commentId, action) {
    const likesElement = document.getElementById(`likes-comentario-${commentId}`);
    const currentLikes = parseInt(likesElement.innerText, 10);
    if (action == "like agregado") {
        likesElement.innerText = currentLikes + 1;
    } else if (action == "like removido") {
        likesElement.innerText = currentLikes - 1;
    }
}