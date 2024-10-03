document.getElementById("nuevo-comentario").addEventListener('submit', async function(e) {
    e.preventDefault(); // Prevenir el envío del formulario

    const token = sessionStorage.getItem("token"); // Asegúrate de no tener espacios en blanco
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
