import { sha256 } from '/static/scripts/encriptar.js';

document.getElementById('registrar').addEventListener('submit', async function(e) {
    e.preventDefault(); // Prevenir el envío del formulario

    const user = document.getElementById("user").value;
    const passwd = document.getElementById("passwd").value;
    const cpasswd = document.getElementById("cpasswd").value;

    if (cpasswd !== passwd) {
        document.getElementById("mensajeError").innerHTML = "Error al crear la cuenta: las contraseñas no coinciden";
    } else {
        const hash = await sha256(passwd); // Asegúrate de que sha256 esté correctamente definido

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
                document.getElementById('mensaje').innerHTML = `<p style="color: green;">${result.message}</p>`;
                const response2 = await fetch('/login', {
                    method: 'POST',
                    body: formData
                });
                const result2 = await response2.json();
                if(result){
                    // Almacenar el token en localStorage
                    localStorage.setItem("token", result2.token);
                    localStorage.setItem("save", confirm("¿mantener la sesión iniciada?"));
                }

                // Redirigir después de 2 segundos
                setTimeout(() => {
                    window.location.href = "/";
                }, 2000);
            } else {
                document.getElementById('mensaje').innerHTML = `<p style="color: red;">Error: ${result.error}</p>`;
            }
        } catch (error) {
            console.error('Error al registrar:', error);
            document.getElementById('mensaje').innerHTML = `<p style="color: red;">Error al registrar</p>`;
        }
    }
});
