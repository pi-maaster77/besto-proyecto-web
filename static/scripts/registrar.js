import { sha256 } from '/static/scripts/encriptar.js';
console.log(sha256("hola"))

document.getElementById('registrar').addEventListener('submit', async function(e) {
    e.preventDefault(); // Prevenir el envío del formulario

    const user = document.getElementById("user").value;
    const passwd = document.getElementById("passwd").value;
    const cpasswd = document.getElementById("cpasswd").value;

    if (cpasswd !== passwd) {
        document.getElementById("mensajeError").innerHTML = "Error al crear la cuenta: las contraseñas no coinciden";
    } else {
        const hash = await sha256(passwd); // Asegúrate de que sha256 esté correctamente definido
        console.log(`Usuario: ${user}, Contraseña (hashed): ${hash}`); // Depuración

        const formData = new FormData();
        formData.append('passwd', hash);
        formData.append('user', user);

        try {
            const response = await fetch('/register', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                document.getElementById('mensajeError').innerHTML = `<p style="color: green;">${result.message}</p>`;
                setTimeout(() => {
                    window.location.href = "/";
                }, 2000);
            } else {
                document.getElementById('mensajeError').innerHTML = `<p style="color: red;">Error: ${result.error}</p>`;
            }
        } catch (error) {
            console.error('Error al registrar:', error);
            document.getElementById('mensajeError').innerHTML = `<p style="color: red;">Error al registrar</p>`;
        }
    }
});