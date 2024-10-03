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