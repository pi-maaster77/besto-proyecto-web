async function anadirLike(articleID) {
    const token = sessionStorage.getItem("token");

    if (!token) {
        alert("Por favor, inicia sesión para dar like.");
        return;
    }

    const formData = new FormData();
    formData.append('token', token);
    formData.append('articleID', articleID);

    try {
        const response = await fetch("/likes", {
            method: 'POST',
            body: formData
        });

        const result = await response.json();  // Parsear la respuesta a JSON

        if (response.ok) {
            actualizarLikes()
        } else {
            // Si hay un error, mostrar el mensaje de error
            alert(result.error || "Error al procesar la solicitud.");
        }
    } catch (error) {
        console.error('Error al enviar el like:', error);
        alert("Hubo un error al enviar el like.");
    }
}

async function actualizarLikes() {
    try {
      const response = await fetch(`/likes`); // Obtener todos los artículos nuevamente
      if (!response.ok) {
        throw new Error(`Error al obtener datos del servidor: ${response.status}`);
      }
  
      const data = await response.json(); // Convertir la respuesta a JSON
  
      for (const articulo of data) {
        const likesElement = document.getElementById(`likes-${articulo.id}`);
        if (likesElement) {
          likesElement.textContent = articulo.likes; // Actualizar la cantidad de likes en la página
        }
      }
    } catch (error) {
      console.error(`Error al actualizar los likes: ${error}`);
    }
}

setInterval(actualizarLikes, 10000); // Actualizar cada 10 segundos