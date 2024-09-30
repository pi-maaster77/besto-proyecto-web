document.getElementById("nuevo-comentario").addEventListener('submit', async function(e) {
    e.preventDefault(); // Prevenir el envío del formulario

    const token = "hola";
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
            comment.value = ""
            abrirComentarios(article_id)
        } else {
            alert(result.error || "Error al subir el comentario");  
        }
    } catch (error) {
        console.error('Error al publicar comentario:', error);
    }
});

let article_id;  // Declarar article_id aquí
const commentBox = document.getElementById("contenedor-comentarios");
commentBox.style.display = "none"; 

async function abrirComentarios(x) {
    try {
        article_id = x;  
        commentBox.style.display = "block";
        document.body.style.overflow = 'hidden';
        const response = await fetch(`/comment?id=${x}`);
        const comentarios = document.getElementById("comentarios");
        comentarios.innerHTML = "";  
        const result = await response.json();
        
        if (result && result.length) {
            result.forEach(element => {
                comentarios.innerHTML += `<p>${element.text}</p>`;
            });
        } else {
            comentarios.innerHTML = "<p>No hay comentarios disponibles.</p>";
        }
    } catch (error) {
        console.error('Error al cargar comentarios:', error);
    }
}

function cerrarComentarios() {
    commentBox.style.display = "none"; 
    document.body.style.overflow = '';  
}