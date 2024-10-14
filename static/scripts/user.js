window.addEventListener('beforeunload', function (e) {
    if (localStorage.getItem("save") == "false") {
        logout();
    }
});

const ingreso = document.getElementById("icon-buttons");
const token = localStorage.getItem("token"); 

function logout() {
    const tempToken = localStorage.getItem("token");
    localStorage.clear();
    const data = JSON.stringify({ 
        token: tempToken, 
        message: 'El usuario ha cerrado la pestaña' 
    });
    
    navigator.sendBeacon('/logout', data);
    // Eliminar location.reload() si no es necesario.
}

if (token) {
    fetch(`/username?token=${token}`)
        .then(response => response.json())
        .then(user => {
            console.log(user)
            // Corregido: usas 'user' en lugar de 'result'
            const img = user.img ? `/image?name=${user.img}` : "/static/assets/default-user.jpg";
            
            ingreso.innerHTML = `
                <a href="/upload">Crear</a>
                <i class="fas fa-envelope"></i>
                <i class="fas fa-user-friends" id="toggle-friends-list" onclick="toggleFriendsList()"></i>
                <img src="${img}" alt="Usuario" onclick="if(confirm('¿desea cerrar sesion?')) logout();">
                <a href="/user?id=${user.id}" id="username">${user.username}</a>
            `;
        })
        .catch(error => console.error('Error al obtener el usuario:', error));
} else {
    ingreso.innerHTML = '<a href="/login">Login</a><a href="/register">Registrar</a>';
}
