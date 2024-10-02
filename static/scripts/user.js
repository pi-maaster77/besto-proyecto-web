window.addEventListener('beforeunload', function (e) {
    const guardarSesion = sessionStorage.getItem("save");
    if (!guardarSesion) {
        const tempToken = sessionStorage.getItem("token");
        const data = JSON.stringify({ 
            token: tempToken, 
            message: 'El usuario ha cerrado la pestaña' 
        });
        
        console.log('Enviando solicitud de logout:', data); // Agregar esta línea para depuración
        navigator.sendBeacon('/logout', data);
    }
});

const token = sessionStorage.getItem("token"); 
if(token){
    fetch(`/username?token=${token}`)
        .then(response => response.json())
        .then(username => document.getElementById("username").innerHTML = username.username
        );
}