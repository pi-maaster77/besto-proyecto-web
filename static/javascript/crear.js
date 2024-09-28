document.getElementById("crear").addEventListener("submit", function (event) {// Subir el articulo.
    event.preventDefault();          
    respuesta = {
      nombre : document.getElementById("titulo").value,
      contenido : document.getElementById("contenido").value,
      imagenes : document.getElementById("imagen").value,
      autor : localStorage.getItem("username")
    }; // Obtener el contenido de la encuesta.
    fetch("/crear", { // Enviar el articulo al servidor usando el metodo POST
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }, 
      body: JSON.stringify(respuesta)
      })
      .then(response => response.json())
      .then(window.location.href = "/") // Volver al inicio.
      .catch(error => console.error("Error al enviar la respuesta:", error));
  });


  document.getElementById('crear').addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append('titulo', document.getElementById('title').value);
    formData.append('image', document.getElementById('image').files[0]);
    formData.append(localStorage.getItem("userToken"));
    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            document.getElementById('message').innerHTML = `<p style="color: green;">${result.message}</p>`;
            setTimeout(function() {
              window.location.href = "/"
            }, 2000);

        } else {
            document.getElementById('message').innerHTML = `<p style="color: red;">Error: ${result.error}</p>`;
        }
    } catch (error) {
        console.error('Error al subir el archivo:', error);
        document.getElementById('message').innerHTML = `<p style="color: red;">Error al subir el archivo</p>`;
    }
});