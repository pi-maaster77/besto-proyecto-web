window.addEventListener('beforeunload', function (e) {
    if (localStorage.getItem("save") == "false") {
        logout()
    }
});

const token = localStorage.getItem("token"); 
if(token){
    fetch(`/username?token=${token}`)
        .then(response => response.json())
        .then(username => document.getElementById("username").innerHTML = username.username
        );
}

function logout(){
    const tempToken = localStorage.getItem("token");
    localStorage.clear()
    const data = JSON.stringify({ 
        token: tempToken, 
        message: 'El usuario ha cerrado la pestaña' 
    });
    
    console.log('Enviando solicitud de logout:', data); // Agregar esta línea para depuración
    navigator.sendBeacon('/logout', data);
    location.reload();

}

const ingreso = document.getElementById("icon-buttons")

if (localStorage.length == 0) {
    ingreso.innerHTML='<a href="/login">Login</a><a href="/register">Registrar</a>'
}  else {
    ingreso.innerHTML=`<a href="/upload">Crear</a>
    <i class="fas fa-envelope"></i>
    <i class="fas fa-user-friends" id="toggle-friends-list" onclick="toggleFriendsList()"></i>
    <img src="/static/assets/default-user.png" alt="Usuario" onclick="if(confirm('¿desea cerrar sesion?')) logout();">
    <a href="perfil.html" id="username">...</a>`
}