document.getElementById('crear').addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append('token', sessionStorage.getItem('token'))
    formData.append('title', document.getElementById('title').value);
    formData.append('image', document.getElementById('image').files[0]);
    //formData.append('token', sessionStorage.getItem("userToken"));
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

