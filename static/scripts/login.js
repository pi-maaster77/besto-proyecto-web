window.addEventListener('beforeunload', function (e) {
    const guardarSesion = sessionStorage.getItem("save"); // No necesitas "this" aquí
    if (!guardarSesion) { // Verifica si no se debe guardar la sesión
        const tempToken = sessionStorage.getItem("token");
        const url = '/logout';
        const data = JSON.stringify({ 
            token: tempToken, 
            message: 'El usuario ha cerrado la pestaña' 
        });
        
        // Enviar la solicitud con sendBeacon
        navigator.sendBeacon(url, data);
    }
});

// Importar la función sha256
import { sha256 } from '/static/scripts/encriptar.js';
console.log(sha256("hola"));

document.getElementById('ingresar').addEventListener('submit', async function(e) {
    e.preventDefault(); // Prevenir el envío del formulario

    const user = document.getElementById("user").value;
    const passwd = document.getElementById("passwd").value;

    if (!passwd) {
        document.getElementById("mensajeError").innerHTML = "Error: no hay contraseña";
        return; // Salir si no hay contraseña
    }

    const hash = await sha256(passwd); // Asegúrate de que sha256 esté correctamente definido
    console.log(`Usuario: ${user}, Contraseña (hashed): ${hash}`); // Depuración

    const formData = new FormData();
    formData.append('passwd', hash);
    formData.append('user', user);

    try {
        const response = await fetch('/login', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            document.getElementById('mensaje').innerHTML = `<p style="color: green;">${result.message}</p>`;
            sessionStorage.setItem("token", result.token);
            sessionStorage.setItem("save", confirm("¿mantener la sesión iniciada?"));
            setTimeout(() => {
                window.location.href = "/";
            }, 2000);
        } else {
            document.getElementById('mensaje').innerHTML = `<p style="color: red;">Error: ${result.error}</p>`;
        }
    } catch (error) {
        console.error('Error al registrar:', error);
        document.getElementById('mensajeError').innerHTML = `<p style="color: red;">Error al registrar</p>`;
    }
});
